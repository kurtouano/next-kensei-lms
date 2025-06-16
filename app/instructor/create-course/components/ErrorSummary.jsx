// components/ErrorSummary.jsx
import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

const ErrorSummary = memo(({ showValidation, validationErrors }) => {
  // Don't render if validation is not shown or no errors
  if (!showValidation || Object.keys(validationErrors).length === 0) {
    return null
  }

  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h4 className="font-medium text-red-800">Please fix the following issues:</h4>
        </div>
        <ul className="text-sm text-red-700 space-y-1">
          {Object.values(validationErrors).map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
})

ErrorSummary.displayName = 'ErrorSummary'

export default ErrorSummary