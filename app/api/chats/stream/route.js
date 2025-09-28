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
        
        // Clean up any existing dead connections for this user/chat first
        const existingConnections = Array.from(connections.entries()).filter(
          ([_, conn]) => conn.userId === user._id.toString() && conn.chatId === chatId
        )
        
        // Remove dead connections immediately
        existingConnections.forEach(([id, conn]) => {
          if (!conn.isAlive || (Date.now() - new Date(conn.lastPing).getTime()) > 30000) {
            console.log(`🧹 Removing dead connection: ${id}`)
            connections.delete(id)
          }
        })
        
        // Allow up to 3 connections per user per chat (reduced for better management)
        const activeConnections = Array.from(connections.entries()).filter(
          ([_, conn]) => conn.userId === user._id.toString() && conn.chatId === chatId && conn.isAlive
        )
        
        if (activeConnections.length >= 3) {
          // Remove oldest connections, keep the 2 most recent
          const sortedConnections = activeConnections.sort((a, b) => 
            new Date(b[1].connectedAt) - new Date(a[1].connectedAt)
          )
          
          // Remove all but the 2 most recent
          sortedConnections.slice(2).forEach(([id, conn]) => {
            console.log(`🧹 Removing old connection: ${id} (age: ${Date.now() - new Date(conn.connectedAt).getTime()}ms)`)
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

// Enhanced broadcastToChat function with better error handling
export function broadcastToChat(chatId, message, excludeUserId = null) {
  const chatConnections = Array.from(connections.entries()).filter(
    ([_, connection]) => 
      connection.chatId === chatId && 
      connection.userId !== excludeUserId?.toString() &&
      connection.isAlive
  )

  console.log(`📡 Broadcasting to ${chatConnections.length} connections for chat ${chatId}`)
  console.log(`Message ID: ${message.message?.id || 'unknown'}`)

  if (chatConnections.length === 0) {
    console.warn(`⚠️ No active connections found for chat ${chatId}`)
    return
  }

  let successCount = 0
  let failureCount = 0
  const failedConnections = []

  chatConnections.forEach(([connectionId, connection]) => {
    try {
      // Double-check connection is still valid
      if (!connection.controller || !connection.isAlive) {
        console.log(`❌ Connection ${connectionId} is invalid, skipping`)
        failedConnections.push(connectionId)
        return
      }
      
      const messageData = `data: ${JSON.stringify(message)}\n\n`
      
      // Test if controller is writable before enqueuing
      if (connection.controller.desiredSize === null) {
        console.log(`❌ Connection ${connectionId} controller is closed`)
        failedConnections.push(connectionId)
        return
      }
      
      connection.controller.enqueue(messageData)
      connection.lastMessageTime = new Date()
      successCount++
      console.log(`✅ Message broadcasted to connection ${connectionId} (user: ${connection.userId})`)
      
    } catch (error) {
      failureCount++
      failedConnections.push(connectionId)
      console.error(`❌ Failed to broadcast to connection ${connectionId}:`, error)
      
      // Mark connection as dead
      connection.isAlive = false
      connection.lastError = new Date()
    }
  })
  
  console.log(`📊 Broadcast complete: ${successCount} successful, ${failureCount} failed`)
  
  // Immediately clean up failed connections
  if (failedConnections.length > 0) {
    console.log(`🧹 Cleaning up ${failedConnections.length} failed connections`)
    failedConnections.forEach(connectionId => {
      connections.delete(connectionId)
    })
  }

  // If no messages were successfully sent, log warning
  if (successCount === 0) {
    console.error(`🚨 CRITICAL: No messages were successfully broadcast for chat ${chatId}`)
    console.error(`Total connections found: ${chatConnections.length}`)
    console.error(`All failed connections:`, failedConnections)
  }
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
  
  // Log connection health status
  const activeConnections = Array.from(connections.values()).filter(conn => conn.isAlive)
  console.log(`📊 Connection Health: ${activeConnections.length} active connections`)
  
  // Group by chat for better visibility
  const connectionsByChat = {}
  activeConnections.forEach(conn => {
    if (!connectionsByChat[conn.chatId]) {
      connectionsByChat[conn.chatId] = []
    }
    connectionsByChat[conn.chatId].push(conn.userId)
  })
  
  Object.entries(connectionsByChat).forEach(([chatId, userIds]) => {
    console.log(`📱 Chat ${chatId}: ${userIds.length} active users`)
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
