"use client"

import { useState } from "react"
import ChatSidebar from "./ChatSidebar"

export default function ChatSidebarExample() {
  const [selectedChatId, setSelectedChatId] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [joinedGroupIds, setJoinedGroupIds] = useState([1, 3, 5])

  // Sample data from your original code
  const [publicGroups] = useState([
    {
      id: 1,
      name: "Japanese Study Group",
      description: "General Japanese language learning and practice",
      avatar: "/placeholder.svg?height=60&width=60&text=JSG",
      members: 156,
      category: "General",
      isPopular: true,
    },
    {
      id: 3,
      name: "JLPT N3 Prep",
      description: "Prepare for JLPT N3 exam together",
      avatar: "/placeholder.svg?height=60&width=60&text=N3",
      members: 89,
      category: "Exam Prep",
      isPopular: true,
    },
    {
      id: 5,
      name: "Conversation Practice",
      description: "Daily conversation practice in Japanese",
      avatar: "/placeholder.svg?height=60&width=60&text=CP",
      members: 203,
      category: "Practice",
      isPopular: true,
    },
    {
      id: 6,
      name: "Anime & Manga Fans",
      description: "Discuss anime and manga in Japanese",
      avatar: "/placeholder.svg?height=60&width=60&text=AM",
      members: 421,
      category: "Culture",
      isPopular: true,
    },
    {
      id: 7,
      name: "Kanji Masters",
      description: "Focus on kanji learning and memorization",
      avatar: "/placeholder.svg?height=60&width=60&text=KM",
      members: 134,
      category: "Kanji",
      isPopular: false,
    },
    {
      id: 8,
      name: "Business Japanese",
      description: "Professional Japanese for work environments",
      avatar: "/placeholder.svg?height=60&width=60&text=BJ",
      members: 67,
      category: "Business",
      isPopular: false,
    },
    {
      id: 9,
      name: "Beginner's Corner",
      description: "Safe space for complete beginners",
      avatar: "/placeholder.svg?height=60&width=60&text=BC",
      members: 289,
      category: "Beginner",
      isPopular: true,
    },
    {
      id: 10,
      name: "Grammar Gurus",
      description: "Deep dive into Japanese grammar",
      avatar: "/placeholder.svg?height=60&width=60&text=GG",
      members: 98,
      category: "Grammar",
      isPopular: false,
    },
  ])

  const [chats] = useState([
    {
      id: 1,
      name: "Japanese Study Group",
      type: "group",
      avatar: "/placeholder.svg?height=40&width=40&text=JSG",
      lastMessage: "Yuki: こんにちは！日本語の勉強はどうですか？",
      time: "2:35 PM",
      unread: 3,
      online: true,
      members: 156,
    },
    {
      id: 2,
      name: "Yuki Tanaka",
      type: "direct",
      avatar: "/placeholder.svg?height=40&width=40&text=YT",
      lastMessage: "Thanks for the kanji tips!",
      time: "1:20 PM",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "JLPT N3 Prep",
      type: "group",
      avatar: "/placeholder.svg?height=40&width=40&text=N3",
      lastMessage: "Sarah: Anyone want to practice grammar?",
      time: "12:45 PM",
      unread: 1,
      online: false,
      members: 89,
    },
    {
      id: 4,
      name: "Mike Johnson",
      type: "direct",
      avatar: "/placeholder.svg?height=40&width=40&text=MJ",
      lastMessage: "See you in tomorrow's lesson!",
      time: "11:30 AM",
      unread: 0,
      online: false,
    },
    {
      id: 5,
      name: "Conversation Practice",
      type: "group",
      avatar: "/placeholder.svg?height=40&width=40&text=CP",
      lastMessage: "Anna: Let's practice keigo today",
      time: "Yesterday",
      unread: 0,
      online: true,
      members: 203,
    },
  ])

  const handleJoinGroup = (groupId) => {
    if (joinedGroupIds.includes(groupId)) {
      // Leave group
      setJoinedGroupIds(joinedGroupIds.filter((id) => id !== groupId))
    } else {
      // Join group
      setJoinedGroupIds([...joinedGroupIds, groupId])
      const group = publicGroups.find((g) => g.id === groupId)
      if (group) {
        // You can add logic here to add the group to chats
        console.log("Joined group:", group.name)
      }
    }
  }

  return (
    <div className="h-[600px] w-80">
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onJoinGroup={handleJoinGroup}
        joinedGroupIds={joinedGroupIds}
        publicGroups={publicGroups}
        chatsLoading={false}
        chatsError={null}
      />
    </div>
  )
}
