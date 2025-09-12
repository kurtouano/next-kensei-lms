import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from "crypto"

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type')

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (type !== 'group-avatar') {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (should already be compressed to ~100KB)
    const maxSize = 200 * 1024 // 200KB max (giving some buffer)
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${maxSize / 1024}KB` 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const uniqueId = crypto.randomUUID()
    const userId = session.user.id || session.user.email.split('@')[0]
    const fileExtension = file.name.split('.').pop()
    const key = `group-avatars/${userId}/${timestamp}-${uniqueId}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        'uploaded-by': session.user.email,
        'original-filename': file.name,
        'upload-type': 'group-avatar',
        'compressed-size': file.size.toString(),
        'upload-timestamp': timestamp.toString()
      }
    })

    await s3Client.send(command)

    // The final URL where the file will be accessible
    const fileUrl = process.env.AWS_CLOUDFRONT_DOMAIN_NAME 
      ? `${process.env.AWS_CLOUDFRONT_DOMAIN_NAME}${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`

    // Log upload success
    console.log(`✅ Group avatar uploaded: ${(file.size / 1024).toFixed(2)}KB to ${fileUrl}`)

    return NextResponse.json({
      success: true,
      url: fileUrl,
      key,
      size: file.size,
      type: file.type,
      message: "Group avatar uploaded successfully"
    })

  } catch (error) {
    console.error("Group avatar upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload group avatar" },
      { status: 500 }
    )
  }
}
