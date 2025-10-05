import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import Bonsai from "@/models/Bonsai.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDb();
    const { name, email, password, provider, providerId} = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    let hashedPassword = null;
    let emailVerificationToken = null;
    let emailVerificationExpires = null;
    
    if (provider === "credentials") {
        hashedPassword = await bcryptjs.hash(password, 10);
        // Generate email verification token for credentials signup
        emailVerificationToken = crypto.randomBytes(32).toString('hex');
        emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    const createUser = await User.create({ // Create new user in DB credentials/google
      name,
      email,
      password: hashedPassword,
      provider,
      providerId,
      emailVerificationToken,
      emailVerificationExpires,
      icon: 'bonsai', // Set default bonsai icon
      credits: 150, // Give new users 150 initial credits
      lifetimeCredits: 150, // Track lifetime credits earned
    });

    // Create bonsai with proper defaults
    const defaultMilestones = Bonsai.getDefaultMilestones();
    const defaultOwnedItems = Bonsai.getDefaultOwnedItems();
    
    const bonsai = await Bonsai.create({ 
      userRef: createUser._id,
      level: 1,
      totalCredits: 150, // Match user's initial lifetime credits
      milestones: defaultMilestones,
      customization: {
        eyes: 'default_eyes',
        mouth: 'default_mouth',
        foliageColor: '#77DD82',
        potStyle: 'default_pot',
        potColor: '#FD9475',
        groundStyle: 'default_ground',
        decorations: []
      },
      ownedItems: defaultOwnedItems
    });
    
    createUser.bonsai = bonsai._id;
    await createUser.save();
    
    // Send verification email for credentials signup
    if (provider === "credentials") {
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
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Welcome to Jotatsu Academy!</h1>
                  <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 300;">Please verify your email to get started</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Almost there, ${name}!</h2>
                  <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">Thank you for signing up! To complete your registration and start your Japanese learning journey, please verify your email address by clicking the button below.</p>
                  
                  <!-- Verification Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #4a7c59; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                      Verify My Email Address
                    </a>
                  </div>
                  
                  <!-- What happens next -->
                  <div style="background-color: #f9fafb; border-left: 4px solid #4a7c59; border-radius: 0 8px 8px 0; padding: 20px; margin: 30px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What happens next?</h3>
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                      <div style="background-color: #4a7c59; border-radius: 50%; width: 24px; height: 24px; margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 12px; font-weight: bold; line-height: 1; padding-left: 5px; padding-top: 3px;">1</span>
                      </div>
                      <span style="color: #374151; font-size: 15px;">Click the verification button above</span>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                      <div style="background-color: #4a7c59; border-radius: 50%; width: 24px; height: 24px; margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 12px; font-weight: bold; line-height: 1; padding-left: 5px; padding-top: 3px;">2</span>
                      </div>
                      <span style="color: #374151; font-size: 15px;">You'll be redirected to the login page</span>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 0;">
                      <div style="background-color: #4a7c59; border-radius: 50%; width: 24px; height: 24px; margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 12px; font-weight: bold; line-height: 1; padding-left: 5px; padding-top: 3px;">3</span>
                      </div>
                      <span style="color: #374151; font-size: 15px;">Start your Japanese learning adventure!</span>
                    </div>
                  </div>
                  
                  <!-- Security Note -->
                  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">Security Note: This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.</p>
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

        console.log("Verification email sent to:", email);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the signup if email fails, just log it
      }
    }
    
    return NextResponse.json({ message: "User is Registered" }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}