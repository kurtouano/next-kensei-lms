"use client"

import { Check } from "lucide-react"

export const BonsaiMilestones = ({ bonsaiData }) => {
  return (
    <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
      <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">Bonsai Growth Milestones</h2>

      {/* Milestones List */}
      <div className="space-y-4">
        {bonsaiData.milestones.map((milestone) => (
          <div
            key={milestone.level}
            className={`rounded-lg border p-4 ${
              milestone.isAchieved
                ? "border-[#4a7c59] bg-[#eef2eb]"
                : "border-[#dce4d7] bg-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                    milestone.isAchieved
                      ? "bg-[#4a7c59] text-white"
                      : "bg-[#dce4d7] text-[#5c6d5e]"
                  }`}
                >
                  {milestone.isAchieved ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    milestone.level
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#2c3e2d] text-sm sm:text-base">
                    {milestone.name} - Level {milestone.level}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6d5e] mt-1">{milestone.description}</p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <p className="font-medium text-[#2c3e2d] text-sm sm:text-base">
                  {milestone.creditsRequired} credits
                </p>
                {milestone.isAchieved && milestone.achievedAt && (
                  <p className="text-xs text-[#5c6d5e] mt-1">
                    Achieved {new Date(milestone.achievedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}