"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, ImageIcon, Undo, Redo } from 'lucide-react'
import { useCallback, useState, useEffect, useRef } from 'react'
import imageCompression from 'browser-image-compression'

const RichTextEditor = ({ content, onChange, placeholder = "Write your content here..." }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const contentSet = useRef(false)
  const initialContent = useRef(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
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
    content: '',
    onCreate: ({ editor }) => {
      setIsLoading(false)
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML()
      onChange(newContent)
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] p-4 prose prose-sm max-w-none',
      },
    },
  })

  // Content synchronization
  useEffect(() => {
    if (!editor || isLoading) {
      return
    }

    const targetContent = content || ''
    const currentContent = editor.getHTML()

    if (!contentSet.current || targetContent !== currentContent) {
      setTimeout(() => {
        editor.commands.setContent(targetContent, false)
        contentSet.current = true
      }, 0)
    }
  }, [editor, content, isLoading])

  // Reset when content prop changes
  useEffect(() => {
    if (initialContent.current !== content) {
      contentSet.current = false
      initialContent.current = content
    }
  }, [content])

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
      
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      setIsUploading(true)

      try {
        const options = {
          maxSizeMB: 0.13,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: 0.7,
          alwaysKeepResolution: false
        }

        const compressedFile = await imageCompression(file, options)

        let finalFile = compressedFile
        if (compressedFile.size > 130 * 1024) {
          const aggressiveOptions = {
            maxSizeMB: 0.11,
            maxWidthOrHeight: 1400,
            useWebWorker: true,
            fileType: 'image/jpeg',
            initialQuality: 0.5,
            alwaysKeepResolution: false
          }
          finalFile = await imageCompression(compressedFile, aggressiveOptions)
        }

        if (finalFile.size > 130 * 1024) {
          const ultraOptions = {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: 'image/jpeg',
            initialQuality: 0.3,
            alwaysKeepResolution: false
          }
          finalFile = await imageCompression(finalFile, ultraOptions)
        }

        const response = await fetch('/api/admin/blogs/s3-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: `compressed_${finalFile.name || file.name}`, 
            type: finalFile.type 
          })
        })

        if (!response.ok) {
          throw new Error('Failed to get upload URL')
        }

        const { uploadUrl, fileUrl } = await response.json()

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': finalFile.type },
          body: finalFile
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

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
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-300 p-2">
          <div className="text-sm text-gray-500">Loading editor...</div>
        </div>
        <div className="min-h-[400px] bg-white p-4 flex items-center justify-center">
          <div className="text-gray-500">Initializing rich text editor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
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
          font-weight: 600;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        
        :global(.ProseMirror h2) {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.83em 0;
          line-height: 1.3;
        }
        
        :global(.ProseMirror h3) {
          font-size: 1.17em;
          font-weight: 600;
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
          max-width: 60%;
          height: auto;
          border-radius: 8px;
          margin: 1em auto;
          display: block;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        :global(.ProseMirror p) {
          margin: 1em 0;
          line-height: 1.6;
          font-weight: normal;
        }
        
        :global(.ProseMirror p:first-child) {
          margin-top: 0;
        }
        
        :global(.ProseMirror p:last-child) {
          margin-bottom: 0;
        }

        :global(.ProseMirror strong) {
          font-weight: bold;
        }

        :global(.ProseMirror h1:not(strong)) {
          font-weight: 600;
        }

        :global(.ProseMirror h2:not(strong)) {
          font-weight: 600;
        }

        :global(.ProseMirror h3:not(strong)) {
          font-weight: 600;
        }

        :global(.ProseMirror h1 strong),
        :global(.ProseMirror h1.strong) {
          font-weight: bold;
        }

        :global(.ProseMirror h2 strong),
        :global(.ProseMirror h2.strong) {
          font-weight: bold;
        }

        :global(.ProseMirror h3 strong),
        :global(.ProseMirror h3.strong) {
          font-weight: bold;
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