// app/api/courses/stripe/enroll-success/route.js
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { connectDb } from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const courseId = searchParams.get('courseId');

    console.log('Enroll Success API called with:', { sessionId, courseId });

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDb();

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session payment status:', session.payment_status);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get the current user session
    const userSession = await getServerSession(authOptions);
    
    if (!userSession?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log('User session email:', userSession.user.email);

    // Find the user and course
    const user = await User.findOne({ email: userSession.user.email });
    const course = await Course.findById(courseId);

    if (!user || !course) {
      console.log('User or course not found:', { user: !!user, course: !!course });
      return NextResponse.json(
        { error: 'User or course not found' },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const isAlreadyEnrolled = user.enrolledCourses.includes(courseId);
    console.log('Is already enrolled:', isAlreadyEnrolled);

    if (!isAlreadyEnrolled) {
      // Add course to user's enrolled courses
      user.enrolledCourses.push(courseId);
      
      // Add credits to user if course has credit reward
      if (course.creditReward > 0) {
        user.credits += course.creditReward;
      }

      // Create progress record
      const progressRecord = new Progress({
        user: user._id,
        course: courseId,
        status: 'not_started',
        enrolledAt: new Date()
      });
      
      await progressRecord.save();
      console.log('Progress record created:', progressRecord._id);
      
      // Add progress record to user
      user.progressRecords.push(progressRecord._id);

      // Save user changes
      await user.save();
      console.log('User updated with enrolled course');

      // Update course statistics
      course.enrolledStudents += 1;
      
      // Update revenue tracking
      const currentMonth = new Date().toISOString().slice(0, 7); // "2025-06"
      const monthlyRevenue = course.revenue.monthly.find(m => m.month === currentMonth);
      
      if (monthlyRevenue) {
        monthlyRevenue.amount += session.amount_total / 100; // Convert from cents
        monthlyRevenue.enrollments += 1;
      } else {
        course.revenue.monthly.push({
          month: currentMonth,
          amount: session.amount_total / 100,
          enrollments: 1
        });
      }
      
      course.revenue.total += session.amount_total / 100;
      course.revenue.lastUpdated = new Date();

      // Save course changes
      await course.save();
      console.log('Course statistics updated');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      courseName: course.title,
      amount: session.amount_total,
      creditsEarned: course.creditReward,
      message: 'Course enrollment successful'
    });

  } catch (error) {
    console.error('Error processing successful payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}