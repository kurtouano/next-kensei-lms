// app/api/certificates/[certificateId]/route.js - Get certificate by certificate ID

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Certificate from "@/models/Certificate"
import User from "@/models/User"

// GET - Fetch specific certificate by certificate ID
export async function GET(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 })
    }

    const { certificateId } = await params

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Find certificate by certificate ID and verify ownership
    const certificate = await Certificate.findOne({ 
      certificateId: certificateId,
      user: user._id  // Ensure user owns this certificate
    }).populate('course', 'title slug level')

    if (!certificate) {
      return NextResponse.json({ 
        success: false, 
        error: "Certificate not found or access denied" 
      }, { status: 404 })
    }

    // Format certificate data for frontend
    const certificateData = {
      certificateId: certificate.certificateId,
      courseTitle: certificate.courseTitle,
      completionDate: certificate.completionDate,
      userName: user.name || "Student",
      courseId: certificate.course._id.toString(),
      courseSlug: certificate.course.slug,
      courseLevel: certificate.course.level
    }

    return NextResponse.json({
      success: true,
      certificate: certificateData
    })

  } catch (error) {
    console.error("Error fetching certificate by ID:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch certificate" 
    }, { status: 500 })
  }
}

// DELETE - Delete specific certificate (if needed)
export async function DELETE(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 })
    }

    const { certificateId } = await params

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Only allow admin or the certificate owner to delete
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized - Only admins can delete certificates" 
      }, { status: 403 })
    }

    // Find and delete certificate
    const deletedCertificate = await Certificate.findOneAndDelete({ 
      certificateId: certificateId 
    })

    if (!deletedCertificate) {
      return NextResponse.json({ 
        success: false, 
        error: "Certificate not found" 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Certificate deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete certificate" 
    }, { status: 500 })
  }
}