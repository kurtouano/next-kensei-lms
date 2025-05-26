// /app/api/upload-url/route.js
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
  const { name, type } = await req.json()

  const fileParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `images/${Date.now()}-${name}`,
    ContentType: type,
  }

  const url = await getSignedUrl(s3, new PutObjectCommand(fileParams), {
    expiresIn: 60, // seconds
  })

  return Response.json({ url, key: fileParams.Key })
}
