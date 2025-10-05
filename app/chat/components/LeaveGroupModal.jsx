"use client"

import { useState, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, AlertTriangle, Loader2 } from "lucide-react"

// Lazy load the modal content
const LeaveGroupModalContent = lazy(() => import("./LeaveGroupModalContent"))

export default function LeaveGroupModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  groupName, 
  isLoading = false 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <Suspense fallback={
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#4a7c59]" />
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        }>
          <LeaveGroupModalContent
            onClose={onClose}
            onConfirm={onConfirm}
            groupName={groupName}
            isLoading={isLoading}
          />
        </Suspense>
      </Card>
    </div>
  )
}
