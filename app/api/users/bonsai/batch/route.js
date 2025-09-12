import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import User from "@/models/User"
import Bonsai from "@/models/Bonsai"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "User IDs required" }, { status: 400 })
    }

    // Limit to prevent abuse
    if (userIds.length > 50) {
      return NextResponse.json({ error: "Too many user IDs" }, { status: 400 })
    }

    // Find users with their bonsai data
    const users = await User.find({
      _id: { $in: userIds }
    })
      .populate({
        path: "bonsai",
        select: "level customization ownedItems milestones",
      })
      .select("name email icon")

    const bonsaiData = users.map(user => ({
      userId: user._id,
      bonsai: user.bonsai,
    }))

    return NextResponse.json({
      success: true,
      bonsaiData,
    })
  } catch (error) {
    console.error("Error fetching batch bonsai data:", error)
    return NextResponse.json(
      { error: "Failed to fetch bonsai data" },
      { status: 500 }
    )
  }
}
