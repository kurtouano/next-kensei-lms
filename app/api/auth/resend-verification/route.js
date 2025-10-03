import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDb();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user with this email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ 
        error: "No account found with this email address" 
      }, { status: 404 });
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        error: "This email is already verified" 
      }, { status: 400 });
    }

    // Check if user is using credentials (not Google)
    if (user.provider !== "credentials") {
      return NextResponse.json({ 
        error: "This email is registered with Google. Please use 'Sign in with Google' instead." 
      }, { status: 400 });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email using Resend
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${emailVerificationToken}`;
      
      await resend.emails.send({
        from: 'Jotatsu Academy <noreply@jotatsu.com>',
        to: [email],
        subject: 'Verify Your Email - Jotatsu Academy',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - Jotatsu Academy</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #4a7c59 0%, #6b8e6b 100%); padding: 40px 30px; text-align: center;">
                <div style="background-color: rgba(255, 255, 255, 1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.2);">
                  <img src="https://jotatsu.com/jotatsu_logo.png" alt="Jotatsu Academy" style="width: 50px; padding-left: 20px; padding-top: 18px; height: 45px; object-fit: contain;">
                </div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Verify Your Email</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 300;">Complete your account setup</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Welcome to Jotatsu Academy!</h2>
                  <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6;">Hi ${user.name}, please verify your email address to complete your account setup and start your Japanese learning journey.</p>
                </div>
                
                <!-- Verification Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" style="background-color: #4a7c59; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                    Verify Email Address
                  </a>
                </div>
                
                <!-- Alternative Link -->
                <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                  <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">If the button doesn't work, copy and paste this link:</p>
                  <p style="color: #4a7c59; margin: 0; font-size: 12px; word-break: break-all; font-family: monospace;">${verificationUrl}</p>
                </div>
                
                <!-- Important Note -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">⏰ This verification link will expire in 24 hours for security reasons.</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f3f4f6; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">© 2024 Jotatsu Academy. All rights reserved.</p>
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });

      return NextResponse.json({ 
        message: "Verification email sent successfully" 
      }, { status: 200 });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({ 
        error: "Failed to send verification email. Please try again." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
