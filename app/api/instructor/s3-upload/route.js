// /app/api/s3-upload/route.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})

export async function POST(req) {
  try {
    const { name, type, fileType } = await req.json()

    // Determine folder based on file type
    let folder = 'documents'
    if (type.startsWith('image/')) {
      folder = 'images'
    } else if (type.startsWith('video/')) {
      folder = 'videos'
    } else if (type.startsWith('audio/')) {
      folder = 'audio'
    } else if (type === 'application/pdf') {
      folder = 'documents'
    }

    // If fileType is explicitly provided, use that
    if (fileType) {
      folder = fileType
    }

    const fileParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${folder}/${Date.now()}-${name}`,
      ContentType: type,
    }

    const url = await getSignedUrl(s3, new PutObjectCommand(fileParams), {
      expiresIn: 300, // 5 minutes for larger files
    })

    // Return both the presigned URL and the final S3 URL
    const s3Url = `${process.env.AWS_CLOUDFRONT_DOMAIN_NAME}${fileParams.Key}`

    return Response.json({ 
      uploadUrl: url, 
      fileUrl: s3Url,
      key: fileParams.Key 
    })
  } catch (error) {
    console.error('S3 upload error:', error)
    return Response.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}