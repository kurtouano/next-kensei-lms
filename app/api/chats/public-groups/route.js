import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Chat from "@/models/Chat"
import User from "@/models/User"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 20
    const page = parseInt(searchParams.get('page')) || 1

    // Build query for public groups
    const query = {
      isPublic: true,
      isActive: true,
      type: "public_group"
    }

    // Get public groups with pagination
    const skip = (page - 1) * limit
    const publicGroups = await Chat.find(query)
      .populate('createdBy', 'name email role icon bonsai')
      .populate('participants', 'name email role icon bonsai')
      .sort({ participantCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalCount = await Chat.countDocuments(query)

    // Check which groups the current user has joined
    const userJoinedGroups = await Chat.find({
      participants: session.user.id,
      isPublic: true,
      isActive: true
    }).select('_id').lean()

    const joinedGroupIds = userJoinedGroups.map(group => group._id.toString())

    // Format the response
    const formattedGroups = publicGroups.map(group => ({
      id: group._id.toString(),
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      members: group.participantCount,
      maxMembers: group.maxMembers,
      createdBy: {
        id: group.createdBy._id.toString(),
        name: group.createdBy.name,
        role: group.createdBy.role,
        icon: group.createdBy.icon,
        bonsai: group.createdBy.bonsai
      },
      isJoined: joinedGroupIds.includes(group._id.toString()),
      createdAt: group.createdAt,
      lastActivity: group.lastActivity
    }))

    return NextResponse.json({
      groups: formattedGroups,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: page * limit < totalCount
      }
    })

  } catch (error) {
    console.error("Error fetching public groups:", error)
    return NextResponse.json(
      { error: "Failed to fetch public groups" },
      { status: 500 }
    )
  }
}
