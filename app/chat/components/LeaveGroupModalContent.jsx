"use client"

import { Button } from "@/components/ui/button"
import { X, AlertTriangle, Loader2 } from "lucide-react"

export default function LeaveGroupModalContent({ 
  onClose, 
  onConfirm, 
  groupName, 
  isLoading = false 
}) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#2c3e2d]">Leave Group</h3>
            <p className="text-sm text-gray-600">Confirm your action</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="mb-6">
        <p className="text-gray-700 mb-3">
          Are you sure you want to leave <strong>"{groupName}"</strong>?
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">What happens when you leave:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>You'll no longer receive messages from this group</li>
                <li>You can rejoin later if the group is still public</li>
                <li>Your message history will be preserved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Leaving...
            </>
          ) : (
            "Leave Group"
          )}
        </Button>
      </div>
    </div>
  )
}
