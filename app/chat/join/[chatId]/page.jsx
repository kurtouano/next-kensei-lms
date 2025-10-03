"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function JoinGroupChatPage({ params }) {
  const { chatId } = await params

  return <JoinGroupChatClient chatId={chatId} />
}

function JoinGroupChatClient({ chatId }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [chat, setChat] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const inviteCode = searchParams.get('invite')

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.href)
      router.push(`/auth/login?callbackUrl=${returnUrl}`)
      return
    }

    fetchChatDetails()
  }, [session, status, chatId])

  const fetchChatDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chats/${chatId}`)
      const data = await response.json()

      if (data.success) {
        setChat(data.chat)
      } else {
        setError(data.error || "Chat not found")
      }
    } catch (error) {
      console.error("Error fetching chat:", error)
      setError("Failed to load chat details")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    try {
      setJoining(true)
      const response = await fetch(`/api/chats/${chatId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        
        // Trigger chat refresh to show the join system message
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('chatRefresh'))
        }, 100)
        
        // Redirect to chat after a short delay
        setTimeout(() => {
          router.push('/chat')
        }, 2000)
      } else {
        setError(data.error || "Failed to join group")
      }
    } catch (error) {
      console.error("Error joining group:", error)
      setError("Failed to join group")
    } finally {
      setJoining(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#4a7c59]" />
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2c3e2d] mb-2">Unable to Join Group</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => router.push('/chat')}
            className="bg-[#4a7c59] hover:bg-[#3a6147]"
          >
            Go to Chat
          </Button>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2c3e2d] mb-2">Successfully Joined!</h2>
          <p className="text-gray-600 mb-6">You've been added to "{chat?.name}"</p>
          <p className="text-sm text-gray-500">Redirecting to chat...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#4a7c59] flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-[#2c3e2d] mb-2">Join Group Chat</h2>
          <p className="text-gray-600">You've been invited to join a group chat</p>
        </div>

        {chat && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#2c3e2d] mb-2">{chat.name}</h3>
            {chat.description && (
              <p className="text-sm text-gray-600 mb-2">{chat.description}</p>
            )}
            <p className="text-sm text-gray-500">
              {chat.participants?.length || 0} members
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleJoinGroup}
            disabled={joining}
            className="w-full bg-[#4a7c59] hover:bg-[#3a6147]"
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Joining...
              </>
            ) : (
              "Join Group"
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/chat')}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
