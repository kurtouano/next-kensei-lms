import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { notificationIds } = await req.json();
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Notification IDs are required" },
        { status: 400 }
      );
    }

    await connectDb();

    // Mark all specified notifications as read for the current user
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: session.user.id
      },
      {
        read: true
      }
    );

    return NextResponse.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
