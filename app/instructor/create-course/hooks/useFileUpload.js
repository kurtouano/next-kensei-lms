// hooks/useFileUpload.js
import { useState, useCallback } from "react"

export const useFileUpload = () => {
  const [uploadingFiles, setUploadingFiles] = useState({})
  const [uploadProgress, setUploadProgress] = useState({})

  // Upload file to S3 with progress tracking
  const uploadToS3 = useCallback(async (file, fileType = null, uploadKey = null) => {
    try {
      const res = await fetch('/api/instructor/s3-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          fileType: fileType
        }),
      })

      if (!res.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, fileUrl } = await res.json()

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && uploadKey) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(prev => ({ ...prev, [uploadKey]: percentComplete }))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            // Clear progress when complete
            setUploadProgress(prev => {
              const newProgress = { ...prev }
              delete newProgress[uploadKey]
              return newProgress
            })
            resolve(fileUrl)
          } else {
            reject(new Error('Failed to upload file'))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }, [])

  // Handle file upload with loading state and progress
  const handleFileUpload = useCallback(async (file, uploadKey) => {
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }))
    setUploadProgress(prev => ({ ...prev, [uploadKey]: 0 }))
    
    try {
      const fileType = file.type.startsWith('image/') ? 'images' :
                      file.type.startsWith('video/') ? 'videos' :
                      file.type.startsWith('audio/') ? 'audio' : 'documents'

      const url = await uploadToS3(file, fileType, uploadKey)
      return url
    } catch (error) {
      alert('Upload failed: ' + error.message)
      throw error
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }))
      // Progress is cleared in uploadToS3 on success, but clear here on error
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[uploadKey]
        return newProgress
      })
    }
  }, [uploadToS3])

  return {
    uploadingFiles,
    uploadProgress,
    handleFileUpload
  }
}