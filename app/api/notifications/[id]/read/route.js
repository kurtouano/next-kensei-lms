import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import sseManager from "@/lib/sseManager";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Notification ID is required" },
        { status: 400 }
      );
    }

    await connectDb();

    // Find and update the notification
    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: session.user.id
      },
      {
        read: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    // Update notification count for user
    try {
      const notificationCount = await Notification.countDocuments({
        recipient: session.user.id,
        read: false
      });
      sseManager.sendNotificationCountUpdate(session.user.id, notificationCount);
    } catch (error) {
      console.error('Error updating notification count:', error);
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      notification: notification
    });

  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
