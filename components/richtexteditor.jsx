"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, ImageIcon, Undo, Redo } from 'lucide-react'
import { useCallback, useState } from 'react'

const RichTextEditor = ({ content, onChange, placeholder = "Write your content here..." }) => {
  const [isUploading, setIsUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the default heading, bulletList, orderedList, and listItem
        // so we can configure them separately
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      // Configure extensions separately for better control
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'ordered-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'list-item',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] p-4 prose prose-sm max-w-none',
      },
    },
  })

  const addImage = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setIsUploading(true)

      try {
        // Get presigned URL for S3 upload
        const response = await fetch('/api/admin/blogs/s3-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, type: file.type })
        })

        if (!response.ok) {
          throw new Error('Failed to get upload URL')
        }

        const { uploadUrl, fileUrl } = await response.json()

        // Upload to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        // Insert image into editor
        if (editor) {
          editor.chain().focus().setImage({ src: fileUrl }).run()
        }

      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to upload image: ' + error.message)
      } finally {
        setIsUploading(false)
      }
    }

    input.click()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Image */}
        <button
          onClick={addImage}
          disabled={isUploading}
          className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="Add Image"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="min-h-[400px] bg-white">
        <EditorContent 
          editor={editor} 
          className="min-h-[400px]"
        />
      </div>

      {/* Custom CSS for proper styling */}
      <style jsx>{`
        :global(.ProseMirror) {
          outline: none;
          padding: 1rem;
          min-height: 400px;
        }
        
        :global(.ProseMirror h1) {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        
        :global(.ProseMirror h2) {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
          line-height: 1.3;
        }
        
        :global(.ProseMirror h3) {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
          line-height: 1.4;
        }
        
        :global(.ProseMirror ul) {
          list-style-type: disc;
          margin: 1em 0;
          padding-left: 1.5em;
        }
        
        :global(.ProseMirror ol) {
          list-style-type: decimal;
          margin: 1em 0;
          padding-left: 1.5em;
        }
        
        :global(.ProseMirror li) {
          margin: 0.5em 0;
          line-height: 1.5;
        }
        
        :global(.ProseMirror li p) {
          margin: 0;
        }
        
        :global(.ProseMirror img) {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1em 0;
        }
        
        :global(.ProseMirror p) {
          margin: 1em 0;
          line-height: 1.6;
        }
        
        :global(.ProseMirror p:first-child) {
          margin-top: 0;
        }
        
        :global(.ProseMirror p:last-child) {
          margin-bottom: 0;
        }
      `}</style>

      {/* Status bar */}
      <div className="bg-gray-50 border-t border-gray-300 px-3 py-2 text-xs text-gray-500">
        {editor?.storage?.characterCount?.characters?.() || editor?.getText?.()?.length || 0} characters
      </div>
    </div>
  )
}

export default RichTextEditor