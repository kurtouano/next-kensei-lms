"use client"

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Send, ImageIcon, Paperclip, Smile, Loader2, User, Users, Plus, Menu, X, Search, Check, Globe, MoreVertical, Edit, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { useChat, useChatMessages } from "@/hooks/useChat"
import { usePublicGroups } from "@/hooks/usePublicGroups"
import { uploadChatImage, uploadChatAttachment } from "@/lib/chatFileUpload"
import MessageItem from "./MessageItem"
import LazyAvatar from "./LazyAvatar"
import EmojiPicker from "./EmojiPicker"
import { 
  ChatListSkeleton, 
  ChatListSidebarSkeleton,
  ChatMessagesSkeleton, 
  ChatHeaderSkeleton, 
  MessageInputSkeleton,
  LoadingMoreChatsSkeleton,
  LoadingMoreMessagesSkeleton 
} from "@/components/ChatSkeleton"

// Lazy load the modals
const CreateGroupChatModal = lazy(() => import("./CreateGroupChatModal"))
const GroupInviteModal = lazy(() => import("./GroupInviteModal"))
const LeaveGroupModal = lazy(() => import("./LeaveGroupModal"))
const EditGroupModal = lazy(() => import("./EditGroupModal"))
const GroupMembersModal = lazy(() => import("./GroupMembersModal"))

