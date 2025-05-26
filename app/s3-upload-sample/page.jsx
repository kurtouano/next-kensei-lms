// ExampleComponent.jsx
'use client'
import { useState } from 'react'

export default function FileUploader() {
  const [file, setFile] = useState(null)

  async function handleUpload() {
    if (!file) return

    // Step 1: Get presigned URL from your server
    const res = await fetch('/api/s3-upload', {
      method: 'POST',
      body: JSON.stringify({
        name: file.name,
        type: file.type,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const { url, key } = await res.json()

    // Step 2: Upload file directly to S3
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    alert('Upload successful!')

    // Optional: Save the `key` to your database
    console.log('File uploaded as:', key)
  }

  return (
    <div className="p-4 border rounded">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        onClick={handleUpload}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Upload to S3
      </button>
    </div>
  )
}
