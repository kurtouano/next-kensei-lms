// components/FileUploadInput.jsx
import { memo } from "react"
import { LoaderCircle } from "lucide-react"

const FileUploadInput = memo(({ 
  accept, 
  onChange, 
  uploadKey, 
  currentValue, 
  label, 
  required = false, 
  errorKey = null,
  uploadingFiles,
  renderValidationError,
  showValidation,
  validationErrors
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="file"
          accept={accept}
          className={`w-full rounded-md border p-2 ${showValidation && errorKey && validationErrors[errorKey] ? 'border-red-500' : 'border-gray-300'}`}
          onChange={onChange}
        />
        {uploadingFiles[uploadKey] && (
          <div className="flex items-center px-3">
            <LoaderCircle className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      {errorKey && renderValidationError(errorKey)}
      {currentValue && (
        <a
          href={currentValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm"
        >
          View uploaded file
        </a>
      )}
    </div>
  )
})

FileUploadInput.displayName = 'FileUploadInput'

export default FileUploadInput