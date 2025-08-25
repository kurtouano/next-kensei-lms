import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
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

              // Count only unread notifications for the current user
    const count = await Notification.countDocuments({
      recipient: session.user.id,
      read: false
    });

    return NextResponse.json({
      success: true,
      count: count
    });

  } catch (error) {
    console.error("Notification count error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get notification count" },
      { status: 500 }
    );
  }
}
