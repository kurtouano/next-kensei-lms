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
    
    return NextResponse.json({
      success: true,
      status,
      health: healthInfo,
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
