import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
  "image/gif"
]

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, contentType, fileSize } = await request.json()

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = filename.split('.').pop()
    const uniqueId = crypto.randomUUID()
    const timestamp = Date.now()
    const key = `chat-images/${session.user.email}/${timestamp}-${uniqueId}.${fileExtension}`

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
      Metadata: {
        'uploaded-by': session.user.email,
        'original-filename': filename,
      },
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300 // 5 minutes
    })

    // The final URL where the file will be accessible
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`

    return NextResponse.json({
      success: true,
      presignedUrl,
      fileUrl,
      key,
      metadata: {
        filename,
        contentType,
        fileSize,
      },
    })
  } catch (error) {
    console.error("Error creating presigned URL:", error)
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    )
  }
}

// Alternative endpoint for direct file upload (if you prefer server-side upload)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueId = crypto.randomUUID()
    const timestamp = Date.now()
    const key = `chat-images/${session.user.email}/${timestamp}-${uniqueId}.${fileExtension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        'uploaded-by': session.user.email,
        'original-filename': file.name,
      },
    })

    await s3Client.send(command)

    // The final URL where the file is accessible
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`

    return NextResponse.json({
      success: true,
      fileUrl,
      key,
      metadata: {
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
