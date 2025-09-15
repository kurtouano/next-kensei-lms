import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Allowed file types for chat attachments
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/rtf"
]

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav", 
  "audio/mp4",
  "audio/ogg"
]

const ALLOWED_SPREADSHEET_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv"
]

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, contentType, fileSize, fileType } = await request.json()

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Determine allowed types based on fileType
    let allowedTypes = []
    let folder = 'chat-attachments'
    
    if (fileType === 'image') {
      allowedTypes = ALLOWED_IMAGE_TYPES
      folder = 'chat-images'
    } else if (fileType === 'document') {
      allowedTypes = ALLOWED_DOCUMENT_TYPES
      folder = 'chat-documents'
    } else if (fileType === 'audio') {
      allowedTypes = ALLOWED_AUDIO_TYPES
      folder = 'chat-audio'
    } else if (fileType === 'spreadsheet') {
      allowedTypes = ALLOWED_SPREADSHEET_TYPES
      folder = 'chat-spreadsheets'
    } else {
      // General attachment - allow all file types
      allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_AUDIO_TYPES, ...ALLOWED_SPREADSHEET_TYPES]
      folder = 'chat-attachments'
    }

    // Validate file type
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = filename.split('.').pop()
    const uniqueId = crypto.randomUUID()
    const timestamp = Date.now()
    const sanitizedEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, '_')
    
    const key = `${folder}/${sanitizedEmail}/${timestamp}-${uniqueId}.${fileExtension}`

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
      Metadata: {
        'uploaded-by': session.user.email,
        'original-filename': filename,
        'file-type': fileType || 'general',
        'upload-timestamp': timestamp.toString()
      },
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300 // 5 minutes
    })

    // The final URL where the file will be accessible
    const fileUrl = process.env.AWS_CLOUDFRONT_DOMAIN_NAME 
      ? `${process.env.AWS_CLOUDFRONT_DOMAIN_NAME}${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`

    return NextResponse.json({
      success: true,
      presignedUrl,
      fileUrl,
      key,
      metadata: {
        filename,
        contentType,
        fileSize,
        fileType: fileType || 'general'
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
