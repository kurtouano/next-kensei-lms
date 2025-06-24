// app/api/certificates/[certificateId]/download/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDb } from "@/lib/mongodb"
import Certificate from "@/models/Certificate"
import User from "@/models/User"
import puppeteer from 'puppeteer'

export async function GET(request, { params }) {
  try {
    await connectDb()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 })
    }

    const { certificateId } = await params

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 })
    }

    // Find certificate and verify ownership
    const certificate = await Certificate.findOne({ 
      certificateId: certificateId,
      user: user._id
    }).populate('user', 'name email icon')

    if (!certificate) {
      return NextResponse.json({ 
        success: false, 
        error: "Certificate not found or access denied" 
      }, { status: 404 })
    }

    // Generate PDF using Puppeteer
    const pdfBuffer = await generateCertificatePDF(certificate)

    // Set response headers for PDF download
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="Certificate_${certificate.certificateId}.pdf"`)
    headers.set('Content-Length', pdfBuffer.length.toString())

    return new NextResponse(pdfBuffer, { headers })

  } catch (error) {
    console.error("Error generating certificate PDF:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to generate certificate PDF" 
    }, { status: 500 })
  }
}

async function generateCertificatePDF(certificate) {
  let browser = null
  
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 })
    
    // Format completion date
    const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Generate HTML content for certificate
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          background: #f8f7f4;
          padding: 40px;
          width: 1200px;
          height: 800px;
        }
        
        .certificate {
          width: 100%;
          height: 100%;
          background: white;
          border: 12px double rgba(74, 124, 89, 0.2);
          position: relative;
          padding: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .header {
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #4a7c59;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        
        .bonsai-icon {
          color: #4a7c59;
          font-size: 40px;
        }
        
        .subtitle {
          color: #5c6d5e;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-top: 15px;
        }
        
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 800px;
        }
        
        .certify-text {
          color: #5c6d5e;
          font-size: 20px;
          margin-bottom: 30px;
        }
        
        .user-name {
          color: #2c3e2d;
          font-size: 48px;
          font-weight: bold;
          font-style: italic;
          margin-bottom: 30px;
          font-family: 'Georgia', serif;
        }
        
        .completed-text {
          color: #5c6d5e;
          font-size: 20px;
          margin-bottom: 30px;
        }
        
        .course-title {
          color: #4a7c59;
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 30px;
          font-family: 'Georgia', serif;
        }
        
        .completion-date {
          color: #5c6d5e;
          font-size: 20px;
          margin-bottom: 40px;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-top: 60px;
        }
        
        .signature {
          text-align: center;
        }
        
        .signature-line {
          width: 200px;
          height: 1px;
          background: #2c3e2d;
          margin-bottom: 10px;
        }
        
        .signature-title {
          color: #2c3e2d;
          font-size: 14px;
          font-weight: 500;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(74, 124, 89, 0.2);
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .footer-text {
          color: #5c6d5e;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <!-- Header -->
        <div class="header">
          <h1>
            <span class="bonsai-icon">🌿</span>
            BONSAI LEARNING
            <span class="bonsai-icon">🌿</span>
          </h1>
          <div class="subtitle">Certificate of Completion</div>
        </div>

        <!-- Main Content -->
        <div class="content">
          <p class="certify-text">This is to certify that</p>
          <h2 class="user-name">${certificate.user.name}</h2>
          <p class="completed-text">has successfully completed the course</p>
          <h3 class="course-title">"${certificate.courseTitle}"</h3>
          <p class="completion-date">on ${completionDate}</p>
        </div>

        <!-- Signatures -->
        <div class="signatures">
          <div class="signature">
            <div class="signature-line"></div>
            <p class="signature-title">Course Instructor</p>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <p class="signature-title">Program Director</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <span class="footer-text">Certificate ID: ${certificate.certificateId}</span>
          <span class="footer-text">Verify at: bonsailearning.com/verify</span>
        </div>
      </div>
    </body>
    </html>
    `
    
    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    })
    
    return pdfBuffer
    
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}