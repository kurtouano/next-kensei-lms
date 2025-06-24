import { BonsaiIcon } from "@/components/bonsai-icon"
import { formatDate } from "@/lib/utils"

// PDF-optimized certificate component - simpler styling, no complex gradients
export function PDFCertificate({
  userName = "SakuraBonsai",
  courseTitle = "Japanese Basics",
  completionDate = new Date(),
  certificateId = "BONSAI-CERT-12345",
}) {
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

      {/* Main content container - FIXED: Reduced padding to fit all content */}
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

        {/* Main content - FIXED: Reduced spacing to fit everything */}
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

        {/* Signatures - FIXED: Match modal layout exactly */}
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            padding: "0 48px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "140px",
                borderBottom: "1px solid #2c3e2d",
                height: "1px",
                marginBottom: "4px"
              }}></div>
              <div style={{
                fontSize: "12px",
                color: "#2c3e2d",
                fontWeight: "normal"
              }}>
                Dr. Sakura Tanaka
              </div>
            </div>

            {/* Academy Seal - FIXED: Remove circle, make it like modal */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#4a7c59",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 4px auto"
              }}>
                <div style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}>
                  認定
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "140px",
                borderBottom: "1px solid #2c3e2d",
                height: "1px",
                marginBottom: "4px"
              }}></div>
              <div style={{
                fontSize: "12px",
                color: "#2c3e2d",
                fontWeight: "normal"
              }}>
                Prof. Hiroshi Nakamura
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}