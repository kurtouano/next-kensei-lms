// utils/imageCompression.js
import imageCompression from 'browser-image-compression'

/**
 * Compress image to target size (100-130KB for optimal SEO)
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxSizeKB = 130, // Target size in KB (reduced for better SEO)
    maxWidthOrHeight = 1600, // Reduced default max dimension
    quality = 0.7, // Lower initial quality
    aggressiveQuality = 0.5, // More aggressive quality
    extremeQuality = 0.3, // Extreme quality for large files
    fileType = 'image/jpeg'
  } = options

  try {
    // First compression attempt
    const compressionOptions = {
      maxSizeMB: maxSizeKB / 1024, // Convert KB to MB
      maxWidthOrHeight,
      useWebWorker: true,
      fileType,
      initialQuality: quality,
      alwaysKeepResolution: false
    }

    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
    
    let compressedFile = await imageCompression(file, compressionOptions)
    console.log('First compression size:', (compressedFile.size / 1024).toFixed(2), 'KB')

    // If still too large, apply more aggressive compression
    if (compressedFile.size > maxSizeKB * 1024) {
      const aggressiveOptions = {
        maxSizeMB: (maxSizeKB * 0.8) / 1024, // Target 80% of max size
        maxWidthOrHeight: Math.min(maxWidthOrHeight, 1400),
        useWebWorker: true,
        fileType,
        initialQuality: aggressiveQuality,
        alwaysKeepResolution: false
      }
      
      compressedFile = await imageCompression(compressedFile, aggressiveOptions)
      console.log('Aggressive compression size:', (compressedFile.size / 1024).toFixed(2), 'KB')
    }

    // Final check - if still too large, apply extreme compression
    if (compressedFile.size > maxSizeKB * 1024) {
      const extremeOptions = {
        maxSizeMB: (maxSizeKB * 0.6) / 1024, // Target 60% of max size
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg', // Force JPEG for maximum compression
        initialQuality: extremeQuality,
        alwaysKeepResolution: false
      }
      
      compressedFile = await imageCompression(compressedFile, extremeOptions)
      console.log('Extreme compression size:', (compressedFile.size / 1024).toFixed(2), 'KB')
    }

    // Ultra compression if still above target (rare cases)
    if (compressedFile.size > maxSizeKB * 1024) {
      const ultraOptions = {
        maxSizeMB: (maxSizeKB * 0.4) / 1024, // Target 40% of max size
        maxWidthOrHeight: 1000,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.2, // Very low quality but still usable
        alwaysKeepResolution: false
      }
      
      compressedFile = await imageCompression(compressedFile, ultraOptions)
      console.log('Ultra compression size:', (compressedFile.size / 1024).toFixed(2), 'KB')
    }

    // Log compression statistics
    const originalSizeKB = (file.size / 1024).toFixed(2)
    const compressedSizeKB = (compressedFile.size / 1024).toFixed(2)
    const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1)
    
    console.log(`🎯 SEO-optimized compression: ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction)`)

    return compressedFile

  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('Failed to compress image: ' + error.message)
  }
}

/**
 * Validate image file before processing
 * @param {File} file - Image file to validate
 * @param {Object} limits - Validation limits
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file, limits = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = limits

  const errors = []

  if (!file) {
    errors.push('No file selected')
    return { isValid: false, errors }
  }

  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image')
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`)
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File size must be less than ${maxSizeMB}MB`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get optimal compression settings based on original file size
 * @param {number} fileSizeBytes - Original file size in bytes
 * @returns {Object} - Optimal compression settings
 */
export const getOptimalCompressionSettings = (fileSizeBytes) => {
  const sizeMB = fileSizeBytes / (1024 * 1024)

  if (sizeMB > 8) {
    // Very large files - ultra aggressive compression
    return {
      maxSizeKB: 100, // Very aggressive for SEO
      maxWidthOrHeight: 1200,
      quality: 0.5,
      aggressiveQuality: 0.3,
      extremeQuality: 0.2
    }
  } else if (sizeMB > 5) {
    // Large files - aggressive compression
    return {
      maxSizeKB: 110,
      maxWidthOrHeight: 1400,
      quality: 0.6,
      aggressiveQuality: 0.4,
      extremeQuality: 0.25
    }
  } else if (sizeMB > 2) {
    // Medium files - moderate compression
    return {
      maxSizeKB: 120,
      maxWidthOrHeight: 1500,
      quality: 0.65,
      aggressiveQuality: 0.45,
      extremeQuality: 0.3
    }
  } else {
    // Smaller files - light compression but still SEO optimized
    return {
      maxSizeKB: 130,
      maxWidthOrHeight: 1600,
      quality: 0.7,
      aggressiveQuality: 0.5,
      extremeQuality: 0.35
    }
  }
}

/**
 * Upload compressed image to S3
 * @param {File} compressedFile - Compressed image file
 * @param {string} prefix - S3 key prefix (e.g., 'blogs', 'featured')
 * @returns {Promise<string>} - S3 URL of uploaded file
 */
export const uploadCompressedImageToS3 = async (compressedFile, prefix = 'blogs') => {
  try {
    // Get presigned URL
    const response = await fetch('/api/admin/blogs/s3-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: `${prefix}_${Date.now()}_${compressedFile.name}`, 
        type: compressedFile.type 
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get upload URL')
    }

    const { uploadUrl, fileUrl } = await response.json()

    // Upload to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': compressedFile.type },
      body: compressedFile
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to S3')
    }

    return fileUrl

  } catch (error) {
    console.error('S3 upload failed:', error)
    throw new Error('Failed to upload image: ' + error.message)
  }
}

/**
 * Complete image processing pipeline: validate → compress → upload
 * @param {File} file - Original image file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Result with S3 URL and compression stats
 */
export const processAndUploadImage = async (file, options = {}) => {
  const { prefix = 'blogs', compressionOptions = {} } = options

  // Validate file
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Get optimal compression settings for SEO
  const optimalSettings = getOptimalCompressionSettings(file.size)
  const finalCompressionOptions = { ...optimalSettings, ...compressionOptions }

  // Compress image
  const compressedFile = await compressImage(file, finalCompressionOptions)

  // Upload to S3
  const s3Url = await uploadCompressedImageToS3(compressedFile, prefix)

  // Return result with stats
  const result = {
    url: s3Url,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1),
    originalSizeKB: (file.size / 1024).toFixed(2),
    compressedSizeKB: (compressedFile.size / 1024).toFixed(2),
    seoOptimized: compressedFile.size <= 130 * 1024 // Flag if SEO optimized
  }

  console.log(`🚀 SEO Performance: ${result.seoOptimized ? '✅ Optimized' : '⚠️ Large'} (${result.compressedSizeKB}KB)`)
  
  return result
}