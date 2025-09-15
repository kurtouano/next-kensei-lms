import { compressImage, validateImageFile } from './imageCompression'

/**
 * Upload file to S3 with compression for images
 * @param {File} file - File to upload
 * @param {string} fileType - Type of file ('image', 'document', 'video', 'audio', 'general')
 * @returns {Promise<Object>} - Upload result with URL and metadata
 */
export const uploadChatFile = async (file, fileType = 'general') => {
  try {
    console.log(`Uploading ${fileType} file:`, file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)

    let fileToUpload = file
    let compressionStats = null

    // Compress images to 150KB max
    if (fileType === 'image' && file.type.startsWith('image/')) {
      // Validate image first
      const validation = validateImageFile(file, {
        maxSizeMB: 10,
        maxWidthOrHeight: 4000,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
      })

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Compress image to 150KB max
      const compressionOptions = {
        maxSizeKB: 150, // 150KB max as requested
        maxWidthOrHeight: 1920, // Max resolution
        quality: 0.8,
        aggressiveQuality: 0.6,
        extremeQuality: 0.4,
        fileType: 'image/jpeg' // Convert to JPEG for better compression
      }

      console.log('Compressing image...')
      fileToUpload = await compressImage(file, compressionOptions)
      
      compressionStats = {
        originalSize: file.size,
        compressedSize: fileToUpload.size,
        compressionRatio: ((1 - fileToUpload.size / file.size) * 100).toFixed(1),
        originalSizeKB: (file.size / 1024).toFixed(2),
        compressedSizeKB: (fileToUpload.size / 1024).toFixed(2)
      }

      console.log(`✅ Image compressed: ${compressionStats.originalSizeKB}KB → ${compressionStats.compressedSizeKB}KB (${compressionStats.compressionRatio}% reduction)`)
    }

    // Get presigned URL from our chat upload API
    const response = await fetch('/api/chats/attachments/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: fileToUpload.name,
        contentType: fileToUpload.type,
        fileSize: fileToUpload.size,
        fileType
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to get upload URL')
    }

    const { presignedUrl, fileUrl, key, metadata } = await response.json()

    // Upload to S3
    console.log('Uploading to S3...')
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileToUpload.type,
      },
      body: fileToUpload,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3')
    }

    console.log('✅ File uploaded successfully to S3')

    return {
      success: true,
      url: fileUrl,
      key,
      metadata: {
        ...metadata,
        originalFilename: file.name,
        originalSize: file.size,
        ...compressionStats
      }
    }

  } catch (error) {
    console.error('Chat file upload failed:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }
}

/**
 * Upload image with compression for chat
 * @param {File} file - Image file
 * @returns {Promise<Object>} - Upload result
 */
export const uploadChatImage = async (file) => {
  return uploadChatFile(file, 'image')
}

/**
 * Upload general file for chat
 * @param {File} file - File to upload
 * @param {string} detectedFileType - Detected file type ('image', 'document', 'audio', 'spreadsheet', 'attachment')
 * @returns {Promise<Object>} - Upload result
 */
export const uploadChatAttachment = async (file, detectedFileType = 'attachment') => {
  // Use the detected file type or determine based on MIME type
  let fileType = detectedFileType
  
  if (detectedFileType === 'attachment') {
    if (file.type.startsWith('image/')) {
      fileType = 'image'
    } else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) {
      fileType = 'document'
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio'
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.type.includes('csv')) {
      fileType = 'spreadsheet'
    }
  }

  return uploadChatFile(file, fileType)
}
