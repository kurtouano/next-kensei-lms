"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Users, UserMinus, LogOut, UserPlus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"

export default function GroupMembersModal({ isOpen, onClose, chat, onMemberLeft, onInviteFriends }) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersWithBonsai, setMembersWithBonsai] = useState([])
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showAdminTransfer, setShowAdminTransfer] = useState(false)
  const [selectedNewAdmin, setSelectedNewAdmin] = useState(null)

  // Fetch full user data with bonsai when modal opens
  useEffect(() => {
    if (isOpen && chat && chat.participants) {
      setMembersLoading(true)
      
      const fetchMembersWithBonsai = async () => {
        try {
          const memberPromises = chat.participants.map(async (member) => {
            // If member already has full data, return as is
            if (member.bonsai || member.icon !== 'bonsai') {
              return member
            }
            
            // For current user, use profile endpoint
            if ((member.id || member._id)?.toString() === session?.user?.id?.toString()) {
              try {
                const response = await fetch('/api/profile')
                const userData = await response.json()
                return userData.success ? userData.user : member
              } catch (error) {
                console.error('Error fetching current user data:', error)
                return member
              }
            }
            
            // For other users, use users endpoint
            try {
              const response = await fetch(`/api/users/${member.id || member._id}`)
              const userData = await response.json()
              return userData.success ? userData.user : member
            } catch (error) {
              console.error('Error fetching user data:', error)
              return member
            }
          })
          
          const members = await Promise.all(memberPromises)
          console.log('Fetched members with bonsai data:', members)
          setMembersWithBonsai(members)
        } catch (error) {
          console.error('Error fetching members data:', error)
          setMembersWithBonsai(chat.participants)
        } finally {
          setMembersLoading(false)
        }
      }
      
      fetchMembersWithBonsai()
    }
  }, [isOpen, chat, session?.user?.id])

  const handleLeaveGroup = async () => {
    if (!chat || !session?.user?.id) return

    try {
      setLeaving(true)
      console.log('Leaving group:', chat.id, 'User:', session.user.id)
      
      const response = await fetch(`/api/chats/${chat.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id
        })
      })

      console.log('Leave response status:', response.status)
      const data = await response.json()
      console.log('Leave response data:', data)

      if (data.success) {
        onMemberLeft?.()
        onClose()
        setShowLeaveConfirm(false)
      } else {
        // Show error in a custom modal instead of alert
        setShowLeaveConfirm(false)
        setErrorMessage(data.error || 'Failed to leave group')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error leaving group:', error)
      setShowLeaveConfirm(false)
      setErrorMessage('Failed to leave group')
      setShowErrorModal(true)
    } finally {
      setLeaving(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!chat || !session?.user?.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/chats/${chat.id}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: memberId
        })
      })

      const data = await response.json()

      if (data.success) {
        onMemberLeft?.() // Refresh the chat data
        setShowRemoveConfirm(false)
        setMemberToRemove(null)
      } else {
        setShowRemoveConfirm(false)
        setMemberToRemove(null)
        setErrorMessage(data.error || 'Failed to remove member')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error removing member:', error)
      setShowRemoveConfirm(false)
      setMemberToRemove(null)
      setErrorMessage('Failed to remove member')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const openLeaveConfirm = () => {
    // If user is admin and there are other members, show admin transfer modal
    if (isCreator && membersWithBonsai.length > 1) {
      setShowAdminTransfer(true)
    } else {
      setShowLeaveConfirm(true)
    }
  }

  const openRemoveConfirm = (member) => {
    setMemberToRemove(member)
    setShowRemoveConfirm(true)
  }

  const handleAdminTransfer = async () => {
    if (!selectedNewAdmin || !chat) return

    try {
      setLoading(true)
      const response = await fetch(`/api/chats/${chat.id}/transfer-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newAdminId: selectedNewAdmin._id || selectedNewAdmin.id
        })
      })

      const data = await response.json()

      if (data.success) {
        // Now proceed with leaving the group
        setShowAdminTransfer(false)
        setSelectedNewAdmin(null)
        setShowLeaveConfirm(true)
      } else {
        setErrorMessage(data.error || 'Failed to transfer admin role')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error transferring admin:', error)
      setErrorMessage('Failed to transfer admin role')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const renderAvatar = (user) => {
    console.log('Rendering avatar for user:', user)
    console.log('User icon:', user.icon)
    console.log('User bonsai:', user.bonsai)
    
    // If user has icon: 'bonsai', show a default bonsai
    if (user.icon === "bonsai") {
      return (
        <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-full border border-[#4a7c59]">
          <BonsaiSVG 
            level={user.bonsai?.level || 1}
            treeColor={user.bonsai?.customization?.foliageColor || '#77DD82'} 
            potColor={user.bonsai?.customization?.potColor || '#FD9475'} 
            selectedEyes={user.bonsai?.customization?.eyes || 'default_eyes'}
            selectedMouth={user.bonsai?.customization?.mouth || 'default_mouth'}
            selectedPotStyle={user.bonsai?.customization?.potStyle || 'default_pot'}
            selectedGroundStyle={user.bonsai?.customization?.groundStyle || 'default_ground'}
            decorations={user.bonsai?.customization?.decorations ? Object.values(user.bonsai.customization.decorations).filter(Boolean) : []}
            zoomed={true}
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

  const isCurrentUser = (member) => {
    return (member._id || member.id)?.toString() === session?.user?.id?.toString()
  }

  // Debug logging
  console.log('Chat data:', chat)
  console.log('Session user ID:', session?.user?.id)
  console.log('Chat createdBy:', chat?.createdBy)
  console.log('Chat createdBy type:', typeof chat?.createdBy)
  console.log('Session user ID type:', typeof session?.user?.id)
  
  // Check if user is creator - try multiple ways
  const isCreatorByCreatedBy = chat?.createdBy?.toString() === session?.user?.id?.toString()
  const isCreatorByFirstParticipant = chat?.participants?.[0]?.id?.toString() === session?.user?.id?.toString() || 
                                     chat?.participants?.[0]?._id?.toString() === session?.user?.id?.toString()
  
  const isCreator = isCreatorByCreatedBy || isCreatorByFirstParticipant
  const canRemoveMembers = isCreator

  if (!isOpen || !chat) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4a7c59] flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2c3e2d]">Group Members</h2>
                <p className="text-sm text-gray-600">{chat.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Members List */}
          <div className="max-h-96 overflow-y-auto mb-6">
            {membersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a7c59] mx-auto mb-3"></div>
                <p className="text-gray-500">Loading members...</p>
              </div>
            ) : membersWithBonsai && membersWithBonsai.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
                {membersWithBonsai.map((member) => (
                  <div
                    key={member._id || member.id || Math.random()}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8">
                      {renderAvatar(member)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#2c3e2d]">
                        {member.name}
                        {isCurrentUser(member) && (
                          <span className="text-sm text-gray-500 ml-2">(You)</span>
                        )}
                      {(() => {
                        const memberId = (member._id || member.id)?.toString()
                        const createdById = chat?.createdBy?.toString()
                        const firstParticipantId = (chat?.participants?.[0]?.id || chat?.participants?.[0]?._id)?.toString()
                        
                        // Use same logic as isCreator - check both createdBy and first participant
                        const isMemberCreator = memberId === createdById || memberId === firstParticipantId
                        
                        console.log(`Member ${member.name}:`, {
                          memberId,
                          createdById,
                          firstParticipantId,
                          isMemberCreator,
                          isCreatorByCreatedBy: memberId === createdById,
                          isCreatorByFirstParticipant: memberId === firstParticipantId
                        })
                        return isMemberCreator && (
                          <span className="text-sm text-[#4a7c59] font-semibold ml-2">• Admin</span>
                        )
                      })()}
                      </p>
                    </div>
                    {canRemoveMembers && !isCurrentUser(member) && (() => {
                      const memberId = (member._id || member.id)?.toString()
                      const createdById = chat?.createdBy?.toString()
                      const firstParticipantId = (chat?.participants?.[0]?.id || chat?.participants?.[0]?._id)?.toString()
                      const isMemberCreator = memberId === createdById || memberId === firstParticipantId
                      return !isMemberCreator
                    })() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openRemoveConfirm(member)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No members found</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-between">
            <Button 
              onClick={onInviteFriends}
              className="bg-[#4a7c59] hover:bg-[#3a6147] flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite Friends
            </Button>
            <div className="flex gap-2">
              <Button 
                onClick={openLeaveConfirm}
                disabled={leaving}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {leaving ? "Leaving..." : "Leave Group"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Leave Group</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to leave "{chat?.name}"? You won't be able to rejoin unless someone invites you again.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLeaveConfirm(false)}
                disabled={leaving}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLeaveGroup}
                disabled={leaving}
                className="flex items-center gap-2"
              >
                {leaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Leave Group
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UserMinus className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Member</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove <strong>{memberToRemove.name}</strong> from the group? They will no longer receive messages from this group.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRemoveConfirm(false)
                  setMemberToRemove(null)
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRemoveMember(memberToRemove._id || memberToRemove.id)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4" />
                    Remove Member
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Error</h3>
                <p className="text-sm text-gray-500">Something went wrong</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              {errorMessage}
            </p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowErrorModal(false)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Transfer Modal */}
      {showAdminTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Transfer Admin Role</h3>
                <p className="text-sm text-gray-500">You must transfer admin rights before leaving</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              As the group admin, you need to transfer your admin rights to another member before leaving the group.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select new admin:
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {membersWithBonsai
                  .filter(member => (member._id || member.id)?.toString() !== session?.user?.id?.toString())
                  .map((member) => (
                    <div
                      key={member._id || member.id}
                      onClick={() => {
                        console.log('Selecting member:', member)
                        console.log('Current selected:', selectedNewAdmin)
                        setSelectedNewAdmin(member)
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        (() => {
                          const selectedId = selectedNewAdmin?._id || selectedNewAdmin?.id
                          const memberId = member._id || member.id
                          const isSelected = selectedId === memberId
                          console.log(`Member ${member.name}: selectedId=${selectedId}, memberId=${memberId}, isSelected=${isSelected}`)
                          return isSelected
                        })()
                          ? 'bg-[#4a7c59] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8">
                        {renderAvatar(member)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                      </div>
                      {(() => {
                        const selectedId = selectedNewAdmin?._id || selectedNewAdmin?.id
                        const memberId = member._id || member.id
                        const isSelected = selectedId === memberId
                        return isSelected ? (
                          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#4a7c59] rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                        )
                      })()}
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdminTransfer(false)
                  setSelectedNewAdmin(null)
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminTransfer}
                disabled={!selectedNewAdmin || loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Transferring...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Transfer & Leave
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
