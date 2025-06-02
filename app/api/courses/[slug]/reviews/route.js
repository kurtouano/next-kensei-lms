// API Route: /api/courses/[slug]/reviews/route.js - Your working version with minor improvements
import { connectDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Course from "@/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch all reviews for a course
export async function GET(request, { params }) {
  await connectDb();

  try {
    const { slug } = await params;

    const course = await Course.findOne({ slug })
      .populate({
        path: 'ratings.user',
        select: 'name icon email'
      })
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Format reviews for frontend - filter out any ratings without users
    const reviews = course.ratings
      .filter(rating => rating.user) // Only include ratings with valid users
      .map(rating => ({
        id: rating._id?.toString() || Math.random().toString(),
        user: {
          name: rating.user?.name || 'Anonymous',
          avatar: rating.user?.icon || null, // Changed from '/placeholder.svg' to null for User icon
          email: rating.user?.email
        },
        rating: rating.rating,
        comment: rating.review || '',
        isLiked: rating.isLiked || false,
        createdAt: new Date(rating.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Most recent first

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0;

    return NextResponse.json({ 
      success: true,
      reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST - Add a new review
export async function POST(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json({ error: "Review comment is required" }, { status: 400 });
    }

    if (comment.trim().length > 500) {
      return NextResponse.json({ error: "Comment must be 500 characters or less" }, { status: 400 });
    }

    const course = await Course.findOne({ slug });
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user already reviewed this course - add safety check
    const existingReviewIndex = course.ratings.findIndex(
      r => r.user && r.user.toString() === session.user.id
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      course.ratings[existingReviewIndex] = {
        user: session.user.id,
        rating: parseInt(rating),
        review: comment.trim(),
        isLiked: course.ratings[existingReviewIndex].isLiked || false, // Preserve like status
        createdAt: new Date()
      };
    } else {
      // Add new review
      course.ratings.push({
        user: session.user.id,
        rating: parseInt(rating),
        review: comment.trim(),
        isLiked: false,
        createdAt: new Date()
      });
    }

    await course.save();

    // Fetch the updated course with populated user data
    const updatedCourse = await Course.findOne({ slug })
      .populate({
        path: 'ratings.user',
        select: 'name icon email'
      })
      .lean();

    // Return the new/updated review - add safety check
    const userReview = updatedCourse.ratings.find(
      r => r.user && r.user._id && r.user._id.toString() === session.user.id
    );

    if (!userReview) {
      return NextResponse.json({ error: "Failed to retrieve updated review" }, { status: 500 });
    }

    const formattedReview = {
      id: userReview._id?.toString() || Math.random().toString(),
      user: {
        name: userReview.user.name,
        avatar: userReview.user.icon || null, // Changed from '/placeholder.svg' to null
        email: userReview.user.email
      },
      rating: userReview.rating,
      comment: userReview.review,
      isLiked: userReview.isLiked,
      createdAt: new Date(userReview.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    return NextResponse.json({ 
      success: true, 
      review: formattedReview,
      message: existingReviewIndex !== -1 ? "Review updated successfully" : "Review added successfully"
    });

  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json({ error: "Failed to add review" }, { status: 500 });
  }
}

// PUT - Update a review (like/unlike)
export async function PUT(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { action } = body; // 'like' or 'unlike'

    const course = await Course.findOne({ slug });
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Find user's review - add safety check
    const reviewIndex = course.ratings.findIndex(
      r => r.user && r.user.toString() === session.user.id
    );

    if (reviewIndex === -1) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update like status
    course.ratings[reviewIndex].isLiked = action === 'like';
    await course.save();

    return NextResponse.json({ 
      success: true, 
      message: `Review ${action}d successfully`
    });

  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE - Delete a review
export async function DELETE(request, { params }) {
  await connectDb();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { slug } = await params;

    const course = await Course.findOne({ slug });
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Remove user's review - add safety check
    const initialLength = course.ratings.length;
    course.ratings = course.ratings.filter(
      r => r.user && r.user.toString() !== session.user.id
    );

    if (course.ratings.length === initialLength) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await course.save();

    return NextResponse.json({ 
      success: true, 
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}