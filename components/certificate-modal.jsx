// components/certificate-modal.jsx
"use client"
import { X, Download, Loader2, ExternalLink, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

// FIXED: PDF Certificate component with real instructor name
function PDFCertificate({
  userName = "SakuraBonsai",
  courseTitle = "Japanese Basics", 
  completionDate = new Date(),
  certificateId = "BONSAI-CERT-12345",
  instructorName = "Instructor", // ADDED: Real instructor name prop
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
        height: "650px",
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
        padding: "24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "center",
        position: "relative",
        zIndex: "10",
        alignItems: "center"
      }}>
        
        {/* Header */}
        <div style={{ width: "100%", textAlign: "center" }}>
          {/* Academy logo and name */} 
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "8px",
            width: "100%"
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
              fontSize: "21px",
              fontWeight: "bold",
              fontFamily: "Arial, sans-serif",
              paddingBottom: "18px"
            }}>
              日
            </div>
            
            <div style={{ 
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#2c3e2d", 
                letterSpacing: "2px",
                marginBottom: "4px"
              }}>
                JOTATSU
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6b8e6b",
                letterSpacing: "2px"
              }}>
                JAPANESE LANGUAGE LEARNING ACADEMY
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
              fontSize: "21px",
              fontWeight: "bold",
              fontFamily: "Arial, sans-serif",
              paddingBottom: "18px"
            }}>
              日
            </div>
          </div>
          
          {/* Certificate title */}
          <div style={{
            borderTop: "2px solid #4a7c59",
            padding: "8px 0",
            margin: "12px 0 6px 0",
            textAlign: "center",
            width: "100%"
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
          padding: "16px",
          borderRadius: "8px",
          margin: "8px 0",
          width: "100%",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "16px",
            color: "#5c6d5e",
            marginBottom: "8px" 
          }}>
            This is to certify that
          </div>
          
          <div style={{
            width: "77%",
            margin: "0 auto 8px auto", 
            borderBottom: "2px solid #4a7c59",
            paddingBottom: "15px",
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
            marginBottom: "15px"
          }}>
            has successfully completed the comprehensive course
          </div>
          
          <div style={{
            backgroundColor: "#4a7c59",
            color: "white",
            padding: "5px",
            borderRadius: "8px",
            textAlign: "center", 
            margin: "0 auto 10px auto", 
            maxWidth: "560px",
            width: "100%" 
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
              marginTop: "2px",
              marginBottom: "15px"
            }}>
              Japanese Language Mastery Program
            </div>
          </div>
          
          <div style={{
            marginBottom: "6px"
          }}>
            <div style={{
              fontSize: "16px",
              color: "#5c6d5e",
              fontWeight: "500"
            }}>
              Completed on {formatDate(completionDate)}
            </div>
          </div>
          
          <div style={{
            fontSize: "13px",
            color: "#6b8e6b"
          }}>
            Recognized by Jotatsu Japanese Language Learning Academy
          </div>
        </div>

        {/* Authority and Validation - FIXED: Use real instructor name */}
        <div style={{ width: "100%", textAlign: "center" }}>
          {/* Signatures */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: "16px",
            padding: "0 32px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "120px",
                borderBottom: "2px solid #2c3e2d",
                height: "28px",
                display: "flex",
                alignItems: "end",
                justifyContent: "center",
                marginBottom: "6px",
                paddingBottom: "2px"
              }}>
                <div style={{
                  fontSize: "11px",
                  color: "#6b8e6b",
                  fontWeight: "500",
                  paddingBottom: "8px",
                }}>
                  {instructorName}
                </div>
              </div>
              <div style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "#2c3e2d"
              }}>
                Course Instructor
              </div>
              <div style={{
                fontSize: "10px",
                color: "#6b8e6b"
              }}>
                Japanese Language Expert
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "120px",
                borderBottom: "2px solid #2c3e2d",
                height: "24px",
                display: "flex",
                alignItems: "end",
                justifyContent: "center",
                marginBottom: "6px"
              }}>
                <div style={{
                  fontSize: "11px",
                  color: "#6b8e6b",
                  marginBottom: "4px",
                  paddingBottom: "8px",
                }}>
                  Jotatsu Academy
                </div>
              </div>
              <div style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "#2c3e2d"
              }}>
                Academic Director
              </div>
              <div style={{
                fontSize: "10px",
                color: "#6b8e6b"
              }}>
                Curriculum Specialist
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "2px solid #4a7c59",
            padding: "12px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "11px",
              color: "#5c6d5e"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "500" }}>Certificate ID: {certificateId}</div>
                <div style={{ color: "#6b8e6b" }}>Issued: {formatDate(new Date())}</div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      
      {/* Watermark */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(12deg)",
        fontSize: "100px",
        fontWeight: "bold",
        color: "#4a7c59",
        opacity: "0.06",
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
  const [viewing, setViewing] = useState(false)
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
          instructorName: data.certificate.instructorName || "Instructor",
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

  const generatePDF = async () => {
    if (!certificateData?.certificateId) {
      throw new Error("Certificate ID not found")
    }

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
      height: 650,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 800,
      windowHeight: 650,
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
    const scaleY = availableHeight / (650 * 0.264583)
    const scale = Math.min(scaleX, scaleY)
    
    const finalWidth = 800 * 0.264583 * scale
    const finalHeight = 650 * 0.264583 * scale
    
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
      author: 'Jotatsu - Japanese Language Learning Academy',
      keywords: 'certificate, japanese, language, completion',
      creator: 'Jotatsu'
    })

    return pdf
  }

  const handleView = async () => {
    try {
      setViewing(true)
      
      const pdf = await generatePDF()
      
      // Create blob URL and open in new tab
      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      window.open(url, '_blank')
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000)

    } catch (error) {
      console.error('View error:', error)
      alert(`Failed to view certificate: ${error.message}`)
    } finally {
      setViewing(false)
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      
      const pdf = await generatePDF()
      
      // Download with descriptive filename
      const fileName = `Jotatsu_Certificate_${certificateData.userName.replace(/[^a-zA-Z0-9]/g, '_')}_${certificateData.certificateId}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('Download error:', error)
      alert(`Failed to download certificate: ${error.message}`)
    } finally {
      setDownloading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-auto rounded-xl bg-white shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4a7c59] to-[#6b8e6b] text-white">
          <div className="flex items-center justify-between py-6 px-8">
            <div>
              <h2 className="text-xl font-bold">Certificate of Completion</h2>
              <p className="text-sm opacity-90 mt-1">Jotatsu - Japanese Language Learning Academy</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              disabled={downloading || viewing}
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
              <p className="text-sm text-[#6b8e6b] mt-2">Please wait while we prepare your certificate</p>
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
              {/* Certificate Success Message */}
              <div className="text-center mb-6">
                <p className="text-[#5c6d5e] mb-1">You have successfully completed</p>
                <p className="text-lg font-semibold text-[#4a7c59]">"{certificateData.courseTitle}"</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button 
                  onClick={handleView} 
                  size="lg"
                  variant="outline"
                  className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] px-8 py-3"
                  disabled={viewing || downloading}
                >
                  {viewing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-5 w-5" />
                      View Certificate
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleDownload} 
                  size="lg"
                  className="bg-gradient-to-r from-[#4a7c59] to-[#6b8e6b] text-white hover:from-[#3a6147] hover:to-[#5a7a5a] px-8 py-3"
                  disabled={downloading || viewing}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download Certificate
                    </>
                  )}
                </Button>
              </div>

              {/* Hidden PDF-optimized certificate for generation */}
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div id="pdf-certificate-to-download">
                  <PDFCertificate {...certificateData} />
                </div>
              </div>


              {/* Profile link */}
              <div className="text-center">
                <p className="text-sm text-[#6b8e6b]">
                  You can also view all your certificates anytime in your{" "}
                  <a 
                    href="/profile?tab=certifications" 
                    className="text-[#4a7c59] hover:text-[#3a6147] font-medium underline"
                  >
                    Profile page
                  </a>
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}