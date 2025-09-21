"use client"

import { memo, useState, useRef, useEffect } from "react"
import { Loader2, AlertCircle, Plus } from "lucide-react"
import LazyAvatar from "./LazyAvatar"
import EmojiPicker from "./EmojiPicker"
import LinkPreview from "./LinkPreview"

// Function to extract URLs from text
const extractUrls = (text) => {
  if (!text) return []
  
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
  const urls = []
  let match
  
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0].startsWith('http') ? match[0] : `https://${match[0]}`
    urls.push(url)
  }
  
  return urls
}

// Function to render text with clickable links
const renderTextWithLinks = (text, isUserMessage = false) => {
  if (!text) return text

  // URL regex pattern to match various URL formats
  // Matches http://, https://, and www. URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
  
  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      // Ensure URL has protocol
      const url = part.startsWith('http') ? part : `https://${part}`
      
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline hover:no-underline transition-all duration-200 break-all message-content ${
            isUserMessage 
              ? 'text-white hover:text-gray-200' 
              : 'text-blue-600 hover:text-blue-800'
          }`}
          style={{ wordBreak: 'break-all', overflowWrap: 'anywhere', maxWidth: '100%' }}
          title="Open link"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

// Memoized message component for better performance
const MessageItem = memo(({ 
  message, 
  previousMessage, 
  session, 
  formatTimestamp, 
  formatFullTimestamp, 
  shouldShowTimestamp,
  handleReaction
}) => {
  const showTimestamp = shouldShowTimestamp(message, previousMessage)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const reactionPickerRef = useRef(null)

  const handleEmojiSelect = (emoji) => {
    handleReaction(message.id, emoji)
    setShowReactionPicker(false)
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReactionPicker && 
          reactionPickerRef.current && 
          !reactionPickerRef.current.contains(event.target) &&
          !event.target.closest('.emoji-picker-container')) {
        setShowReactionPicker(false)
      }
    }

    if (showReactionPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showReactionPicker])
  
  return (
    <div>
      {/* Show timestamp if there's a significant time gap */}
      {showTimestamp && (
        <div className="flex justify-center my-4">
          <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
            {formatTimestamp(message.createdAt)}
          </div>
        </div>
      )}
      
      <div className={`flex gap-3 ${message.sender.email === session?.user?.email ? "flex-row-reverse" : ""}`}>
        {message.sender.email !== session?.user?.email && (
          <LazyAvatar user={message.sender} size="w-8 h-8" />
        )}
        <div className={`max-w-[55%] min-w-0 ${message.sender.email === session?.user?.email ? "flex flex-col items-end" : ""}`}>
          {message.sender.email !== session?.user?.email && (
            <p className="text-sm font-medium text-[#2c3e2d] mb-1">{message.sender.name}</p>
          )}
          
          {/* Images - No background */}
          {message.type === "image" && message.attachments?.length > 0 && (
            <div className="mb-2 group relative">
              {/* Reaction buttons for images */}
              <div className={`absolute ${message.sender.email === session?.user?.email ? '-left-12' : '-right-12'} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 bg-white rounded-full shadow-lg border p-1 z-10`}>
                <button
                  onClick={() => handleReaction(message.id, '❤️')}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                  title="React with heart"
                >
                  ❤️
                </button>
                <button
                  onClick={() => handleReaction(message.id, '😂')}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                  title="React with laugh"
                >
                  😂
                </button>
                <button
                  onClick={() => handleReaction(message.id, '✅')}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                  title="React with check"
                >
                  ✅
                </button>
                <button
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors border-t border-gray-200"
                  title="More reactions"
                >
                  <Plus className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              {message.attachments[0].isUploading ? (
                // Loading state for uploading image
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Uploading image...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              ) : (
                <img
                  src={message.attachments[0].url}
                  alt="Shared image"
                  className="rounded max-w-full max-h-[270px] h-auto cursor-pointer object-cover"
                  onClick={() => window.open(message.attachments[0].url, '_blank')}
                  loading="lazy"
                />
              )}
              
              {/* Emoji Picker for Image Reactions */}
              {showReactionPicker && (
                <div 
                  className={`emoji-picker-container absolute ${message.sender.email === session?.user?.email ? '-left-80' : '-right-80'} -top-4 z-50`}
                  style={{ position: 'absolute' }}
                >
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-80 overflow-hidden">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">Choose a reaction</h3>
                      <button
                        onClick={() => setShowReactionPicker(false)}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                        title="Close"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* Simple emoji grid for reactions */}
                    <div className="p-3">
                      <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
                        {[
                          "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
                          "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
                          "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
                          "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
                          "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
                          "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️",
                          "👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙",
                          "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋",
                          "🔥", "💯", "💥", "💫", "💦", "💨", "🕳️", "💣", "💤", "💢",
                          "💨", "💫", "💥", "💦", "💤", "🕳️", "💣", "💢", "❗", "❓",
                          "✅", "❌", "🆘", "⭐", "🌟", "✨", "💎", "🔱", "⚡", "💡",
                          "💰", "💵", "💴", "💶", "💷", "🪙", "💸", "💳", "🧾", "💹"
                        ].map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Attachments - No background */}
          {message.type === "attachment" && message.attachments?.length > 0 && (
            <div className="mb-2 group relative">
              {/* Reaction buttons for attachments */}
              <div className={`absolute ${message.sender.email === session?.user?.email ? '-left-12' : '-right-12'} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 bg-white rounded-full shadow-lg border p-1 z-10`}>
                <button
                  onClick={() => handleReaction(message.id, '❤️')}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                  title="React with heart"
                >
                  ❤️
                </button>
                <button
                  onClick={() => handleReaction(message.id, '😂')}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                  title="React with laugh"
                >
                  😂
                </button>
                <button
                  onClick={() => handleReaction(message.id, '✅')}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                  title="React with check"
                >
                  ✅
                </button>
                <button
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors border-t border-gray-200"
                  title="More reactions"
                >
                  <Plus className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              {message.attachments.map((attachment, index) => (
                attachment.isUploading ? (
                  // Loading state for uploading attachments
                  <div key={index} className="mb-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploading... • {attachment.type}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                ) : attachment.mimeType?.startsWith('audio/') ? (
                  // Audio player for audio files
                  <div key={index} className="mb-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • Audio
                          </p>
                        </div>
                      </div>
                      <audio 
                        controls 
                        className="w-full h-8"
                        preload="metadata"
                      >
                        <source src={attachment.url} type={attachment.mimeType} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                ) : (
                  // Regular file attachment
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                  <div className="flex-shrink-0">
                    {attachment.type === "image" ? (
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="w-10 h-10 object-cover rounded border border-gray-200 max-h-10"
                        loading="lazy"
                      />
                    ) : attachment.type === "document" ? (
                      <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    ) : attachment.mimeType?.startsWith('audio/') ? (
                      <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    ) : attachment.mimeType?.includes('csv') || attachment.mimeType?.includes('excel') || attachment.mimeType?.includes('spreadsheet') ? (
                      <div className="w-10 h-10 bg-green-50 border border-green-200 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {attachment.type}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
                )
              ))}
              
              {/* Emoji Picker for Attachment Reactions */}
              {showReactionPicker && (
                <div 
                  className={`emoji-picker-container absolute ${message.sender.email === session?.user?.email ? '-left-80' : '-right-80'} -top-4 z-50`}
                  style={{ position: 'absolute' }}
                >
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-80 overflow-hidden">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">Choose a reaction</h3>
                      <button
                        onClick={() => setShowReactionPicker(false)}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                        title="Close"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* Simple emoji grid for reactions */}
                    <div className="p-3">
                      <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
                        {[
                          "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
                          "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
                          "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
                          "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
                          "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
                          "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️",
                          "👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙",
                          "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋",
                          "🔥", "💯", "💥", "💫", "💦", "💨", "🕳️", "💣", "💤", "💢",
                          "💨", "💫", "💥", "💦", "💤", "🕳️", "💣", "💢", "❗", "❓",
                          "✅", "❌", "🆘", "⭐", "🌟", "✨", "💎", "🔱", "⚡", "💡",
                          "💰", "💵", "💴", "💶", "💷", "🪙", "💸", "💳", "🧾", "💹"
                        ].map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Text content - With background */}
          {message.content && (
            <div>
              <div
                className={`rounded-lg px-4 py-2 group relative max-w-full ${
                  message.sender.email === session?.user?.email 
                    ? `bg-[#4a7c59] text-white ${message.isOptimistic ? 'opacity-70' : ''} ${message.isFailed ? 'bg-red-500' : ''}` 
                    : "bg-white text-gray-900 border"
                }`}
                title={formatFullTimestamp(message.createdAt)}
              >
                {/* Reaction buttons - show on hover */}
                <div className={`absolute ${message.sender.email === session?.user?.email ? '-left-12' : '-right-12'} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 bg-white rounded-full shadow-lg border p-1`}>
                  <button
                    onClick={() => handleReaction(message.id, '❤️')}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                    title="React with heart"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => handleReaction(message.id, '😂')}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                    title="React with laugh"
                  >
                    😂
                  </button>
                  <button
                    onClick={() => handleReaction(message.id, '✅')}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                    title="React with check"
                  >
                    ✅
                  </button>
                  <button
                    ref={reactionPickerRef}
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors border-t border-gray-200"
                    title="More reactions"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
                
                {/* Emoji Picker for Reactions */}
                {showReactionPicker && (
                  <div 
                    className={`emoji-picker-container absolute ${message.sender.email === session?.user?.email ? '-left-80' : '-right-80'} -top-4 z-50`}
                    style={{ position: 'absolute' }}
                  >
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-80 overflow-hidden">
                      {/* Header with close button */}
                      <div className="flex items-center justify-between p-3 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700">Choose a reaction</h3>
                        <button
                          onClick={() => setShowReactionPicker(false)}
                          className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                          title="Close"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {/* Simple emoji grid for reactions */}
                      <div className="p-3">
                        <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
                          {[
                            "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
                            "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
                            "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
                            "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
                            "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
                            "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️",
                            "👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙",
                            "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋",
                            "🔥", "💯", "💥", "💫", "💦", "💨", "🕳️", "💣", "💤", "💢",
                            "💨", "💫", "💥", "💦", "💤", "🕳️", "💣", "💢", "❗", "❓",
                            "✅", "❌", "🆘", "⭐", "🌟", "✨", "💎", "🔱", "⚡", "💡",
                            "💰", "💵", "💴", "💶", "💷", "🪙", "💸", "💳", "🧾", "💹"
                          ].map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-all text-left max-w-full overflow-hidden message-content" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {renderTextWithLinks(message.content, message.sender.email === session?.user?.email)}
                </p>
                
                {/* Loading/Error indicators for optimistic messages */}
                {message.sender.email === session?.user?.email && (
                  <div className="flex items-center justify-end mt-1 gap-1">
                    {message.isOptimistic && (
                      <Loader2 className="h-3 w-3 animate-spin opacity-60" />
                    )}
                    {message.isFailed && (
                      <AlertCircle className="h-3 w-3 text-red-200" title="Failed to send" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Link Previews - positioned right after message bubble with no gap */}
              {message.content && extractUrls(message.content).length > 0 && (
                <div className="w-full">
                  {extractUrls(message.content).map((url, index) => (
                    <LinkPreview 
                      key={`${message.id}-${index}`} 
                      url={url}
                      className="w-full"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Reactions display - positioned below message bubble */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`mt-1 ${message.sender.email === session?.user?.email ? 'flex justify-end' : 'flex justify-start'}`}>
              <div className={`flex gap-1 max-w-full ${message.sender.email === session?.user?.email ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(
                  message.reactions.reduce((acc, reaction) => {
                    if (!acc[reaction.emoji]) {
                      acc[reaction.emoji] = { count: 0, users: [], hasOptimistic: false }
                    }
                    acc[reaction.emoji].count++
                    acc[reaction.emoji].users.push(reaction.user)
                    if (reaction.isOptimistic) {
                      acc[reaction.emoji].hasOptimistic = true
                    }
                    return acc
                  }, {})
                ).map(([emoji, data]) => (
                  <div
                    key={emoji}
                    className={`flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-xs cursor-pointer transition-colors shadow-sm ${
                      data.hasOptimistic ? 'opacity-70 animate-pulse' : ''
                    }`}
                    onClick={() => handleReaction(message.id, emoji)}
                    title={`${data.users.length} user${data.users.length > 1 ? 's' : ''} reacted${data.hasOptimistic ? ' (sending...)' : ''}`}
                  >
                    <span>{emoji}</span>
                    {data.count > 1 && <span className="text-gray-600 font-medium">{data.count}</span>}
                    {data.hasOptimistic && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Seen indicator - positioned outside message bubble like Messenger */}
          {message.sender.email === session?.user?.email && 
           !message.isOptimistic && 
           !message.isFailed && 
           message.seenBy && 
           message.seenBy.length > 0 && (
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400">Seen</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

export default MessageItem