export default function ChatInterface() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef(null)
  const generalFileInputRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const messageInputRef = useRef(null)
  const scrollPositionRef = useRef(null)
  const sidebarScrollPositionRef = useRef(null)

  // Chat hooks
  const { chats, loading: chatsLoading, error: chatsError, pagination, loadMoreChats, updateChatWithNewMessage, refetch: refetchChats } = useChat()
  const { 
    messages, 
    loading: messagesLoading, 
    isLoadingMore,
    messagesEndRef, 
    sendMessage, 
    sendAttachmentOptimistic,
    loadMoreMessages,
    hasMore,
    handleReaction,
    deleteMessage,
    refetch: refetchMessages
  } = useChatMessages(selectedChatId, updateChatWithNewMessage)
  
  // Public groups hook
  const { 
    publicGroups, 
    loading: publicGroupsLoading, 
    loadingMore: publicGroupsLoadingMore,
    error: publicGroupsError, 
    pagination: publicGroupsPagination,
    loadMore: loadMorePublicGroups,
    refetch: refetchPublicGroups,
    joinGroup, 
    leaveGroup, 
    createPublicGroup 
  } = usePublicGroups()
  const [uploading, setUploading] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false)
  const [leavingGroupId, setLeavingGroupId] = useState(null)
  const [leavingGroupName, setLeavingGroupName] = useState("")
  const [showEditGroupModal, setShowEditGroupModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiButtonRef = useRef(null)
  const sidebarRef = useRef(null)
  const isLoadingMoreChats = useRef(false)
  const [messageHeight, setMessageHeight] = useState(32) // Initial height for textarea
  const [fileErrorPopup, setFileErrorPopup] = useState(null) // For file upload error popup
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobile sidebar state
  const [isInitialChatLoad, setIsInitialChatLoad] = useState(false) // Track initial chat load
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Track overall initial load
  const [activeTab, setActiveTab] = useState("chats") // Sidebar tab state
  const discoverScrollRef = useRef(null)


  // Handle URL parameters for auto-opening specific chat
  useEffect(() => {
    const chatIdFromUrl = searchParams.get('chatId')
    const autoOpen = searchParams.get('autoOpen')
    
    if (chatIdFromUrl && chats.length > 0) {
      // Find the chat with the specified ID
      const targetChat = chats.find(chat => chat.id === chatIdFromUrl)
      if (targetChat) {
        console.log('🎯 Auto-opening chat:', chatIdFromUrl, 'autoOpen:', autoOpen)
        setSelectedChatId(chatIdFromUrl)
        // If autoOpen is true, focus the message input
        if (autoOpen === 'true' && messageInputRef.current) {
          setTimeout(() => {
            messageInputRef.current?.focus()
          }, 500) // Small delay to ensure the chat is loaded
        }
      } else {
        console.log('❌ Chat not found:', chatIdFromUrl, 'Available chats:', chats.map(c => c.id))
      }
    }
  }, [chats, searchParams])

  // Fallback: Handle chatId from URL even if chats are still loading
  useEffect(() => {
    const chatIdFromUrl = searchParams.get('chatId')
    if (chatIdFromUrl && !selectedChatId && !chatsLoading) {
      console.log('🔄 Fallback: Setting chatId from URL:', chatIdFromUrl)
      setSelectedChatId(chatIdFromUrl)
    }
  }, [searchParams, selectedChatId, chatsLoading])

  // Auto-select first chat if no specific chat is selected (only if no chatId in URL)
  useEffect(() => {
    const chatIdFromUrl = searchParams.get('chatId')
    if (chats.length > 0 && !selectedChatId && !chatIdFromUrl) {
      console.log('🔄 Auto-selecting first chat (no chatId in URL)')
      setSelectedChatId(chats[0].id)
    }
  }, [chats, selectedChatId, searchParams])

  // Set initial chat load state when a chat is selected
  useEffect(() => {
    if (selectedChatId) {
      setIsInitialChatLoad(true)
    } else {
      setIsInitialChatLoad(false)
    }
  }, [selectedChatId])

  // Reset initial load state when messages are loaded or when there's an error
  useEffect(() => {
    if (!messagesLoading && (messages.length >= 0 || selectedChatId === null)) {
      setIsInitialChatLoad(false)
    }
  }, [messagesLoading, messages.length, selectedChatId])

  // Manage overall initial load state - hide loading when chats are loaded (even if empty)
  useEffect(() => {
    if (!chatsLoading) {
      // Hide loading when chats are loaded, regardless of whether there are chats or not
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [chatsLoading])


  // Listen for chat refresh events (e.g., after role changes)
  useEffect(() => {
    const handleChatRefresh = () => {
      if (selectedChatId) {
        // Trigger a refetch of messages to show system messages
        setTimeout(() => {
          // Force refresh messages by calling the refetch function
          if (typeof refetchMessages === 'function') {
            refetchMessages()
          }
        }, 100)
      }
    }

    window.addEventListener('chatRefresh', handleChatRefresh)
    return () => window.removeEventListener('chatRefresh', handleChatRefresh)
  }, [selectedChatId, refetchMessages])

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      
      // If user scrolled to top and there are more messages
      if (scrollTop === 0 && hasMore && !messagesLoading && !isLoadingMore) {
        // Store current scroll position before loading more
        scrollPositionRef.current = {
          scrollHeight,
          scrollTop
        }
        loadMoreMessages()
      }
    }
  }, [hasMore, messagesLoading, isLoadingMore, loadMoreMessages])

  // Handle sidebar scroll for infinite loading
  const handleSidebarScroll = useCallback(() => {
    if (sidebarRef.current && pagination?.hasMore && !chatsLoading && !isLoadingMoreChats.current) {
      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current
      
      // If user scrolled to bottom and there are more chats
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        // Store current scroll position before loading more
        sidebarScrollPositionRef.current = {
          scrollHeight,
          scrollTop
        }
        isLoadingMoreChats.current = true
        loadMoreChats()
      }
    }
  }, [pagination?.hasMore, chatsLoading, loadMoreChats])

  // Handle discover tab scroll for infinite loading
  const handleDiscoverScroll = useCallback(() => {
    if (discoverScrollRef.current && publicGroupsPagination?.hasMore && !publicGroupsLoading && !publicGroupsLoadingMore) {
      const { scrollTop, scrollHeight, clientHeight } = discoverScrollRef.current
      
      // If user scrolled to bottom and there are more public groups
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        loadMorePublicGroups()
      }
    }
  }, [publicGroupsPagination?.hasMore, publicGroupsLoading, publicGroupsLoadingMore, loadMorePublicGroups])

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Attach sidebar scroll listener
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (sidebar) {
      sidebar.addEventListener("scroll", handleSidebarScroll)
      return () => sidebar.removeEventListener("scroll", handleSidebarScroll)
    }
  }, [handleSidebarScroll])

  // Attach discover tab scroll listener
  useEffect(() => {
    const discoverContainer = discoverScrollRef.current
    if (discoverContainer && activeTab === "discover") {
      discoverContainer.addEventListener("scroll", handleDiscoverScroll)
      return () => discoverContainer.removeEventListener("scroll", handleDiscoverScroll)
    }
  }, [handleDiscoverScroll, activeTab])

  // Reset loading flag when chats loading is complete
  useEffect(() => {
    if (!chatsLoading) {
      isLoadingMoreChats.current = false
    }
  }, [chatsLoading])

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (!isLoadingMore && scrollPositionRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const { scrollHeight: oldScrollHeight } = scrollPositionRef.current
      const newScrollHeight = container.scrollHeight
      const heightDifference = newScrollHeight - oldScrollHeight
      
      // Restore scroll position by adjusting for the new content height
      // Add a small offset to account for multiple messages being loaded
      container.scrollTop = heightDifference + 50
      scrollPositionRef.current = null
    }
  }, [isLoadingMore, messages])

  // Restore sidebar scroll position after loading more chats
  useEffect(() => {
    if (!chatsLoading && sidebarScrollPositionRef.current && sidebarRef.current) {
      // Add a small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        const sidebar = sidebarRef.current
        if (!sidebar) return
        
        const { scrollHeight: oldScrollHeight, scrollTop: oldScrollTop } = sidebarScrollPositionRef.current
        const newScrollHeight = sidebar.scrollHeight
        const heightDifference = newScrollHeight - oldScrollHeight
        
        
        // Restore scroll position by adjusting for the new content height
        // The new scroll position should be the old position plus the height of new content
        sidebar.scrollTop = oldScrollTop + heightDifference
        sidebarScrollPositionRef.current = null
      }, 50) // Small delay to ensure DOM updates
      
      return () => clearTimeout(timeoutId)
    }
  }, [chatsLoading, chats])

  // Handle sending messages with optimistic updates
  const handleSendMessage = async () => {
    const messageText = messageInputRef.current?.value?.trim()
    if (!messageText || !selectedChatId) return

    // Check if user is still a participant in the chat
    if (!isUserParticipant) {
      return
    }

    // Clear input immediately for fast UX
    if (messageInputRef.current) {
      messageInputRef.current.value = ""
      messageInputRef.current.style.height = '32px' // Reset height
    }
    setMessage("")
    setMessageHeight(32) // Reset height state

    // Prevent mobile zoom and reset viewport after sending
    if (window.innerWidth <= 768) {
      // Blur the input to prevent zoom
      if (messageInputRef.current) {
        messageInputRef.current.blur()
      }
      
      // Reset viewport after a short delay
      setTimeout(() => {
        const viewport = document.querySelector('meta[name="viewport"]')
        if (viewport) {
          viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        }
      }, 100)
    }

    try {
      // Send message optimistically (shows instantly, loads in background)
      await sendMessage(messageText)
    } catch (error) {
      console.error("Failed to send message:", error)
      // Don't show alert for better UX - the message will show as failed
    }
  }

  // Optimized message change handler - direct state update
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 32), 120) // Min 32px, max 120px
    textarea.style.height = `${newHeight}px`
    setMessageHeight(newHeight)
  }, [])

  // Handle key press with useCallback to prevent re-renders
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
    // Allow Shift+Enter for new lines (default textarea behavior)
  }, [handleSendMessage])

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji) => {
    if (messageInputRef.current) {
      const textarea = messageInputRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentMessage = message
      const newMessage = currentMessage.slice(0, start) + emoji + currentMessage.slice(end)
      
      setMessage(newMessage)
      
      // Update the textarea value and cursor position
      textarea.value = newMessage
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      
      // Trigger auto-resize
      textarea.style.height = 'auto'
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120)
      textarea.style.height = `${newHeight}px`
      setMessageHeight(newHeight)
    }
  }, [message])

  // Typing indicator disabled to prevent UI delays
  // useEffect(() => {
  //   if (!selectedChatId) return
  //   // Typing indicator temporarily disabled to fix typing delays
  // }, [message, selectedChatId, sendTypingIndicator])

  // Handle image upload with optimistic updates
  const handleImageUpload = async (file) => {
    if (!selectedChatId || uploading) return

    try {
      setUploading(true)
      
      // Use optimistic upload - shows immediately, uploads in background
      await sendAttachmentOptimistic(file, "image", "image")
      
    } catch (error) {
      console.error("Failed to upload image:", error)
      setFileErrorPopup({
        title: "Upload failed",
        description: `Failed to upload image: ${error.message}`
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate that it's actually an image file
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
      
      if (allowedImageTypes.includes(file.type)) {
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          setFileErrorPopup({
            title: "Image too large",
            description: `Maximum size is 10MB. Your image is ${(file.size / 1024 / 1024).toFixed(1)}MB`
          })
          e.target.value = ""
          return
        }
        handleImageUpload(file)
      } else {
        setFileErrorPopup({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, WebP, GIF, or SVG)"
        })
        // Reset the input
        e.target.value = ""
      }
    }
  }

  // Handle general file selection with optimistic updates
  const handleGeneralFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedChatId || uploading) return

    // Client-side validation (exclude images since there's a dedicated image button)
    const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf']
    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg']
    const allowedSpreadsheetTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
    const allowedTypes = [...allowedDocumentTypes, ...allowedAudioTypes, ...allowedSpreadsheetTypes]
    
    // Explicitly reject image files
    if (file.type.startsWith('image/')) {
      setFileErrorPopup({
        title: "Use the image button",
        description: "Please use the image button (📷) for photos and images. This button is for documents, audio, and spreadsheets."
      })
      e.target.value = ""
      return
    }
    
    if (!allowedTypes.includes(file.type)) {
      setFileErrorPopup({
        title: "File type not supported",
        description: "Please select: Documents (PDF, DOC, DOCX, TXT), Audio (MP3, WAV, M4A, OGG), or Spreadsheets (XLS, XLSX, CSV). Use the image button for photos."
      })
      e.target.value = ""
      return
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setFileErrorPopup({
        title: "File too large",
        description: `Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`
      })
      e.target.value = ""
      return
    }

    try {
      setUploading(true)
      
      // Determine file type for proper categorization
      let detectedFileType = 'general' // default
      
      if (allowedDocumentTypes.includes(file.type)) {
        detectedFileType = 'document'
      } else if (allowedAudioTypes.includes(file.type)) {
        detectedFileType = 'audio'
      } else if (allowedSpreadsheetTypes.includes(file.type)) {
        detectedFileType = 'spreadsheet'
      }
      
      
      // Use optimistic upload - shows immediately, uploads in background
      await sendAttachmentOptimistic(file, "attachment", detectedFileType)
      
    } catch (error) {
      console.error("Failed to upload file:", error)
      setFileErrorPopup({
        title: "Upload failed",
        description: `Failed to upload file: ${error.message}`
      })
    } finally {
      setUploading(false)
      // Reset the input
      e.target.value = ""
    }
  }

  // Render user avatar
  const renderAvatar = (user) => {
    if (user.icon === "bonsai" && user.bonsai) {
      return (
        <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-full border border-[#4a7c59]">
          <BonsaiSVG 
            level={user.bonsai.level || 1}
            treeColor={user.bonsai.customization?.foliageColor || '#77DD82'} 
            potColor={user.bonsai.customization?.potColor || '#FD9475'} 
            selectedEyes={user.bonsai.customization?.eyes || 'default_eyes'}
            selectedMouth={user.bonsai.customization?.mouth || 'default_mouth'}
            selectedPotStyle={user.bonsai.customization?.potStyle || 'default_pot'}
            selectedGroundStyle={user.bonsai.customization?.groundStyle || 'default_ground'}
            selectedHat={user.bonsai.customization?.hat || null}
            selectedBackground={user.bonsai.customization?.background || null}
            zoomed={true}
            profileIcon={true}
          />
        </div>
      )
    } else if (user.icon && user.icon.startsWith("http")) {
      return (
        <img 
          src={user.icon} 
          alt={user.name} 
          className="h-full w-full object-cover rounded-full"
        />
      )
    }
    
    return (
      <div className="h-full w-full rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-sm font-medium">
        {user.name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    )
  }

  // Format timestamp for display (show actual time, not relative)
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    // Check if it's the same day
    const isSameDay = date.toDateString() === now.toDateString()
    
    if (isSameDay) {
      // Show time for same day (e.g., "6:39 PM")
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
    } else {
      // Show date and time for different days (e.g., "Dec 25, 6:39 PM")
      return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + 
             date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
    }
  }

  // Format full timestamp for tooltip
  const formatFullTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Check if we should show timestamp between messages
  const shouldShowTimestamp = (currentMessage, previousMessage) => {
    if (!previousMessage) return true // Show timestamp for first message
    
    const currentTime = new Date(currentMessage.createdAt)
    const previousTime = new Date(previousMessage.createdAt)
    const diffInMinutes = Math.floor((currentTime - previousTime) / (1000 * 60))
    
    // Show timestamp if more than 15 minutes have passed OR it's a different day
    const isDifferentDay = currentTime.toDateString() !== previousTime.toDateString()
    return diffInMinutes >= 15 || isDifferentDay
  }

  const selectedChat = chats.find(chat => chat.id === selectedChatId)
  const filteredChats = chats.filter(chat => {
    // First filter by search query
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Then check if user is actually a participant in the chat
    const isUserParticipant = chat.participants?.some(participant => 
      (participant._id || participant.id)?.toString() === session?.user?.id?.toString()
    )
    
    return matchesSearch && isUserParticipant
  })

  // Check if current user is still a participant in the selected chat
  const isUserParticipant = selectedChat ? 
    selectedChat.participants?.some(participant => 
      (participant._id || participant.id)?.toString() === session?.user?.id?.toString()
    ) : false

  // Check if current user is an admin of the selected chat
  const isUserAdmin = selectedChat ? 
    selectedChat.participants?.some(participant => 
      (participant._id || participant.id)?.toString() === session?.user?.id?.toString() && 
      participant.role === 'admin'
    ) : false

  // Debug: Log admin check
  console.log('Debug - selectedChat:', selectedChat)
  console.log('Debug - participants:', selectedChat?.participants)
  console.log('Debug - session user id:', session?.user?.id)
  console.log('Debug - isUserAdmin:', isUserAdmin)

  // Handle joining/leaving public groups
  const handleJoinGroup = async (groupId) => {
    try {
      const group = publicGroups.find((g) => g.id === groupId)
      if (!group) return

      if (group.isJoined) {
        // Show leave confirmation modal
        setLeavingGroupId(groupId)
        setLeavingGroupName(group.name)
        setShowLeaveGroupModal(true)
      } else {
        // Join group
        await joinGroup(groupId)
        // Refresh chats to add the group to user's chats
        refetchChats()
        // Optionally switch to the joined group chat
        // setSelectedChatId(groupId)
      }
    } catch (error) {
      console.error("Error joining/leaving group:", error)
      // You could show a toast notification here
    }
  }

  // Handle confirming leave group
  const handleConfirmLeaveGroup = async () => {
    try {
      await leaveGroup(leavingGroupId)
      // Refresh chats to remove the group from user's chats
      refetchChats()
      // Close modal
      setShowLeaveGroupModal(false)
      setLeavingGroupId(null)
      setLeavingGroupName("")
    } catch (error) {
      console.error("Error leaving group:", error)
      // You could show a toast notification here
    }
  }

  // Handle canceling leave group
  const handleCancelLeaveGroup = () => {
    setShowLeaveGroupModal(false)
    setLeavingGroupId(null)
    setLeavingGroupName("")
  }

  return (
    <div className="bg-gray-50 overflow-x-hidden flex flex-col">
      <div className="flex-1 flex items-center justify-center lg:py-4">
        <div className="w-full max-w-[86rem] mx-auto">
          <div className="flex h-[calc(100vh-8.4rem)] lg:h-[calc(100vh-11rem)]">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Chat List Sidebar */}
          <div className={`
            ${isSidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-80' : 'hidden'} 
            lg:block lg:relative lg:w-1/4 lg:z-auto
            transition-transform duration-300 ease-in-out
          `}>
            <Card className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-[#2c3e2d]">Messages</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarOpen(false)}
                      className="lg:hidden text-gray-500 hover:text-gray-700"
                      title="Close sidebar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="chats">My Chats</TabsTrigger>
                    <TabsTrigger value="discover">
                      Discover
                      <Globe className="h-3 w-3 ml-1" />
                    </TabsTrigger>
                  </TabsList>
                  <div className="relative flex items-center gap-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 flex-1"
                    />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateGroupModal(true)}
                    className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb]"
                    title={activeTab === "discover" && (session?.user?.role === 'admin' || session?.user?.role === 'instructor') 
                      ? "Create Public Group" 
                      : "Create Group Chat"
                    }
                    disabled={activeTab === "discover" && !(session?.user?.role === 'admin' || session?.user?.role === 'instructor')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  </div>
                </div>

                <TabsContent value="chats" className="flex-1 overflow-y-auto m-0">
                  <div ref={sidebarRef} className="h-full overflow-y-auto overflow-x-hidden">
                    {chatsLoading && chats.length === 0 ? (
                      <ChatListSkeleton count={10} />
                    ) : chatsError ? (
                      <div className="p-4 text-center">
                        <p className="text-red-500 text-sm">Error loading chats</p>
                        <p className="text-gray-500 text-xs mt-1">{chatsError}</p>
                      </div>
                    ) : filteredChats.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-gray-500 text-sm">No chats yet</p>
                        <p className="text-gray-400 text-xs mt-1">Start a conversation with a friend!</p>
                      </div>
                    ) : (
                      <>
                        {filteredChats.map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => {
                              setSelectedChatId(chat.id)
                              // Close sidebar on mobile when chat is selected
                              if (window.innerWidth < 1024) {
                                setIsSidebarOpen(false)
                              }
                            }}
                            className={`p-3 sm:p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedChatId === chat.id ? "bg-[#eef2eb] border-l-4 border-l-[#4a7c59]" : ""
                            }`}
                          >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative">
                              {chat.type === "group" || chat.type === "public_group" ? (
                                <div className="w-8 h-8 sm:w-10 sm:h-10">
                                  {(chat.avatar && chat.avatar !== null) ? (
                                    <img 
                                      src={chat.avatar} 
                                      alt={chat.name} 
                                      className="h-full w-full object-cover rounded-full"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="h-full w-full rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-sm font-medium"
                                    style={{ display: (chat.avatar && chat.avatar !== null) ? 'none' : 'flex' }}
                                  >
                                    {chat.name?.charAt(0)?.toUpperCase() || "G"}
                                  </div>
                                </div>
                              ) : (
                                <LazyAvatar 
                                  user={{ 
                                    id: chat.otherParticipant?.id || chat.participants?.[0]?.id, 
                                    icon: chat.otherParticipant?.icon || chat.participants?.[0]?.icon || chat.avatar, 
                                    name: chat.name,
                                    bonsai: chat.otherParticipant?.bonsai || chat.participants?.[0]?.bonsai
                                  }} 
                                  size="w-8 h-8 sm:w-10 sm:h-10" 
                                />
                              )}
                              {chat.isOnline && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 max-w-[250px] sm:max-w-none">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 min-w-0 flex-1">
                                  <h3 className="font-medium text-sm text-[#2c3e2d] truncate">
                                    {chat.name}
                                  </h3>
                                  {chat.type === "group" && (
                                    <Users className="h-3 w-3 text-[#4a7c59] flex-shrink-0 ml-1 mr-2" />
                                  )}
                                  {chat.type === "public_group" && (
                                    <Globe className="h-3 w-3 text-[#4a7c59] flex-shrink-0 ml-1 mr-2" />
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {chat.lastMessage?.createdAt && new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {chat.lastMessage ? (
                                  <>
                                    {chat.lastMessage.isCurrentUser && "You: "}
                                    {(() => {
                                      if (chat.lastMessage.type === "system") {
                                        return chat.lastMessage.content
                                      } else if (chat.lastMessage.type === "image") {
                                        return "sent an image"
                                      } else if (chat.lastMessage.type === "attachment" || chat.lastMessage.type === "file") {
                                        // Check attachment type for more specific message
                                        const attachment = chat.lastMessage.attachments?.[0]
                                        if (attachment?.mimeType) {
                                          if (attachment.mimeType.startsWith('audio/')) {
                                            return "sent an audio file"
                                          } else if (attachment.mimeType === 'application/pdf') {
                                            return "sent a PDF"
                                          } else if (attachment.mimeType.includes('document') || attachment.mimeType.includes('word')) {
                                            return "sent a document"
                                          } else if (attachment.mimeType.includes('excel') || attachment.mimeType.includes('spreadsheet') || attachment.mimeType.includes('csv')) {
                                            return "sent a spreadsheet"
                                          } else if (attachment.mimeType.startsWith('image/')) {
                                            return "sent an image"
                                          } else {
                                            return "sent a file"
                                          }
                                        }
                                        return "sent an attachment"
                                      } else {
                                        return chat.lastMessage.content || "sent a message"
                                      }
                                    })()}
                                  </>
                                ) : "No messages yet"}
                              </p>
                            </div>
                            {chat.unreadCount > 0 && (
                              <div className="bg-[#4a7c59] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {chat.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                        
                        {/* Skeleton Loading for More Chats */}
                        {chats.length > 0 && pagination?.hasMore && (isLoadingMoreChats.current || chatsLoading) && (
                          <LoadingMoreChatsSkeleton />
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="discover" className="flex-1 overflow-y-auto m-0 p-4 space-y-4" ref={discoverScrollRef}>
                  {publicGroupsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-3 bg-white rounded-lg border animate-pulse">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              <div className="flex gap-2">
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                                <div className="h-3 bg-gray-200 rounded w-12"></div>
                              </div>
                            </div>
                            <div className="w-16 h-8 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : publicGroupsError ? (
                    <div className="p-4 text-center">
                      <p className="text-red-500 text-sm">Error loading public groups</p>
                      <p className="text-gray-500 text-xs mt-1">{publicGroupsError}</p>
                    </div>
                  ) : publicGroups.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-gray-500 text-sm">No public groups available</p>
                      <p className="text-gray-400 text-xs mt-1">Check back later for new groups!</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-[#2c3e2d] flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#4a7c59]" />
                          Public Groups
                        </h3>
                        {publicGroups.map((group) => (
                            <div key={group.id} className="p-3 bg-white rounded-lg border hover:shadow-md transition-all">
                              <div className="flex items-start gap-3">
                                <img
                                  src={group.avatar || "/placeholder.svg"}
                                  alt={group.name}
                                  className="w-12 h-12 rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-[#2c3e2d] truncate">{group.name}</h4>
                                  <p className="text-xs text-gray-600 line-clamp-2">{group.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">{group.members} members</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={group.isJoined ? "outline" : "default"}
                                  className={
                                    group.isJoined
                                      ? "h-8 text-xs"
                                      : "h-8 text-xs bg-[#4a7c59] hover:bg-[#3a6147]"
                                  }
                                  onClick={() => handleJoinGroup(group.id)}
                                >
                                  {group.isJoined ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Joined
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-3 w-3 mr-1" />
                                      Join
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>


                      {/* Load More Indicator */}
                      {publicGroupsPagination?.hasMore && (
                        <div className="text-center py-4">
                          {publicGroupsLoadingMore ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm text-gray-600">Loading more groups...</span>
                              </div>
                              {/* Skeleton loading for more groups */}
                              <div className="space-y-2">
                                {[...Array(2)].map((_, i) => (
                                  <div key={i} className="p-3 bg-white rounded-lg border animate-pulse">
                                    <div className="flex items-start gap-3">
                                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                      <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="flex gap-2">
                                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                                        </div>
                                      </div>
                                      <div className="w-16 h-8 bg-gray-200 rounded"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={loadMorePublicGroups}
                              className="text-[#4a7c59] hover:text-[#3a6147]"
                            >
                              Load More Groups
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="flex-1 lg:w-3/4 min-w-0">
            <Card className="h-full flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 sm:p-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Menu Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsSidebarOpen(true)}
                          className="lg:hidden text-gray-500 hover:text-gray-700"
                          title="Open chat list"
                        >
                          <Menu className="h-5 w-5" />
                        </Button>
                        <div className="w-8 h-8 sm:w-10 sm:h-10">
                          {selectedChat.type === "group" || selectedChat.type === "public_group" ? (
                            <div className="h-full w-full relative">
                              {(selectedChat.avatar && selectedChat.avatar !== null) ? (
                                <img 
                                  src={selectedChat.avatar} 
                                  alt={selectedChat.name} 
                                  className="h-full w-full object-cover rounded-full"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className="h-full w-full rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-sm font-medium"
                                style={{ display: (selectedChat.avatar && selectedChat.avatar !== null) ? 'none' : 'flex' }}
                              >
                                {selectedChat.name?.charAt(0)?.toUpperCase() || "G"}
                              </div>
                            </div>
                          ) : (
                            renderAvatar({ 
                              icon: selectedChat.otherParticipant?.icon || selectedChat.avatar, 
                              bonsai: selectedChat.otherParticipant?.bonsai || selectedChat.bonsai, 
                              name: selectedChat.name 
                            })
                          )}
                        </div>
                        <div className="min-w-0 flex-1 max-w-[150px] sm:max-w-none">
                          <h3 className="font-semibold text-[#2c3e2d] truncate">{selectedChat.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {selectedChat.type === "group"
                              ? `${selectedChat.participants?.length || 0} members`
                              : selectedChat.isOnline
                                ? "Online"
                                : "Last seen recently"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(selectedChat.type === "group" || selectedChat.type === "public_group") && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowMembersModal(true)}
                              title="View Group Members"
                              className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb]"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            {/* Debug: Always show for group chats */}
                            {(selectedChat.type === "group" || selectedChat.type === "public_group") && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    title="Group Options"
                                    className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb]"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setShowEditGroupModal(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Group
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </>
                        )}
                        {selectedChat.type === "direct" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // Get the other participant's user ID for direct chats
                              if (Array.isArray(selectedChat.participants)) {
                                const otherParticipant = selectedChat.participants.find(
                                  (p) => p.id?.toString() !== session?.user?.id?.toString()
                                )
                                
                                if (otherParticipant?.id) {
                                  const profileUrl = `/users/${otherParticipant.id}`
                                  router.push(profileUrl)
                                }
                              }
                            }}
                            title="View Profile"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden p-1 sm:p-2 pb-8 space-y-3 sm:space-y-4 bg-gray-50 scroll-smooth"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {(messagesLoading || isInitialChatLoad || isInitialLoad) ? (
                      <ChatMessagesSkeleton count={8} />
                    ) : !messagesLoading && !isInitialChatLoad && !isInitialLoad && messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="mb-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#eef2eb] flex items-center justify-center mb-4">
                            {selectedChat.type === "group" || selectedChat.type === "public_group" ? (
                              <div className="h-full w-full relative">
                                {(selectedChat.avatar && selectedChat.avatar !== null) ? (
                                  <img 
                                    src={selectedChat.avatar} 
                                    alt={selectedChat.name} 
                                    className="h-full w-full object-cover rounded-full"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="h-full w-full rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-lg font-medium"
                                  style={{ display: (selectedChat.avatar && selectedChat.avatar !== null) ? 'none' : 'flex' }}
                                >
                                  {selectedChat.name?.charAt(0)?.toUpperCase() || "G"}
                                </div>
                              </div>
                            ) : (
                              renderAvatar({ 
                                icon: selectedChat.otherParticipant?.icon || selectedChat.avatar, 
                                bonsai: selectedChat.otherParticipant?.bonsai || selectedChat.bonsai, 
                                name: selectedChat.name 
                              })
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">
                          Start a conversation with {selectedChat.name}
                        </h3>
                        <p className="text-[#5c6d5e] mb-4">
                          Send a message to begin your chat
                        </p>
                        <div className="text-sm text-[#5c6d5e]">
                          Type your message below to get started
                        </div>
                      </div>
                    ) : (
                      <>
                        {hasMore && (
                          <div className="text-center py-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={loadMoreMessages}
                              disabled={isLoadingMore}
                              className="transition-all duration-200 hover:bg-gray-100"
                            >
                              {isLoadingMore ? (
                                <LoadingMoreMessagesSkeleton />
                              ) : (
                                "Load more messages"
                              )}
                            </Button>
                          </div>
                        )}
                        {messages.map((msg, index) => {
                          const previousMessage = index > 0 ? messages[index - 1] : null
                          
                          return (
                            <MessageItem
                              key={msg.id}
                              message={msg}
                              previousMessage={previousMessage}
                              session={session}
                              formatTimestamp={formatTimestamp}
                              formatFullTimestamp={formatFullTimestamp}
                              shouldShowTimestamp={shouldShowTimestamp}
                              handleReaction={handleReaction}
                              handleDeleteMessage={deleteMessage}
                            />
                          )
                        })}
                        <div ref={messagesEndRef} className="h-1" />
                        
                        {/* Loading indicator for new messages */}
                        {messagesLoading && messages.length > 0 && (
                          <LoadingMoreMessagesSkeleton />
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-2 sm:p-4 border-t bg-white relative">
                    {!isUserParticipant && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm font-medium">You are no longer a member of this chat</p>
                        <p className="text-red-500 text-xs mt-1">You cannot send messages or see new messages in this group.</p>
                      </div>
                    )}
                    <div className="flex items-center min-w-0">
                      <div className="flex items-center gap-1 sm:gap-6 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generalFileInputRef.current?.click()}
                          className="text-gray-500 hover:text-[#4a7c59] min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[32px] flex-shrink-0 p-0"
                          disabled={uploading || !isUserParticipant}
                          title="Attach file"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-gray-500 hover:text-[#4a7c59] min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[32px] flex-shrink-0 p-0"
                          disabled={uploading || !isUserParticipant}
                          title="Attach image"
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                        </Button>
                        <Button
                          ref={emojiButtonRef}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`text-gray-500 hover:text-[#4a7c59] min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[32px] flex-shrink-0 p-0 ${showEmojiPicker ? 'bg-[#eef2eb] text-[#4a7c59]' : ''}`}
                          disabled={!isUserParticipant}
                          title="Add emoji"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="ml-1 sm:ml-3 flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
                        <textarea
                          ref={messageInputRef}
                          onKeyDown={handleKeyPress}
                          onChange={handleMessageChange}
                          placeholder={isUserParticipant ? "Type a message..." : "You are no longer a member of this chat"}
                          className="flex-1 px-3 py-1.5 sm:py-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#2646248a] disabled:bg-gray-100 disabled:cursor-not-allowed resize-none overflow-hidden break-words overflow-wrap-anywhere whitespace-pre-wrap text-base sm:text-sm min-w-0"
                          style={{ height: `${messageHeight}px`, wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                          disabled={uploading || !isUserParticipant}
                          autoComplete="off"
                          autoFocus={false}
                          rows={1}
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          className="bg-[#4a7c59] hover:bg-[#3a6147] h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 p-0 ml-1"
                          disabled={uploading || !isUserParticipant}
                        >
                          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                    />
                    <input
                      ref={generalFileInputRef}
                      type="file"
                      onChange={handleGeneralFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.mp3,.wav,.mp4,.ogg,.m4a,.xls,.xlsx,.csv,.zip,.rar,.7z"
                    />
                    
                    {/* Emoji Picker */}
                    <EmojiPicker
                      isOpen={showEmojiPicker}
                      onClose={() => setShowEmojiPicker(false)}
                      onEmojiSelect={handleEmojiSelect}
                      emojiButtonRef={emojiButtonRef}
                    />
                  </div>
                  
                  {/* File Error Modal */}
                  {fileErrorPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {fileErrorPopup.title}
                          </h3>
                          <button
                            onClick={() => setFileErrorPopup(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                          {fileErrorPopup.description}
                        </p>
                        <div className="flex justify-center">
                          <button
                            onClick={() => setFileErrorPopup(null)}
                            className="bg-[#4a7c59] hover:bg-[#3a6147] text-white px-6 py-2 rounded-md transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (chatsLoading || isInitialLoad) ? (
                <div className="flex-1 flex flex-col">
                  <ChatHeaderSkeleton />
                  <ChatMessagesSkeleton count={8} />
                  <MessageInputSkeleton />
                </div>
              ) : !selectedChat ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Select a chat to start messaging</p>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateGroupModal && (
        <Suspense fallback={null}>
          <CreateGroupChatModal
            isOpen={showCreateGroupModal}
            onClose={() => setShowCreateGroupModal(false)}
            activeTab={activeTab}
            onGroupCreated={async (group) => {
              // Small delay to ensure database operations are complete
              setTimeout(() => {
                refetchChats() // Refresh the chat list
                refetchPublicGroups() // Also refresh public groups list
              }, 100)
              setSelectedChatId(group.id)
              setShowCreateGroupModal(false)
            }}
          />
        </Suspense>
      )}
      
      <Suspense fallback={null}>
        <GroupMembersModal
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          chat={selectedChat}
          onMemberLeft={() => {
            // Clear selected chat first
            setSelectedChatId(null)
            
            // Force refresh both lists with a small delay
            setTimeout(() => {
              refetchChats()
              refetchPublicGroups()
            }, 100)
          }}
          onInviteFriends={() => {
            setShowMembersModal(false)
            setShowInviteModal(true)
          }}
        />
      </Suspense>
      
      <Suspense fallback={null}>
        <GroupInviteModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false)
            // Refresh chat data after inviting to show new members
            refetchChats()
          }}
          chat={selectedChat}
        />
      </Suspense>

      <Suspense fallback={null}>
        <LeaveGroupModal
          isOpen={showLeaveGroupModal}
          onClose={handleCancelLeaveGroup}
          onConfirm={handleConfirmLeaveGroup}
          groupName={leavingGroupName}
          isLoading={false} // You can add loading state if needed
        />
      </Suspense>

      <Suspense fallback={null}>
        <EditGroupModal
          isOpen={showEditGroupModal}
          onClose={() => setShowEditGroupModal(false)}
          chat={selectedChat}
          onGroupUpdated={(updatedChat) => {
            // Refresh both chat lists
            refetchChats()
            refetchPublicGroups()
            
            // If we have updated chat data, we could update the selectedChat directly
            // But since selectedChat is derived from chats array, refetchChats should handle it
            console.log('Group updated:', updatedChat)
          }}
        />
      </Suspense>
        </div>
    </div>
  )
}
