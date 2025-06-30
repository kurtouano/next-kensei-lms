// app/api/admin/blogs/s3-upload/route.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})

// POST - Upload blog image to S3
export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, type } = await req.json()

    // Validate image only
    if (!type.startsWith('image/')) {
      return Response.json({ error: 'Only image files allowed' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${timestamp}_${sanitizedName}`

    const fileParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `blogs/${uniqueFileName}`, // Upload to blogs/ folder
      ContentType: type,
    }

    // Get presigned URL
    const uploadUrl = await getSignedUrl(s3, new PutObjectCommand(fileParams), {
      expiresIn: 300, // 5 minutes
    })

    // Construct final S3 URL
    const s3Url = process.env.AWS_CLOUDFRONT_DOMAIN_NAME 
      ? `${process.env.AWS_CLOUDFRONT_DOMAIN_NAME}${fileParams.Key}`
      : `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileParams.Key}`

    return Response.json({ 
      uploadUrl,
      fileUrl: s3Url,
      key: fileParams.Key
    })

  } catch (error) {
    console.error('S3 upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// DELETE - Remove blog image from S3
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { key } = await req.json()

    if (!key || !key.startsWith('blogs/')) {
      return Response.json({ error: 'Invalid file key' }, { status: 400 })
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    }))

    return Response.json({ success: true })

  } catch (error) {
    console.error('S3 delete error:', error)
    return Response.json({ error: 'Delete failed' }, { status: 500 })
  }
}