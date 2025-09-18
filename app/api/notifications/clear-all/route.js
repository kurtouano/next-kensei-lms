import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDb } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import sseManager from "@/lib/sseManager";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDb();

    // Delete all notifications for the current user
    const result = await Notification.deleteMany({
      recipient: session.user.id
    });

    // Update notification count for user
    try {
      sseManager.sendNotificationCountUpdate(session.user.id, 0);
    } catch (error) {
      console.error('Error updating notification count:', error);
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Clear all notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear notifications" },
      { status: 500 }
    );
  }
}
