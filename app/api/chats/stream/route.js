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
        
        // FIXED: Be more selective about which connections to remove
        // Only remove truly dead connections, not all connections for this user/chat
        const deadConnections = Array.from(connections.entries()).filter(
          ([id, conn]) => {
            if (conn.userId === user._id.toString() && conn.chatId === chatId) {
              // Check if connection is actually dead before removing
              const timeSinceLastPing = new Date() - conn.lastPing
              if (timeSinceLastPing > 90000 || !conn.isAlive) { // 90 seconds grace period
                return true
              }
              // Test if connection is still responsive
              try {
                conn.controller.enqueue(`data: ${JSON.stringify({ 
                  type: "connection_test", 
                  timestamp: new Date().toISOString() 
                })}\n\n`)
                return false // Connection is alive
              } catch (error) {
                return true // Connection is dead
              }
            }
            return false
          }
        )
        
        deadConnections.forEach(([id, _]) => {
          console.log(`Removing dead connection: ${id}`)
          connections.delete(id)
        })
        
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

        // FIXED: More reliable ping mechanism
        const pingInterval = setInterval(() => {
          try {
            if (!connections.has(connectionId)) {
              clearInterval(pingInterval)
              return
            }
            
            const pingData = {
              type: "ping",
              timestamp: new Date().toISOString(),
              connectionId,
            }
            controller.enqueue(`data: ${JSON.stringify(pingData)}\n\n`)
            
            // Update last ping time
            const conn = connections.get(connectionId)
            if (conn) {
              conn.lastPing = new Date()
            }
          } catch (error) {
            console.error(`Ping failed for connection ${connectionId}:`, error)
            clearInterval(pingInterval)
            connections.delete(connectionId)
            try {
              controller.close()
            } catch (closeError) {
              // Already closed
            }
          }
        }, 20000) // 20 seconds for more frequent health checks

        // Handle connection cleanup
        const cleanup = () => {
          console.log(`Cleaning up SSE connection: ${connectionId}`)
          clearInterval(pingInterval)
          connections.delete(connectionId)
          try {
            controller.close()
          } catch (error) {
            // Connection already closed
          }
        }

        request.signal.addEventListener("abort", cleanup)
        
        // Handle controller errors more gracefully
        const originalError = controller.error
        controller.error = (error) => {
          console.error(`Controller error for ${connectionId}:`, error)
          cleanup()
          if (originalError) originalError.call(controller, error)
        }
      },
      
      cancel() {
        console.log(`SSE stream cancelled for chat ${chatId}`)
      }
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
        "X-Accel-Buffering": "no",
        "Transfer-Encoding": "chunked",
        // FIXED: Add headers to prevent proxy buffering
        "X-Accel-Buffer": "no",
        "Pragma": "no-cache",
        "Expires": "0",
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

  if (chatConnections.length === 0) {
    console.log(`No active connections found for chat ${chatId}`)
    return
  }

  let successCount = 0
  let failureCount = 0
  const messageData = `data: ${JSON.stringify(message)}\n\n`

  // FIXED: Add retry mechanism for failed broadcasts
  chatConnections.forEach(([connectionId, connection]) => {
    const broadcastWithRetry = (retryCount = 0) => {
      try {
        connection.controller.enqueue(messageData)
        successCount++
        console.log(`✅ Message broadcasted to connection ${connectionId} (user: ${connection.userId})`)
      } catch (error) {
        if (retryCount < 2) { // Retry up to 2 times
          setTimeout(() => {
            if (connections.has(connectionId)) {
              broadcastWithRetry(retryCount + 1)
            }
          }, 100 * (retryCount + 1)) // Exponential backoff
        } else {
          failureCount++
          console.error(`❌ Failed to broadcast to connection ${connectionId} after retries:`, error)
          connection.isAlive = false
          connections.delete(connectionId)
        }
      }
    }
    
    broadcastWithRetry()
  })
  
  console.log(`Broadcast complete: ${successCount} successful, ${failureCount} failed`)
  
  // Clean up after broadcast
  setTimeout(cleanupDeadConnections, 1000)
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
