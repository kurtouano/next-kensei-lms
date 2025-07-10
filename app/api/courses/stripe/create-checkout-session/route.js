// app/api/courses/stripe/create-checkout-session/route.js - FREE COURSE SUPPORT
import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDb } from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import Progress from '@/models/Progress';
import Activity from '@/models/Activity';

export async function POST(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User must be logged in to enroll in a course' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // DEBUG: Log incoming data
    console.log('=== CHECKOUT API DEBUG ===')
    console.log('Received data:', data)
    console.log('User email:', session.user.email)
    console.log('========================')
    
    // Validation
    const validationErrors = [];
    
    if (!data.courseId) {
      validationErrors.push('courseId is required');
    }
    if (!data.title) {
      validationErrors.push('title is required');
    }
    if (data.price === undefined || data.price === null) {
      validationErrors.push('price is required');
    }
    
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return NextResponse.json(
        { error: `Missing required course data: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    // Process the data
    const processedData = {
      ...data,
      price: Number(data.price) || 0,
      description: data.description || data.title || 'Course enrollment',
      thumbnail: data.thumbnail || ''
    };

    // 🆕 NEW: Check if course is FREE
    if (processedData.price === 0) {
      console.log('🆓 FREE COURSE detected! Processing direct enrollment...');
      
      // Handle free course enrollment directly (no Stripe)
      await connectDb();

      // Find user and course
      const [user, course] = await Promise.all([
        User.findOne({ email: session.user.email }),
        Course.findById(processedData.courseId)
      ]);

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      // Check if user is already enrolled
      const isAlreadyEnrolled = user.enrolledCourses.includes(processedData.courseId);
      
      if (isAlreadyEnrolled) {
        console.log('📚 User already enrolled in free course, redirecting to success...');
        // Still redirect to success page for consistent UX
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        const successUrl = `${origin}/courses/enroll-success?free=true&courseId=${processedData.courseId}`;
        return NextResponse.json({ url: successUrl });
      }

      // Enroll user in free course
      console.log('✅ Enrolling user in free course...');
      
      // Add course to user's enrolled courses
      user.enrolledCourses.push(processedData.courseId);
      
      // Add credits if course has credit reward
      if (course.creditReward > 0) {
        user.credits += course.creditReward;
      }

      // Create progress record
      const progressRecord = new Progress({
        user: user._id,
        course: processedData.courseId,
        status: 'not_started',
        enrolledAt: new Date()
      });
      
      await progressRecord.save();
      
      // Add progress record to user
      user.progressRecords.push(progressRecord._id);
      await user.save();

      // Update course statistics
      course.enrolledStudents += 1;
      
      // Update revenue tracking (free enrollment)
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = course.revenue.monthly.find(m => m.month === currentMonth);
      
      if (monthlyRevenue) {
        monthlyRevenue.enrollments += 1;
        // amount stays 0 for free courses
      } else {
        course.revenue.monthly.push({
          month: currentMonth,
          amount: 0,
          enrollments: 1
        });
      }
      
      course.revenue.lastUpdated = new Date();
      await course.save();

      // Create activity record for instructor
      try {
        const enrollmentActivity = new Activity({
          instructor: course.instructor,
          course: processedData.courseId,
          user: user._id,
          type: 'student_enrolled',
          metadata: {
            enrollmentPrice: 0
          }
        });
        
        await enrollmentActivity.save();
        console.log('✅ Free enrollment activity created');
      } catch (activityError) {
        console.error('Failed to create enrollment activity:', activityError);
      }

      // Redirect to success page for free course
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      const successUrl = `${origin}/courses/enroll-success?free=true&courseId=${processedData.courseId}`;
      
      console.log('🎉 Free course enrollment complete! Redirecting to:', successUrl);
      return NextResponse.json({ url: successUrl });
    }

    // 💳 PAID COURSE: Continue with Stripe checkout
    console.log('💳 PAID COURSE: Creating Stripe checkout session...');
    console.log('Creating checkout session for:', {
      courseId: processedData.courseId,
      title: processedData.title,
      price: processedData.price,
      userEmail: session.user.email,
      thumbnail: processedData.thumbnail // Add this to debug
    });

    // 🔧 FIX: Remove thumbnail to avoid URL issues with Stripe
    const validatedData = {
      ...processedData,
      thumbnail: undefined // Remove thumbnail entirely for Stripe checkout
    };

    const stripeSession = await createCheckoutSession(validatedData);
    
    if (!stripeSession || !stripeSession.url) {
      console.error('Invalid stripe session response:', stripeSession);
      return NextResponse.json(
        { error: 'Failed to create valid checkout session' },
        { status: 500 }
      );
    }
    
    console.log('Checkout session created successfully:', stripeSession.url);
    
    return NextResponse.json({ url: stripeSession.url });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    const errorMessage = error.message || 'Failed to create checkout session';
    const statusCode = error.statusCode || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}