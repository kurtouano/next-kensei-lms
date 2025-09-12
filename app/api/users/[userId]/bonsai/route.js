import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import User from "@/models/User"
import Bonsai from "@/models/Bonsai"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { userId } = await params

    // Find user
    const user = await User.findById(userId)
      .populate({
        path: "bonsai",
        select: "level customization ownedItems milestones",
      })
      .select("name email icon")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      bonsai: user.bonsai,
    })
  } catch (error) {
    console.error("Error fetching user bonsai:", error)
    return NextResponse.json(
      { error: "Failed to fetch bonsai data" },
      { status: 500 }
    )
  }
}
