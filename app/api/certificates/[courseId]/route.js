// app/api/certificates/[courseId]/route.js - FIXED VERSION
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Certificate from "@/models/Certificate"
import User from "@/models/User"
import Course from "@/models/Course"

// GET - Check if certificate exists for course
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

    const { courseId } = await params

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Find certificate for this user and course
    const certificate = await Certificate.findOne({
      user: user._id,
      course: courseId
    }).populate('course', 'title')

    if (!certificate) {
      return NextResponse.json({ 
        success: false, 
        error: "Certificate not found" 
      }, { status: 404 })
    }

    // Add user name to certificate data
    const certificateData = {
      certificateId: certificate.certificateId,
      courseTitle: certificate.courseTitle,
      completionDate: certificate.completionDate,
      userName: user.name || "Student"
    }

    return NextResponse.json({
      success: true,
      certificate: certificateData
    })

  } catch (error) {
    console.error("Error fetching certificate:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch certificate" 
    }, { status: 500 })
  }
}

// Function to generate unique certificate ID
function generateCertificateId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BONSAI-CERT-${timestamp}-${randomStr}`
}

// POST - Create certificate for course completion
export async function POST(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 })
    }

    const { courseId } = await params
    console.log('🎓 Creating certificate for course ID:', courseId)

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    console.log('👤 User found:', user.name, user.email)

    // Find course
    const course = await Course.findById(courseId).populate('instructor', 'name')
    if (!course) {
      console.error('❌ Course not found for ID:', courseId)
      return NextResponse.json({ 
        success: false, 
        error: "Course not found" 
      }, { status: 404 })
    }

    console.log('📚 Course found:', course.title)

    // Check if certificate already exists
    let existingCertificate = await Certificate.findOne({
      user: user._id,
      course: courseId
    })

    if (existingCertificate) {
      console.log('📜 Certificate already exists:', existingCertificate.certificateId)
      
      // Certificate already exists, return it
      const certificateData = {
        certificateId: existingCertificate.certificateId,
        courseTitle: existingCertificate.courseTitle,
        completionDate: existingCertificate.completionDate,
        userName: user.name || "Student"
      }

      return NextResponse.json({
        success: true,
        certificate: {
          ...certificateData,
          alreadyIssued: true
        },
        message: "Certificate already exists"
      })
    }

    // FIXED: Generate certificate ID manually
    const certificateId = generateCertificateId()
    console.log('🆔 Generated certificate ID:', certificateId)

    // Create new certificate with explicit certificateId
    const newCertificate = new Certificate({
      user: user._id,
      course: courseId,
      certificateId: certificateId, // FIXED: Explicitly set the ID
      courseTitle: course.title,
      instructorName: course.instructor?.name || "Instructor",
      completionDate: new Date()
    })

    console.log('💾 Saving certificate...')
    await newCertificate.save()
    console.log('✅ Certificate saved successfully!')

    const certificateData = {
      certificateId: newCertificate.certificateId,
      courseTitle: newCertificate.courseTitle,
      completionDate: newCertificate.completionDate,
      userName: user.name || "Student"
    }

    return NextResponse.json({
      success: true,
      certificate: {
        ...certificateData,
        alreadyIssued: false
      },
      message: "Certificate generated successfully"
    })

  } catch (error) {
    console.error("Error creating certificate:", error)
    return NextResponse.json({ 
      success: false, 
      error: `Failed to generate certificate: ${error.message}` 
    }, { status: 500 })
  }
}