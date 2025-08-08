// components/profile/Certifications.jsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"

export function Certifications({ 
  certificates, 
  certificatesLoading, 
  onViewCertificate 
}) {
  return (
    <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
      <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">My Certifications</h2>

      {certificatesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a7c59] mx-auto mb-3"></div>
          <p className="text-[#5c6d5e]">Loading certificates...</p>
        </div>
      ) : certificates && certificates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="rounded-lg border border-[#dce4d7] bg-[#eef2eb] p-4">
              <div className="flex items-center">
                <span className="text-xs text-[#5c6d5e]">
                  {new Date(cert.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="mb-2 flex items-center min-h-[4rem]">
                <Award className="mr-3 h-8 w-8 text-[#4a7c59] flex-shrink-0" />
                <h3 className="text-lg font-semibold text-[#2c3e2d] line-clamp-2 leading-tight self-center">
                  {cert.courseTitle}
                </h3>
              </div>
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-2 border-[#4a7c59] text-[#4a7c59]"
                  onClick={() => onViewCertificate(cert)}
                >
                  View Certificate
                </Button>
              </div>
              <div className="mt-2 text-xs text-[#5c6d5e]">
                ID: {cert.certificateId}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#dce4d7] bg-[#f8f7f4] p-8 text-center">
          <Award className="mx-auto mb-4 h-12 w-12 text-[#5c6d5e] opacity-50" />
          <h3 className="mb-2 text-lg font-medium text-[#2c3e2d]">No Certificates Yet</h3>
          <p className="mb-4 text-[#5c6d5e]">
            Complete courses and pass all quizzes to earn your first certificate.
          </p>
          <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      )}
    </div>
  )
}