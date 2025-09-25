// components/ArrayInput.jsx
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

const ArrayInput = memo(({ 
  items, 
  updateFn, 
  removeFn, 
  addFn, 
  placeholder, 
  btnName, 
  fieldKey = null, 
  limit = null, 
  errorKey = null, 
  maxLength = null,
  renderValidationError,
  showValidation,
  validationErrors
}) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex gap-2">
            <input
              className={`flex-1 rounded-md border p-2 ${showValidation && errorKey && validationErrors[errorKey] ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={placeholder}
              value={fieldKey ? item[fieldKey] : item}
              maxLength={maxLength}
              onChange={(e) => updateFn(index, e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeFn(index)}
              disabled={items.length === 1}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {maxLength && (
            <div className="text-xs text-gray-500 text-right">
              {(fieldKey ? item[fieldKey] : item).length}/{maxLength} characters
            </div>
          )}
        </div>
      ))}
      {errorKey && renderValidationError(errorKey)}
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={addFn}
          disabled={limit && items.length >= limit}
          className="border-dashed border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> {btnName}
        </Button>
        {limit && (
          <span className="text-sm text-gray-500">
            ({items.length}/{limit})
          </span>
        )}
      </div>
    </div>
  )
})

ArrayInput.displayName = 'ArrayInput'

export default ArrayInput