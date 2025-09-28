import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import ChatParticipant from "@/models/ChatParticipant"
import User from "@/models/User"

// Store active connections with enhanced metadata
const connections = new Map()

// Connection health monitoring
let healthCheckInterval = null

// Start health monitoring if not already running
function startHealthMonitoring() {
  if (healthCheckInterval) return
  
  healthCheckInterval = setInterval(() => {
    cleanupDeadConnections()
  }, 30000) // Check every 30 seconds
}

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

    // Start health monitoring
    startHealthMonitoring()

    // Create SSE response with enhanced error handling
    const stream = new ReadableStream({
      start(controller) {
        // Store connection with enhanced metadata
        // Use a more unique connection ID to handle multiple tabs
        const connectionId = `${user._id}-${chatId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const connectionData = {
          controller,
          userId: user._id.toString(),
          chatId,
          email: session.user.email,
          connectedAt: new Date(),
          lastPing: new Date(),
          isAlive: true,
          sessionId: connectionId, // Store session ID for debugging
        }
        
        // Only remove connections if we have more than 3 connections for the same user in the same chat
        // This allows multiple tabs but prevents connection spam
        const existingConnections = Array.from(connections.entries()).filter(
          ([_, conn]) => conn.userId === user._id.toString() && conn.chatId === chatId
        )
        
        if (existingConnections.length >= 3) {
          // Remove oldest connections, keep the 2 most recent
          const sortedConnections = existingConnections.sort((a, b) => 
            new Date(b[1].connectedAt) - new Date(a[1].connectedAt)
          )
          
          // Remove all but the 2 most recent
          sortedConnections.slice(2).forEach(([id, _]) => {
            console.log(`Removing old connection: ${id}`)
            connections.delete(id)
          })
        }
        
        connections.set(connectionId, connectionData)
        console.log(`SSE connection established: ${connectionId} for user ${user._id} in chat ${chatId}`)
        console.log(`Total active connections: ${connections.size}`)

        // Send initial connection message
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: "connected",
            message: "Connected to chat stream",
            timestamp: new Date().toISOString(),
            connectionId,
          })}\n\n`)
        } catch (error) {
          console.error("Failed to send initial connection message:", error)
          connections.delete(connectionId)
          return
        }

        // Send a ping every 15 seconds to keep connection alive (reduced from 30s)
        const pingInterval = setInterval(() => {
          try {
            const pingData = {
              type: "ping",
              timestamp: new Date().toISOString(),
              connectionId,
            }
            controller.enqueue(`data: ${JSON.stringify(pingData)}\n\n`)
            
            // Update last ping time
            if (connections.has(connectionId)) {
              connections.get(connectionId).lastPing = new Date()
            }
          } catch (error) {
            console.error(`Ping failed for connection ${connectionId}:`, error)
            clearInterval(pingInterval)
            connections.delete(connectionId)
            try {
              controller.close()
            } catch (closeError) {
              // Connection already closed
            }
          }
        }, 15000) // Reduced to 15 seconds for better reliability

        // Handle connection cleanup with better error handling
        const cleanup = () => {
          console.log(`🧹 Cleaning up SSE connection: ${connectionId}`)
          clearInterval(pingInterval)
          
          // Mark connection as dead instead of immediately deleting
          if (connections.has(connectionId)) {
            const conn = connections.get(connectionId)
            conn.isAlive = false
            conn.disconnectedAt = new Date()
            console.log(`Connection ${connectionId} marked as dead`)
          }
          
          try {
            controller.close()
          } catch (error) {
            console.log(`Controller already closed for ${connectionId}`)
          }
        }

        request.signal.addEventListener("abort", () => {
          console.log(`🔄 Connection aborted for ${connectionId}`)
          cleanup()
        })
        
        // Handle controller errors more gracefully
        const originalEnqueue = controller.enqueue.bind(controller)
        controller.enqueue = (data) => {
          try {
            originalEnqueue(data)
          } catch (error) {
            console.error(`❌ Failed to enqueue data for ${connectionId}:`, error)
            cleanup()
          }
        }
      },
      
      cancel() {
        console.log(`SSE stream cancelled for chat ${chatId}`)
      }
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
        "X-Accel-Buffering": "no", // Disable nginx buffering
        "Transfer-Encoding": "chunked",
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
      connection.userId !== excludeUserId?.toString() &&
      connection.isAlive
  )

  console.log(`Broadcasting to ${chatConnections.length} connections for chat ${chatId}`)
  console.log(`Active connections for chat ${chatId}:`, chatConnections.map(([id, conn]) => ({
    connectionId: id,
    userId: conn.userId,
    email: conn.email,
    isAlive: conn.isAlive
  })))

  let successCount = 0
  let failureCount = 0

  chatConnections.forEach(([connectionId, connection]) => {
    try {
      // Validate connection is still alive before broadcasting
      if (!connection.isAlive || !connection.controller) {
        console.log(`⚠️ Skipping dead connection ${connectionId}`)
        failureCount++
        return
      }
      
      const messageData = `data: ${JSON.stringify(message)}\n\n`
      connection.controller.enqueue(messageData)
      successCount++
      console.log(`✅ Message broadcasted to connection ${connectionId} (user: ${connection.userId})`)
    } catch (error) {
      failureCount++
      console.error(`❌ Failed to broadcast to connection ${connectionId}:`, error)
      // Mark connection as dead but don't delete immediately
      connection.isAlive = false
      connection.lastError = new Date()
      console.log(`Connection ${connectionId} marked as dead due to broadcast failure`)
    }
  })
  
  console.log(`Broadcast complete: ${successCount} successful, ${failureCount} failed`)
  
  // Clean up dead connections after broadcast
  cleanupDeadConnections()
}

// Function to clean up dead connections
function cleanupDeadConnections() {
  const deadConnections = []
  const now = new Date()
  
  connections.forEach((connection, connectionId) => {
    try {
      // Check if connection is marked as dead or hasn't been pinged recently
      if (!connection.isAlive || (now - connection.lastPing) > 60000) { // 60 seconds timeout
        deadConnections.push(connectionId)
        return
      }
      
      // Test if connection is still alive by sending a test ping
      connection.controller.enqueue(`data: ${JSON.stringify({ 
        type: "health_check", 
        timestamp: new Date().toISOString() 
      })}\n\n`)
    } catch (error) {
      console.error(`Health check failed for connection ${connectionId}:`, error)
      deadConnections.push(connectionId)
    }
  })
  
  if (deadConnections.length > 0) {
    console.log(`Cleaning up ${deadConnections.length} dead connections`)
    deadConnections.forEach(connectionId => {
      connections.delete(connectionId)
    })
  }
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

// Function to get connection status for debugging
export function getConnectionStatus() {
  const status = {
    totalConnections: connections.size,
    connectionsByChat: {},
    connectionsByUser: {}
  }
  
  connections.forEach((connection, connectionId) => {
    const chatId = connection.chatId
    const userId = connection.userId
    
    if (!status.connectionsByChat[chatId]) {
      status.connectionsByChat[chatId] = []
    }
    if (!status.connectionsByUser[userId]) {
      status.connectionsByUser[userId] = []
    }
    
    status.connectionsByChat[chatId].push({
      connectionId,
      userId,
      email: connection.email,
      isAlive: connection.isAlive,
      connectedAt: connection.connectedAt
    })
    
    status.connectionsByUser[userId].push({
      connectionId,
      chatId,
      email: connection.email,
      isAlive: connection.isAlive,
      connectedAt: connection.connectedAt
    })
  })
  
  return status
}
