"use client"

import { memo } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import LazyAvatar from "./LazyAvatar"

// Memoized message component for better performance
const MessageItem = memo(({ 
  message, 
  previousMessage, 
  session, 
  formatTimestamp, 
  formatFullTimestamp, 
  shouldShowTimestamp 
}) => {
  const showTimestamp = shouldShowTimestamp(message, previousMessage)
  
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
        <div className={`max-w-[70%] min-w-0 ${message.sender.email === session?.user?.email ? "text-right" : ""}`}>
          {message.sender.email !== session?.user?.email && (
            <p className="text-sm font-medium text-[#2c3e2d] mb-1">{message.sender.name}</p>
          )}
          
          {/* Images - No background */}
          {message.type === "image" && message.attachments?.length > 0 && (
            <div className="mb-2">
              <img
                src={message.attachments[0].url}
                alt="Shared image"
                className="rounded max-w-full max-h-[270px] h-auto cursor-pointer object-cover"
                onClick={() => window.open(message.attachments[0].url, '_blank')}
                loading="lazy"
              />
            </div>
          )}
          
          {/* Attachments - No background */}
          {message.type === "attachment" && message.attachments?.length > 0 && (
            <div className="mb-2">
              {message.attachments.map((attachment, index) => (
                attachment.mimeType?.startsWith('audio/') ? (
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
            </div>
          )}
          
          {/* Text content - With background */}
          {message.content && (
            <div
              className={`rounded-lg px-4 py-2 group relative ${
                message.sender.email === session?.user?.email 
                  ? `bg-[#4a7c59] text-white ${message.isOptimistic ? 'opacity-70' : ''} ${message.isFailed ? 'bg-red-500' : ''}` 
                  : "bg-white text-gray-900 border"
              }`}
              title={formatFullTimestamp(message.createdAt)}
            >
              <p className="text-sm">{message.content}</p>
              
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
              
              {/* Hover timestamp tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {formatFullTimestamp(message.createdAt)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

export default MessageItem
