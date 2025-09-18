"use client";

import { Trash, Trash2 } from "lucide-react";

export default function ConfirmationModal({ 
  showModal, 
  confirmAction, 
  cleanupLoading, 
  onConfirm, 
  onCancel 
}) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-[#2c3e2d] bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#f8f7f4] rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-[#4a7c59] border-opacity-20">
        <div className="p-8">
          {/* Icon */}
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 border-2 border-gray-200">
            {confirmAction === 'cleanupOld' ? (
              <Trash className="w-10 h-10 text-gray-600" />
            ) : (
              <Trash2 className="w-10 h-10 text-gray-600" />
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-[#2c3e2d] text-center mb-4">
            {confirmAction === 'cleanupOld' ? 'Clean Old Notifications' : 'Delete All Notifications'}
          </h3>
          
          {/* Message */}
          <div className="mb-6">
            <p className="text-[#5c6d5e] text-center leading-relaxed">
              {confirmAction === 'cleanupOld' ? (
                <>
                  Are you sure you want to clean up old notifications? This will remove all notifications that are <span className="font-semibold text-[#4a7c59]">7 days or older</span>. This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete all notifications? This action cannot be undone and will permanently remove all your notification history.
                </>
              )}
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 text-[#5c6d5e] border-2 border-[#4a7c59] border-opacity-30 rounded-xl hover:bg-[#4a7c59] hover:bg-opacity-10 hover:border-opacity-50 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={cleanupLoading}
              className={`flex-1 px-6 py-3 text-white rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                confirmAction === 'cleanupOld' 
                  ? 'bg-[#ffc107] hover:bg-[#e0a800] text-[#2c3e2d]' 
                  : 'bg-[#dc3545] hover:bg-[#c82333]'
              }`}
            >
              {cleanupLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {confirmAction === 'cleanupOld' ? 'Cleaning...' : 'Deleting...'}
                </>
              ) : (
                confirmAction === 'cleanupOld' ? 'Clean Old' : 'Delete All'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
