// components/ProgressSteps.jsx
import { memo } from "react"
import { AlertCircle } from "lucide-react"

const ProgressSteps = memo(({ steps, currentStep, showValidation, validateStep, onStepClick }) => {
  return (
    <div className="mb-8">
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
            <div 
              className="h-0.5 bg-[#4a7c59] transition-all duration-300"
              style={{ 
                width: currentStep === 0 ? '0%' : `${(currentStep / (steps.length - 1)) * 100}%`
              }}
            />
          </div>
          
          {/* Steps */}
          <div className="flex items-center justify-between relative z-10">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => onStepClick && onStepClick(index)}
                className={`flex items-center bg-white px-2 py-1 rounded-lg transition-all duration-200 ${
                  onStepClick ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                }`}
                disabled={!onStepClick}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium relative transition-all duration-200 ${
                    index <= currentStep ? "bg-[#4a7c59] text-white" : "bg-gray-200 text-gray-600"
                  } ${onStepClick ? 'hover:scale-105' : ''}`}
                >
                  {index + 1}
                  {/* Show error indicator only when validation is active */}
                  {showValidation && index < steps.length - 1 && Object.keys(validateStep(index)).length > 0 && (
                    <AlertCircle className="absolute -top-1 -right-1 h-4 w-4 text-red-500 bg-white rounded-full" />
                  )}
                </div>
                <span className={`ml-2 text-sm whitespace-nowrap transition-colors duration-200 ${
                  index <= currentStep ? "text-[#4a7c59] font-medium" : "text-gray-500"
                } ${onStepClick ? 'hover:text-[#4a7c59]' : ''}`}>
                  {step}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        {/* Current Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium relative ${
                "bg-[#4a7c59] text-white"
              }`}
            >
              {currentStep + 1}
              {/* Show error indicator only when validation is active */}
              {showValidation && currentStep < steps.length - 1 && Object.keys(validateStep(currentStep)).length > 0 && (
                <AlertCircle className="absolute -top-1 -right-1 h-5 w-5 text-red-500 bg-white rounded-full" />
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</div>
              <div className="font-medium text-[#4a7c59]">{steps[currentStep]}</div>
            </div>
          </div>
        </div>

        {/* Step Dots and Progress */}
        <div className="relative">
          {/* Step Dots */}
          <div className="flex justify-between relative z-10">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => onStepClick && onStepClick(index)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  onStepClick ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                }`}
                disabled={!onStepClick}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index <= currentStep ? "bg-[#4a7c59]" : "bg-gray-200"
                  } ${onStepClick ? 'hover:scale-110' : ''}`}
                />
                <span className={`text-xs mt-1 text-center max-w-[60px] leading-tight transition-colors duration-200 ${
                  index <= currentStep ? "text-[#4a7c59] font-medium" : "text-gray-500"
                } ${onStepClick ? 'hover:text-[#4a7c59]' : ''}`}>
                  {step.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
          
          {/* Progress Line */}
          <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-gray-200 -translate-y-0.5">
            <div 
              className="h-0.5 bg-[#4a7c59] transition-all duration-300"
              style={{ 
                width: currentStep === 0 ? '0%' : `${(currentStep / (steps.length - 1)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

ProgressSteps.displayName = 'ProgressSteps'

export default ProgressSteps