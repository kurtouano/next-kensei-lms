import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"

export const ModuleCompleteNotif = memo(function ModuleCompleteNotif({ onTakeQuiz }) {
  return (
    <div className="mb-4 rounded-lg border-2 border-[#4a7c59] bg-[#eef2eb] p-4 text-center">
      <Award className="mx-auto mb-2 h-8 w-8 text-[#4a7c59]" />
      <h2 className="mb-2 text-xl font-bold text-[#2c3e2d]">Module Completed!</h2>
      <p className="mb-4 text-[#5c6d5e]">
        You've completed all lessons in this module. Take the quiz to proceed.
      </p>
      <Button
        className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
        onClick={onTakeQuiz}
      >
        Take Module Quiz Now
      </Button>
    </div>
  )
})