// app/api/courses/[slug]/reviews/route.js
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import Rating from "@/models/Rating";
import User from "@/models/User";

// GET - Fetch all reviews for a course
export async function GET(request, { params }) {
  await connectDb();

  try {
    const { slug } = await params;

    // Find the course by slug
    const course = await Course.findOne({ slug }).lean();
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch all ratings/reviews for this course
    const ratings = await Rating.find({ courseId: course._id })
      .populate({
        path: 'user',
        select: 'name email image'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Format reviews for frontend
    const reviews = ratings.map(rating => ({
      id: rating._id.toString(),
      rating: rating.rating,
      comment: rating.review || "",
      isLiked: rating.isLiked || false,
      createdAt: new Date(rating.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      user: {
        name: rating.user?.name || "Anonymous",
        email: rating.user?.email || "",
        avatar: rating.user?.image || null
      }
    }));

    // Calculate statistics
    const totalReviews = ratings.length;
    const averageRating = totalReviews > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalReviews 
      : 0;

    return NextResponse.json({
      success: true,
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      distribution: calculateRatingDistribution(ratings)
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" }, 
      { status: 500 }
    );
  }
}

// POST - Create or update a review
export async function POST(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { rating, comment } = await request.json();

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" }, 
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment is required" }, 
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { error: "Comment must be 500 characters or less" }, 
        { status: 400 }
      );
    }

    // Find the course
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a review for this course
    const existingRating = await Rating.findOne({
      courseId: course._id,
      user: user._id
    });

    let savedRating;

    if (existingRating) {
      // Update existing review
      existingRating.rating = rating;
      existingRating.review = comment.trim();
      savedRating = await existingRating.save();
    } else {
      // Create new review
      const newRating = new Rating({
        courseId: course._id,
        user: user._id,
        rating: Number(rating),
        review: comment.trim(),
        isLiked: false
      });
      savedRating = await newRating.save();
    }

    // Update course rating statistics
    await updateCourseRatingStats(course._id);

    return NextResponse.json({
      success: true,
      message: existingRating ? "Review updated successfully" : "Review created successfully",
      reviewId: savedRating._id.toString()
    });

  } catch (error) {
    console.error("Error creating/updating review:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already reviewed this course" }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to save review" }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete user's review
export async function DELETE(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Find the course
    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find and delete the rating
    const deletedRating = await Rating.findOneAndDelete({
      courseId: course._id,
      user: user._id
    });

    if (!deletedRating) {
      return NextResponse.json(
        { error: "Review not found" }, 
        { status: 404 }
      );
    }

    // Update course rating statistics
    await updateCourseRatingStats(course._id);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" }, 
      { status: 500 }
    );
  }
}

// Helper function to calculate rating distribution
function calculateRatingDistribution(ratings) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  ratings.forEach(rating => {
    if (distribution.hasOwnProperty(rating.rating)) {
      distribution[rating.rating]++;
    }
  });

  return distribution;
}

// Helper function to update course rating statistics
async function updateCourseRatingStats(courseId) {
  try {
    const ratings = await Rating.find({ courseId }).lean();
    
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
      : 0;
    
    const distribution = calculateRatingDistribution(ratings);

    await Course.findByIdAndUpdate(courseId, {
      'ratingStats.averageRating': Number(averageRating.toFixed(1)),
      'ratingStats.totalRatings': totalRatings,
      'ratingStats.distribution': distribution,
      'ratingStats.lastUpdated': new Date()
    });

  } catch (error) {
    console.error("Error updating course rating stats:", error);
  }
}