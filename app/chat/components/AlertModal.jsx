"use client"

import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "info", // "success", "error", "warning", "info"
  confirmText = "OK",
  showCancel = false,
  cancelText = "Cancel",
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-[#4a7c59]" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-[#4a7c59]" />
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-[#4a7c59] hover:bg-[#3a6147]"
      case "error":
        return "bg-red-500 hover:bg-red-600"
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-[#4a7c59] hover:bg-[#3a6147]"
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-4">
      <Card className="w-full max-w-md">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-lg sm:text-xl font-semibold text-[#2c3e2d]">{title}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Message */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-gray-600">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 justify-end">
            {showCancel && (
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="text-xs sm:text-sm px-3 py-2"
              >
                {cancelText}
              </Button>
            )}
            <Button 
              onClick={handleConfirm}
              className={`${getButtonColor()} text-white text-xs sm:text-sm px-3 py-2`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
