import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import User from "@/models/User.js";

export async function GET(req) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    console.log('Verifying reset token:', token);

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Token matches:', user.passwordResetToken === token);
      console.log('Token expires:', user.passwordResetExpires);
      console.log('Current time:', new Date());
      console.log('Token valid:', user.passwordResetExpires > new Date());
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    return NextResponse.json({ message: "Valid reset token" }, { status: 200 });

  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
