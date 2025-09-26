import { memo } from "react"
import { Award } from "lucide-react"

export const ModuleCompleteNotif = memo(function ModuleCompleteNotif() {
  return (
    <div className="mb-4 rounded-lg border-2 border-[#4a7c59] bg-[#eef2eb] p-4 text-center">
      <Award className="mx-auto mb-2 h-8 w-8 text-[#4a7c59]" />
      <h2 className="mb-2 text-xl font-bold text-[#2c3e2d]">Module Completed!</h2>
      <p className="text-[#5c6d5e]">
        You've completed all lessons in this module. Take the quiz to proceed.
      </p>
    </div>
  )
})