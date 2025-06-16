// components/QuizzesStep.jsx
import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, AlertCircle } from "lucide-react"

const QuizzesStep = memo(({ 
  modules, 
  moduleHandlers, 
  validationErrors,
  showValidation,
  renderValidationError 
}) => {
  // Destructure handlers for cleaner code
  const {
    updateModule,
    addQuestion,
    updateQuestion,
    updateOption
  } = moduleHandlers

  return (
    <div className="space-y-6">
      {modules.map((module, moduleIndex) => (
        <Card key={moduleIndex}>
          <CardHeader>
            <div>
              <CardTitle>Quiz for Module {moduleIndex + 1}: {module.title}</CardTitle>
              {showValidation && validationErrors[`quiz_${moduleIndex}_title`] && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Quiz title is required
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quiz Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full rounded-md border p-2 ${showValidation && validationErrors[`quiz_${moduleIndex}_title`] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., Hiragana Basics Quiz"
                value={module.quiz.title}
                onChange={(e) => updateModule(moduleIndex, "quiz", { ...module.quiz, title: e.target.value })}
              />
            </div>

            {/* Questions */}
            {module.quiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">Question {questionIndex + 1}</h5>
                    {(showValidation && (validationErrors[`quiz_${moduleIndex}_question_${questionIndex}`] ||
                      validationErrors[`quiz_${moduleIndex}_question_${questionIndex}_options`] ||
                      validationErrors[`quiz_${moduleIndex}_question_${questionIndex}_correct`])) && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Please complete this question
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newQuestions = module.quiz.questions.filter((_, i) => i !== questionIndex)
                      updateModule(moduleIndex, "quiz", { ...module.quiz, questions: newQuestions })
                    }}
                    disabled={module.quiz.questions.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`w-full rounded-md border p-2 ${showValidation && validationErrors[`quiz_${moduleIndex}_question_${questionIndex}`] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your question"
                    value={question.question}
                    onChange={(e) => updateQuestion(moduleIndex, questionIndex, "question", e.target.value)}
                  />
                  {renderValidationError(`quiz_${moduleIndex}_question_${questionIndex}`)}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Options <span className="text-red-500">*</span>
                  </label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name={`question-${moduleIndex}-${questionIndex}`}
                        checked={option.isCorrect}
                        onChange={() => {
                          const newOptions = question.options.map((opt, i) => ({
                            ...opt,
                            isCorrect: i === optionIndex,
                          }))
                          updateQuestion(moduleIndex, questionIndex, "options", newOptions)
                        }}
                      />
                      <input
                        className="flex-1 rounded-md border border-gray-300 p-2"
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateOption(moduleIndex, questionIndex, optionIndex, "text", e.target.value)
                        }
                      />
                      <span className="text-sm text-gray-500">{option.isCorrect ? "(Correct)" : ""}</span>
                    </div>
                  ))}
                  {renderValidationError(`quiz_${moduleIndex}_question_${questionIndex}_options`)}
                  {renderValidationError(`quiz_${moduleIndex}_question_${questionIndex}_correct`)}
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={() => addQuestion(moduleIndex)}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

QuizzesStep.displayName = 'QuizzesStep'

export default QuizzesStep