import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDb();

    // Get pagination parameters from query string
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5;
    const skip = (page - 1) * limit;

    // Get notifications for the current user, sorted by newest first
    const notifications = await Notification.find({
      recipient: session.user.id
    })
    .populate('sender', 'name icon')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    return NextResponse.json({
      success: true,
      notifications: notifications,
      page: page,
      limit: limit,
      hasMore: notifications.length === limit
    });

  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
