import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import ChatParticipant from "@/models/ChatParticipant"
import User from "@/models/User"

// Store active connections
const connections = new Map()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get("chatId")

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 })
    }

    // Verify user is participant in this chat
    const participation = await ChatParticipant.findOne({
      chat: chatId,
      user: user._id,
      isActive: true,
    })

    if (!participation) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Create SSE response
    const stream = new ReadableStream({
      start(controller) {
        // Store connection
        const connectionId = `${user._id}-${chatId}-${Date.now()}`
        connections.set(connectionId, {
          controller,
          userId: user._id.toString(),
          chatId,
          email: session.user.email,
        })

        // SSE connection established

        // Send initial connection message
        controller.enqueue(`data: ${JSON.stringify({
          type: "connected",
          message: "Connected to chat stream",
          timestamp: new Date().toISOString(),
        })}\n\n`)

        // Send a ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          try {
            controller.enqueue(`data: ${JSON.stringify({
              type: "ping",
              timestamp: new Date().toISOString(),
            })}\n\n`)
          } catch (error) {
            clearInterval(pingInterval)
          }
        }, 30000)

        // Handle connection cleanup
        request.signal.addEventListener("abort", () => {
          clearInterval(pingInterval)
          connections.delete(connectionId)
          try {
            controller.close()
          } catch (error) {
            // Connection already closed
          }
        })
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    })
  } catch (error) {
    console.error("Error setting up chat stream:", error)
    return NextResponse.json(
      { error: "Failed to set up chat stream" },
      { status: 500 }
    )
  }
}

// Function to broadcast message to chat participants
export function broadcastToChat(chatId, message, excludeUserId = null) {
  const chatConnections = Array.from(connections.entries()).filter(
    ([_, connection]) => 
      connection.chatId === chatId && 
      connection.userId !== excludeUserId?.toString()
  )

  chatConnections.forEach(([connectionId, connection]) => {
    try {
      const messageData = `data: ${JSON.stringify(message)}\n\n`
      connection.controller.enqueue(messageData)
    } catch (error) {
      console.error(`Failed to broadcast to connection ${connectionId}:`, error)
      // Remove broken connection
      connections.delete(connectionId)
    }
  })
  
  // Clean up dead connections periodically
  cleanupDeadConnections()
}

// Function to clean up dead connections
function cleanupDeadConnections() {
  const deadConnections = []
  
  connections.forEach((connection, connectionId) => {
    try {
      // Test if connection is still alive
      connection.controller.enqueue(`data: ${JSON.stringify({ type: "ping" })}\n\n`)
    } catch (error) {
      deadConnections.push(connectionId)
    }
  })
  
  deadConnections.forEach(connectionId => {
    connections.delete(connectionId)
  })
}

// Function to broadcast typing indicators
export function broadcastTyping(chatId, userId, isTyping) {
  broadcastToChat(chatId, {
    type: "typing",
    userId,
    isTyping,
    timestamp: new Date().toISOString(),
  }, userId)
}

// Function to broadcast online status
export function broadcastOnlineStatus(userId, isOnline) {
  const userConnections = Array.from(connections.entries()).filter(
    ([_, connection]) => connection.userId !== userId.toString()
  )

  userConnections.forEach(([connectionId, connection]) => {
    try {
      connection.controller.enqueue(`data: ${JSON.stringify({
        type: "user_status",
        userId,
        isOnline,
        timestamp: new Date().toISOString(),
      })}\n\n`)
    } catch (error) {
      connections.delete(connectionId)
    }
  })
}
