import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDb();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    // Find user with the verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      return NextResponse.json({ 
        error: "Invalid or expired verification token" 
      }, { status: 400 });
    }

    // Verify the user's email
    user.emailVerified = new Date();
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return NextResponse.json({ 
      message: "Email verified successfully! You can now log in." 
    }, { status: 200 });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    await connectDb();

    // Find user with the verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      return NextResponse.json({ 
        error: "Invalid or expired verification token" 
      }, { status: 400 });
    }

    // Verify the user's email
    user.emailVerified = new Date();
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Redirect to verification page with success
    const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
    return NextResponse.redirect(new URL('/auth/verify-email?verified=true', baseUrl));

  } catch (error) {
    console.error('Email verification error:', error);
    const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', baseUrl));
  }
}
