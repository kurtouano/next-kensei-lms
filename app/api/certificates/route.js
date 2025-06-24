// app/api/certificates/route.js - Get user certificates (FIXED)
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Certificate from "@/models/Certificate"
import User from "@/models/User"

export async function GET() {
  try {
    await connectDb()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 })
    }

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Get user certificates
    const certificates = await Certificate.getUserCertificates(user._id)

    const formattedCertificates = certificates.map(cert => ({
      id: cert._id.toString(),
      certificateId: cert.certificateId,
      courseTitle: cert.courseTitle,
      completionDate: cert.completionDate,
      courseId: cert.course._id.toString() // Include courseId for modal
    }))

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates
    })

  } catch (error) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch certificates" 
    }, { status: 500 })
  }
}