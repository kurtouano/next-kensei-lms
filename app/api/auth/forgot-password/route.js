import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDb();
    const { email } = await req.json();

    // Check if user exists and uses credentials provider
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email address" }, { status: 404 });
    }

    // Check if user signed up with Google (no password reset for OAuth users)
    if (user.provider === "google") {
      return NextResponse.json({ 
        error: "This account was created with Google. Please use 'Continue with Google' to sign in." 
      }, { status: 400 });
    }

    // Check if email is verified (required for password reset)
    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: "Please verify your email address first. Check your inbox for a verification link." 
      }, { status: 400 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpires;
    await user.save();

    console.log('Reset token saved:', resetToken);
    console.log('Token expires at:', resetTokenExpires);

    // Send reset email
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
      
      await resend.emails.send({
        from: 'Jotatsu Academy <noreply@jotatsu.com>',
        to: [email],
        subject: 'Reset Your Password - Jotatsu Academy',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - Jotatsu Academy</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #4a7c59 0%, #6b8e6b 100%); padding: 40px 30px; text-align: center;">
                <div style="background-color: rgba(255, 255, 255, 1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.2);">
                  <img src="https://jotatsu.com/jotatsu_logo.png" alt="Jotatsu Academy" style="width: 50px; padding-left: 20px; padding-top: 18px; height: 45px; object-fit: contain;">
                </div>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello ${user.name}!</h2>
                <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password.</p>
                
                <!-- Reset Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #4a7c59; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                    Reset My Password
                  </a>
                </div>
                
                <!-- Security Note -->
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">Security Note: This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f3f4f6; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">© 2024 Jotatsu Academy. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });

      console.log("Password reset email sent to:", email);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Password reset email sent" }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
