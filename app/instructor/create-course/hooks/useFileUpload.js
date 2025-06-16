// hooks/useFileUpload.js
import { useState, useCallback } from "react"

export const useFileUpload = () => {
  const [uploadingFiles, setUploadingFiles] = useState({})

  // Upload file to S3
  const uploadToS3 = useCallback(async (file, fileType = null) => {
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

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadRes.ok) throw new Error('Failed to upload file')
      return fileUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }, [])

  // Handle file upload with loading state
  const handleFileUpload = useCallback(async (file, uploadKey) => {
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }))
    
    try {
      const fileType = file.type.startsWith('image/') ? 'images' :
                      file.type.startsWith('video/') ? 'videos' :
                      file.type.startsWith('audio/') ? 'audio' : 'documents'

      const url = await uploadToS3(file, fileType)
      return url
    } catch (error) {
      alert('Upload failed: ' + error.message)
      throw error
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }))
    }
  }, [uploadToS3])

  return {
    uploadingFiles,
    handleFileUpload
  }
}