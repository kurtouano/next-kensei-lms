// components/certificate-modal.jsx - FIXED PDF DOWNLOAD
"use client"
import { X, Download, Loader2, ExternalLink, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { BonsaiIcon } from "@/components/bonsai-icon"

// Display Certificate component for modal viewing
function DisplayCertificate({
  userName = "SakuraBonsai",
  courseTitle = "Japanese Basics",
  completionDate = new Date(),
  certificateId = "BONSAI-CERT-12345",
}) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div
      className="relative w-full bg-white shadow-2xl"
      style={{ 
        width: "800px", 
        height: "600px", 
        maxWidth: "100%",
        margin: "0 auto"
      }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fa] via-white to-[#f1f7f1]"></div>
      
      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-20 h-20">
        <div className="absolute top-4 left-4 w-12 h-12 border-2 border-[#4a7c59] opacity-20 rotate-45"></div>
        <div className="absolute top-6 left-6 w-8 h-8 border border-[#6b8e6b] opacity-30 rotate-45"></div>
      </div>
      
      <div className="absolute top-0 right-0 w-20 h-20">
        <div className="absolute top-4 right-4 w-12 h-12 border-2 border-[#4a7c59] opacity-20 rotate-45"></div>
        <div className="absolute top-6 right-6 w-8 h-8 border border-[#6b8e6b] opacity-30 rotate-45"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-20 h-20">
        <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-[#4a7c59] opacity-20 rotate-45"></div>
        <div className="absolute bottom-6 left-6 w-8 h-8 border border-[#6b8e6b] opacity-30 rotate-45"></div>
      </div>
      
      <div className="absolute bottom-0 right-0 w-20 h-20">
        <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-[#4a7c59] opacity-20 rotate-45"></div>
        <div className="absolute bottom-6 right-6 w-8 h-8 border border-[#6b8e6b] opacity-30 rotate-45"></div>
      </div>

      {/* Main Border Design */}
      <div className="absolute inset-0 border-4 border-[#4a7c59]"></div>
      <div className="absolute inset-2 border-2 border-[#6b8e6b] opacity-50"></div>
      <div className="absolute inset-4 border border-[#8ba68b] opacity-30"></div>

      {/* Certificate Content */}
      <div className="relative flex h-full flex-col items-center justify-between p-8 text-center">
        {/* Header */}
        <div className="w-full">
          {/* Academy Logo and Name */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#4a7c59] to-[#6b8e6b] rounded-full">
              <BonsaiIcon className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-wide text-[#2c3e2d] mb-1">BONSAI ACADEMY</h1>
              <div className="text-xs font-medium text-[#6b8e6b] tracking-widest">
                JAPANESE LANGUAGE INSTITUTE
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#4a7c59] to-[#6b8e6b] rounded-full">
              <span className="text-white text-lg font-bold">日</span>
            </div>
          </div>
          
          {/* Certificate Title */}
          <div className="border-t border-b border-[#4a7c59] py-3 my-4">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-[#4a7c59]">
              Certificate of Completion
            </h2>
            <div className="text-xs text-[#6b8e6b] mt-1 tracking-wide">
              Japanese Language Proficiency Program
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[600px] py-6">
          <div className="bg-gradient-to-r from-transparent via-[#f8f9fa] to-transparent p-6 rounded-lg">
            <p className="mb-4 text-lg text-[#5c6d5e] font-light">This is to certify that</p>
            
            <div className="border-b-2 border-[#4a7c59] pb-2 mb-4">
              <h3 className="font-serif text-3xl font-bold text-[#2c3e2d] tracking-wide">
                {userName}
              </h3>
            </div>
            
            <p className="mb-4 text-lg text-[#5c6d5e] font-light">
              has successfully completed the comprehensive course
            </p>
            
            <div className="bg-gradient-to-r from-[#4a7c59] to-[#6b8e6b] text-white p-4 rounded-lg mb-4">
              <h4 className="font-serif text-xl font-bold break-words">
                "{courseTitle}"
              </h4>
              <div className="text-sm opacity-90 mt-1">
                Japanese Language Mastery Program
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px bg-[#4a7c59] flex-1"></div>
              <p className="text-lg text-[#5c6d5e] font-medium px-4">
                Completed on {formatDate(completionDate)}
              </p>
              <div className="h-px bg-[#4a7c59] flex-1"></div>
            </div>
            
            <div className="text-sm text-[#6b8e6b]">
              Recognized by Bonsai Academy Japanese Language Institute
            </div>
          </div>
        </div>

        {/* Authority and Validation */}
        <div className="w-full">
          {/* Signatures */}
          <div className="flex justify-between items-end mb-6 px-12">
            <div className="flex flex-col items-center">
              <div className="w-40 border-b-2 border-[#2c3e2d] mb-2 h-8 flex items-end justify-center">
                <div className="text-xs text-[#6b8e6b] mb-1">Dr. Sakura Tanaka</div>
              </div>
              <p className="text-xs font-medium text-[#2c3e2d]">Academy Director</p>
              <p className="text-xs text-[#6b8e6b]">Chief Language Instructor</p>
            </div>

            {/* Academy Seal */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4a7c59] to-[#6b8e6b] rounded-full flex items-center justify-center mb-2">
                <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">認定</span>
                </div>
              </div>
              <p className="text-xs font-medium text-[#2c3e2d]">Official Seal</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-40 border-b-2 border-[#2c3e2d] mb-2 h-8 flex items-end justify-center">
                <div className="text-xs text-[#6b8e6b] mb-1">Prof. Hiroshi Nakamura</div>
              </div>
              <p className="text-xs font-medium text-[#2c3e2d]">Program Coordinator</p>
              <p className="text-xs text-[#6b8e6b]">Curriculum Specialist</p>
            </div>
          </div>

          {/* Footer with enhanced validation */}
          <div className="bg-gradient-to-r from-[#f8f9fa] via-white to-[#f8f9fa] border-t-2 border-[#4a7c59] pt-4">
            <div className="flex justify-between items-center text-xs text-[#5c6d5e] px-4">
              <div className="text-left">
                <div className="font-medium">Certificate ID: {certificateId}</div>
                <div className="text-[#6b8e6b]">Issued: {formatDate(new Date())}</div>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-[#4a7c59]">Bonsai Academy</div>
                <div>Japanese Language Institute</div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">Verify at:</div>
                <div className="text-[#4a7c59]">bonsaiacademy.com/verify</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[#4a7c59] opacity-5 text-8xl font-bold rotate-12 select-none">
          CERTIFIED
        </div>
      </div>
    </div>
  )
}
function PDFCertificate({
  userName = "SakuraBonsai",
  courseTitle = "Japanese Basics", 
  completionDate = new Date(),
  certificateId = "BONSAI-CERT-12345",
}) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  return (
    <div
      style={{ 
        width: "800px", 
        height: "600px", 
        backgroundColor: "#ffffff",
        position: "relative",
        fontFamily: "Arial, sans-serif",
        border: "4px solid #4a7c59",
        boxSizing: "border-box"
      }}
    >
      {/* Inner borders */}
      <div style={{
        position: "absolute",
        top: "8px",
        left: "8px", 
        right: "8px",
        bottom: "8px",
        border: "2px solid #6b8e6b",
        opacity: "0.5"
      }}></div>
      
      <div style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        right: "16px", 
        bottom: "16px",
        border: "1px solid #8ba68b",
        opacity: "0.3"
      }}></div>

      {/* Decorative corners */}
      <div style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        width: "48px",
        height: "48px", 
        border: "2px solid #4a7c59",
        opacity: "0.2",
        transform: "rotate(45deg)"
      }}></div>
      
      <div style={{
        position: "absolute", 
        top: "16px",
        right: "16px",
        width: "48px",
        height: "48px",
        border: "2px solid #4a7c59", 
        opacity: "0.2",
        transform: "rotate(45deg)"
      }}></div>
      
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "16px", 
        width: "48px",
        height: "48px",
        border: "2px solid #4a7c59",
        opacity: "0.2", 
        transform: "rotate(45deg)"
      }}></div>
      
      <div style={{
        position: "absolute",
        bottom: "16px", 
        right: "16px",
        width: "48px",
        height: "48px",
        border: "2px solid #4a7c59",
        opacity: "0.2",
        transform: "rotate(45deg)"
      }}></div>

      {/* Main content container */}
      <div style={{
        padding: "28px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "center",
        position: "relative",
        zIndex: "10"
      }}>
        
        {/* Header */}
        <div>
          {/* Academy logo and name */} 
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "12px"
          }}>
            <div style={{
              width: "48px",
              height: "48px", 
              backgroundColor: "#4a7c59",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold"
            }}>
              🌿
            </div>
            
            <div>
              <div style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#2c3e2d", 
                letterSpacing: "2px",
                marginBottom: "4px"
              }}>
                BONSAI ACADEMY
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6b8e6b",
                letterSpacing: "2px"
              }}>
                JAPANESE LANGUAGE INSTITUTE
              </div>
            </div>
            
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#4a7c59", 
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold"
            }}>
              日
            </div>
          </div>
          
          {/* Certificate title */}
          <div style={{
            borderTop: "2px solid #4a7c59",
            borderBottom: "2px solid #4a7c59", 
            padding: "12px 0",
            margin: "16px 0"
          }}>
            <div style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#4a7c59",
              letterSpacing: "3px"
            }}>
              CERTIFICATE OF COMPLETION
            </div>
            <div style={{
              fontSize: "12px",
              color: "#6b8e6b",
              marginTop: "4px", 
              letterSpacing: "1px"
            }}>
              Japanese Language Proficiency Program
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          margin: "12px 0"
        }}>
          <div style={{
            fontSize: "16px",
            color: "#5c6d5e",
            marginBottom: "12px"
          }}>
            This is to certify that
          </div>
          
          <div style={{
            borderBottom: "2px solid #4a7c59",
            paddingBottom: "6px",
            marginBottom: "12px"
          }}>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2c3e2d",
              fontFamily: "Georgia, serif",
              fontStyle: "italic"
            }}>
              {userName}
            </div>
          </div>
          
          <div style={{
            fontSize: "16px",
            color: "#5c6d5e",
            marginBottom: "12px"
          }}>
            has successfully completed the comprehensive course
          </div>
          
          <div style={{
            backgroundColor: "#4a7c59",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "12px"
          }}>
            <div style={{
              fontSize: "18px",
              fontWeight: "bold",
              fontFamily: "Georgia, serif"
            }}>
              "{courseTitle}"
            </div>
            <div style={{
              fontSize: "13px",
              opacity: "0.9",
              marginTop: "2px"
            }}>
              Japanese Language Mastery Program
            </div>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "6px"
          }}>
            <div style={{ height: "1px", backgroundColor: "#4a7c59", flex: "1" }}></div>
            <div style={{
              fontSize: "16px",
              color: "#5c6d5e",
              fontWeight: "500"
            }}>
              Completed on {formatDate(completionDate)}
            </div>
            <div style={{ height: "1px", backgroundColor: "#4a7c59", flex: "1" }}></div>
          </div>
          
          <div style={{
            fontSize: "13px",
            color: "#6b8e6b"
          }}>
            Recognized by Bonsai Academy Japanese Language Institute
          </div>
        </div>

        {/* Authority and Validation */}
        <div>
          {/* Signatures */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: "24px",
            padding: "0 48px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "160px",
                borderBottom: "2px solid #2c3e2d",
                height: "32px",
                display: "flex",
                alignItems: "end",
                justifyContent: "center",
                marginBottom: "8px"
              }}>
                <div style={{
                  fontSize: "12px",
                  color: "#6b8e6b",
                  marginBottom: "4px"
                }}>
                  Dr. Sakura Tanaka
                </div>
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#2c3e2d"
              }}>
                Academy Director
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6b8e6b"
              }}>
                Chief Language Instructor
              </div>
            </div>

            {/* Academy Seal */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#4a7c59",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px auto"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  border: "2px solid white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  認定
                </div>
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#2c3e2d"
              }}>
                Official Seal
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "160px",
                borderBottom: "2px solid #2c3e2d",
                height: "32px",
                display: "flex",
                alignItems: "end",
                justifyContent: "center",
                marginBottom: "8px"
              }}>
                <div style={{
                  fontSize: "12px",
                  color: "#6b8e6b",
                  marginBottom: "4px"
                }}>
                  Prof. Hiroshi Nakamura
                </div>
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#2c3e2d"
              }}>
                Program Coordinator
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6b8e6b"
              }}>
                Curriculum Specialist
              </div>
            </div>
          </div>

          {/* Footer with enhanced validation */}
          <div style={{
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #4a7c59",
            padding: "16px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
              color: "#5c6d5e"
            }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "500" }}>Certificate ID: {certificateId}</div>
                <div style={{ color: "#6b8e6b" }}>Issued: {formatDate(new Date())}</div>
              </div>
              
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "500", color: "#4a7c59" }}>Bonsai Academy</div>
                <div>Japanese Language Institute</div>
              </div>
              
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "500" }}>Verify at:</div>
                <div style={{ color: "#4a7c59" }}>bonsaiacademy.com/verify</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Watermark */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(12deg)",
        fontSize: "80px",
        fontWeight: "bold",
        color: "#4a7c59",
        opacity: "0.05",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: "1"
      }}>
        CERTIFIED
      </div>
    </div>
  )
}

