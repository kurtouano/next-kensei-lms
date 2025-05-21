import { BonsaiIcon } from "@/components/bonsai-icon"
import { formatDate } from "@/lib/utils"

export function Certificate({
  userName = "SakuraBonsai",
  courseTitle = "Japanese Basics",
  completionDate = new Date(),
  certificateId = "BONSAI-CERT-12345",
}) {
  return (
    <div
      className="relative w-full bg-white p-8 shadow-lg"
      style={{ aspectRatio: "1.414/1", maxWidth: "800px", margin: "0 auto" }}
    >
      {/* Border design */}
      <div className="absolute inset-0 border-[12px] border-double border-[#4a7c59]/20"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[url('/placeholder.svg?height=20&width=20')] bg-repeat"></div>
      </div>

      {/* Certificate content */}
      <div className="relative flex h-full flex-col items-center justify-between p-8 text-center">
        {/* Header */}
        <div className="mb-4 w-full">
          <div className="flex items-center justify-center gap-3">
            <BonsaiIcon className="h-10 w-10 text-[#4a7c59]" />
            <h1 className="text-2xl font-bold tracking-wide text-[#2c3e2d]">BONSAI LEARNING</h1>
            <BonsaiIcon className="h-10 w-10 text-[#4a7c59]" />
          </div>
          <div className="mt-2 text-sm font-medium uppercase tracking-widest text-[#5c6d5e]">
            Certificate of Completion
          </div>
        </div>

        {/* Main content */}
        <div className="my-6 w-full">
          <p className="mb-4 text-lg text-[#5c6d5e]">This is to certify that</p>
          <h2 className="mb-6 font-serif text-3xl font-bold italic text-[#2c3e2d]">{userName}</h2>
          <p className="mb-4 text-lg text-[#5c6d5e]">has successfully completed the course</p>
          <h3 className="mb-6 font-serif text-2xl font-bold text-[#4a7c59]">"{courseTitle}"</h3>
          <p className="text-lg text-[#5c6d5e]">on {formatDate(completionDate)}</p>
        </div>

        {/* Signatures */}
        <div className="mt-6 flex w-full justify-between">
          <div className="flex flex-col items-center">
            <div className="h-12 w-40 border-b border-[#2c3e2d]">
              <img
                src="/placeholder.svg?height=48&width=160"
                alt="Instructor Signature"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-2 text-sm font-medium text-[#2c3e2d]">Course Instructor</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-12 w-40 border-b border-[#2c3e2d]">
              <img
                src="/placeholder.svg?height=48&width=160"
                alt="Director Signature"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-2 text-sm font-medium text-[#2c3e2d]">Program Director</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex w-full items-center justify-between text-xs text-[#5c6d5e]">
          <p>Certificate ID: {certificateId}</p>
          <p>Verify at: bonsailearning.com/verify</p>
        </div>
      </div>
    </div>
  )
}
