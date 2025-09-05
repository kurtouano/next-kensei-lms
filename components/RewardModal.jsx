"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Gift, Coins, ExternalLink, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CertificateModal } from '@/components/certificate-modal'

export function RewardModal({ isOpen, onClose, rewardData, courseId }) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  if (!isOpen || !rewardData) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }

  const handleViewBonsai = () => {
    handleClose()
    router.push('/bonsai')
  }

  const handleViewCertificate = () => {
    setShowCertificateModal(true)
  }

  const hasItems = rewardData.itemsEarned && rewardData.itemsEarned.length > 0
  const hasCredits = rewardData.creditsEarned > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl max-w-sm sm:max-w-md w-full mx-4 transition-all duration-200 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#dce4d7]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#2c3e2d]">Course Completed!</h2>
              <p className="text-xs sm:text-sm text-[#5c6d5e]">{rewardData.courseTitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[#eef2eb] rounded-full transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-[#5c6d5e]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-[#2c3e2d] mb-2">
              🎉 Congratulations! You've earned:
            </h3>
          </div>

          {/* Credits Section */}
          {hasCredits && (
            <div className="mb-4 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-[#2c3e2d] text-sm sm:text-base">
                    {rewardData.creditsEarned} Credits
                  </p>
                  <p className="text-xs sm:text-sm text-[#5c6d5e]">
                    Added to your account balance
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items Section */}
          {hasItems && (
            <div className="mb-4 sm:mb-6">
              <div className="space-y-2 sm:space-y-3">
                {rewardData.itemsEarned.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#f8f9f7] rounded-lg border border-[#dce4d7]">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#eef2eb] rounded-lg flex items-center justify-center">
                        <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-[#5c6d5e]" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-[#2c3e2d] text-sm sm:text-base">{item.name}</p>
                      <p className="text-xs sm:text-sm text-[#5c6d5e]">Added to your collection</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <Button 
              onClick={handleViewCertificate}
              variant="outline"
              className="w-full border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] text-sm sm:text-base"
            >
              <FileText className="mr-2 h-4 w-4" />
              View Certificate
            </Button>
            
            <Button 
              onClick={handleViewBonsai}
              className="w-full bg-[#4a7c59] hover:bg-[#3a6147] text-white text-sm sm:text-base"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Try new items in bonsai
            </Button>
            
            <Button 
              onClick={handleClose}
              variant="outline"
              className="w-full border-[#dce4d7] text-[#2c3e2d] hover:bg-[#eef2eb] text-sm sm:text-base"
            >
              Continue Learning
            </Button>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        courseId={courseId}
      />
    </div>
  )
}