export function CertificateModal({
  isOpen,
  onClose,
  courseId,
}) {
  const [certificateData, setCertificateData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch real certificate data when modal opens
  useEffect(() => {
    if (isOpen && courseId) {
      fetchCertificateData()
    }
  }, [isOpen, courseId])

  const fetchCertificateData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/certificates/${courseId}`)
      const data = await response.json()

      if (data.success) {
        setCertificateData({
          userName: data.certificate.userName || "Student",
          courseTitle: data.certificate.courseTitle,
          completionDate: new Date(data.certificate.completionDate),
          certificateId: data.certificate.certificateId,
        })
      } else {
        setError(data.error || "Certificate not found")
      }
    } catch (err) {
      console.error('Error fetching certificate:', err)
      setError("Failed to load certificate data")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!certificateData?.certificateId) {
      alert("Certificate ID not found")
      return
    }

    try {
      setDownloading(true)
      
      // Dynamic import to avoid SSR issues
      const [
        { default: html2canvas }, 
        { default: jsPDF }
      ] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])
      
      // Get the PDF-optimized certificate element
      const certificateElement = document.getElementById('pdf-certificate-to-download')
      
      if (!certificateElement) {
        throw new Error('Certificate element not found')
      }

      // Optimized html2canvas settings for inline styles
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: 600,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: 600,
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
        foreignObjectRendering: false
      })

      // Create PDF in landscape mode
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      // Calculate dimensions for A4 landscape
      const pdfWidth = pdf.internal.pageSize.getWidth() // 297mm
      const pdfHeight = pdf.internal.pageSize.getHeight() // 210mm
      
      // Add margins
      const margin = 10
      const availableWidth = pdfWidth - (margin * 2)
      const availableHeight = pdfHeight - (margin * 2)
      
      // Calculate scaling to fit A4 with aspect ratio
      const scaleX = availableWidth / (800 * 0.264583) // Convert px to mm
      const scaleY = availableHeight / (600 * 0.264583)
      const scale = Math.min(scaleX, scaleY)
      
      const finalWidth = 800 * 0.264583 * scale
      const finalHeight = 600 * 0.264583 * scale
      
      // Center the certificate
      const x = (pdfWidth - finalWidth) / 2
      const y = (pdfHeight - finalHeight) / 2

      // Convert canvas to high-quality image
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight)

      // Add metadata
      pdf.setProperties({
        title: `Certificate - ${certificateData.courseTitle}`,
        subject: `Certificate of Completion for ${certificateData.userName}`,
        author: 'Bonsai Academy - Japanese Language Institute',
        keywords: 'certificate, japanese, language, completion',
        creator: 'Bonsai Academy'
      })

      // Download with descriptive filename
      const fileName = `BonsaiAcademy_Certificate_${certificateData.userName.replace(/[^a-zA-Z0-9]/g, '_')}_${certificateData.certificateId}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('Download error:', error)
      alert(`Failed to download certificate: ${error.message}`)
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!certificateData) return

    const shareData = {
      title: `Certificate of Completion - ${certificateData.courseTitle}`,
      text: `I've successfully completed "${certificateData.courseTitle}" at Bonsai Academy - Japanese Language Institute!`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Certificate link copied to clipboard!')
    }).catch(() => {
      alert('Unable to copy link')
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[95vh] overflow-auto rounded-xl bg-white shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#4a7c59] to-[#6b8e6b] text-white">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold">Your Professional Certificate</h2>
              <p className="text-sm opacity-90 mt-1">Bonsai Academy - Japanese Language Institute</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition-colors"
              disabled={downloading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-[#4a7c59] mb-4" />
              <span className="text-lg text-[#5c6d5e]">Loading your certificate...</span>
              <p className="text-sm text-[#6b8e6b] mt-2">Please wait while we prepare your professional certificate</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 mb-4 font-medium">{error}</p>
                <Button onClick={fetchCertificateData} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  Try Again
                </Button>
              </div>
            </div>
          ) : certificateData ? (
            <>
              {/* Certificate display */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-lg mb-8">
                <div className="flex justify-center">
                  <div 
                    className="inline-block shadow-xl rounded-lg overflow-hidden"
                    style={{ transform: 'scale(0.9)' }}
                  >
                    <DisplayCertificate {...certificateData} />
                  </div>
                </div>
              </div>

              {/* Hidden PDF-optimized certificate for download */}
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div id="pdf-certificate-to-download">
                  <PDFCertificate {...certificateData} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  onClick={handleDownload} 
                  size="lg"
                  className="bg-gradient-to-r from-[#4a7c59] to-[#6b8e6b] text-white hover:from-[#3a6147] hover:to-[#5a7a5a] px-8 py-3"
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download Professional Certificate
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleShare}
                  size="lg"
                  variant="outline" 
                  className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white px-8 py-3"
                  disabled={downloading}
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share Achievement
                </Button>

                <Button 
                  onClick={() => window.open('https://bonsaiacademy.com/verify', '_blank')}
                  size="lg"
                  variant="outline" 
                  className="border-[#6b8e6b] text-[#6b8e6b] hover:bg-[#6b8e6b] hover:text-white px-8 py-3"
                  disabled={downloading}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Verify Certificate
                </Button>
                
                <Button 
                  onClick={onClose} 
                  size="lg"
                  variant="ghost" 
                  className="text-[#5c6d5e] hover:bg-gray-100 px-8 py-3"
                  disabled={downloading}
                >
                  Close
                </Button>
              </div>

              {/* Certificate info section */}
              {certificateData && (
                <div className="mt-8 bg-gradient-to-r from-[#f8f9fa] to-[#f1f7f1] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#2c3e2d] mb-4">Certificate Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-[#4a7c59]">Recipient:</span>
                      <span className="ml-2 text-[#2c3e2d]">{certificateData.userName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4a7c59]">Course:</span>
                      <span className="ml-2 text-[#2c3e2d]">{certificateData.courseTitle}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4a7c59]">Completion Date:</span>
                      <span className="ml-2 text-[#2c3e2d]">{certificateData.completionDate.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4a7c59]">Certificate ID:</span>
                      <span className="ml-2 text-[#2c3e2d] font-mono text-xs">{certificateData.certificateId}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#4a7c59]/20">
                    <p className="text-xs text-[#6b8e6b]">
                      This certificate is issued by Bonsai Academy - Japanese Language Institute and can be verified at bonsaiacademy.com/verify
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}