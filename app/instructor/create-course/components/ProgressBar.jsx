// components/ProgressBar.jsx
import { memo } from "react"

const ProgressBar = memo(({ progress, className = "" }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-[#4a7c59] h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'

export default ProgressBar