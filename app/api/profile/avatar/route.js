// app/api/profile/avatar/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { name, type } = await req.json();

        // Validate file type
        if (!type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: "Invalid file type. Please upload an image." },
                { status: 400 }
            );
        }

        // Generate unique filename for avatar
        const timestamp = Date.now();
        const fileExtension = name.split('.').pop();
        const filename = `avatar_${session.user.id}_${timestamp}.${fileExtension}`;

        const fileParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `avatars/${filename}`,
            ContentType: type,
            // Add metadata for avatars
            Metadata: {
                'user-id': session.user.id,
                'upload-type': 'avatar'
            }
        };

        const uploadUrl = await getSignedUrl(s3, new PutObjectCommand(fileParams), {
            expiresIn: 300, // 5 minutes
        });

        // Return both the presigned URL and the final S3 URL
        const avatarUrl = `${process.env.AWS_CLOUDFRONT_DOMAIN_NAME}avatars/${filename}`;

        return NextResponse.json({
            success: true,
            uploadUrl: uploadUrl,
            fileUrl: avatarUrl,
            key: fileParams.Key,
            message: "Upload URL generated successfully"
        });

    } catch (error) {
        console.error("Avatar presigned URL error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}