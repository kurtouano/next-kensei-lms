"use client"
import { X } from "lucide-react"
import { Certificate } from "@/components/certificate"
import { Button } from "@/components/ui/button"

export function CertificateModal({
  isOpen,
  onClose,
  certificateData = {
    userName: "SakuraBonsai",
    courseTitle: "Japanese Basics",
    completionDate: new Date(),
    certificateId: "BONSAI-CERT-12345",
  },
}) {
  if (!isOpen) return null

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll simulate a download with an alert
    alert("Certificate download started! In a real implementation, this would generate and download a PDF file.")

    // In a real implementation, you would use a library like jsPDF or html2canvas + jsPDF
    // Example with html2canvas + jsPDF (you would need to install these libraries):
    /*
    import html2canvas from 'html2canvas';
    import { jsPDF } from 'jspdf';
    
    const certificateElement = document.getElementById('certificate-to-download');
    
    html2canvas(certificateElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${certificateData.userName}_${certificateData.courseTitle}_Certificate.pdf`);
    });
    */
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[#eef2eb] p-2 text-[#4a7c59] hover:bg-[#dce4d7]"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-center text-2xl font-bold text-[#2c3e2d]">Your Certificate</h2>

        <div id="certificate-to-download" className="mb-6">
          <Certificate {...certificateData} />
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={handleDownload} className="bg-[#4a7c59] text-white hover:bg-[#3a6147]">
            Download Certificate
          </Button>
          <Button onClick={onClose} variant="outline" className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
