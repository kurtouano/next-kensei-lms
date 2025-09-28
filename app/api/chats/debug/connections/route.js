import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getConnectionStatus } from "@/app/api/chats/stream/route"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = getConnectionStatus()
    
    // Add health check information
    const healthInfo = {
      totalConnections: status.totalConnections,
      connectionsByChat: Object.keys(status.connectionsByChat).length,
      connectionsByUser: Object.keys(status.connectionsByUser).length,
      timestamp: new Date().toISOString()
    }
    
    // Add detailed connection info for debugging
    const debugInfo = {
      connectionsByChat: status.connectionsByChat,
      connectionsByUser: status.connectionsByUser,
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    }
    
    return NextResponse.json({
      success: true,
      status,
      health: healthInfo,
      debug: debugInfo,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error getting connection status:", error)
    return NextResponse.json(
      { error: "Failed to get connection status" },
      { status: 500 }
    )
  }
}
