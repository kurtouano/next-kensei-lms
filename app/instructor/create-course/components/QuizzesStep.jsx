// components/QuizzesStep.jsx - Enhanced version with multiple question types
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
    updateOption,
    updateMatchingPair,
    addMatchingPair,
    removeMatchingPair,
    addFillInBlank,
    removeFillInBlank,
    updateFillInBlank
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
              <QuestionCard
                key={questionIndex}
                question={question}
                questionIndex={questionIndex}
                moduleIndex={moduleIndex}
                showValidation={showValidation}
                validationErrors={validationErrors}
                renderValidationError={renderValidationError}
                updateQuestion={updateQuestion}
                updateOption={updateOption}
                updateMatchingPair={updateMatchingPair}
                addMatchingPair={addMatchingPair}
                removeMatchingPair={removeMatchingPair}
                addFillInBlank={addFillInBlank}
                removeFillInBlank={removeFillInBlank}
                updateFillInBlank={updateFillInBlank}
                onRemoveQuestion={() => {
                  const newQuestions = module.quiz.questions.filter((_, i) => i !== questionIndex)
                  updateModule(moduleIndex, "quiz", { ...module.quiz, questions: newQuestions })
                }}
              />
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

// Enhanced Question Card Component
const QuestionCard = memo(function QuestionCard({
  question,
  questionIndex,
  moduleIndex,
  showValidation,
  validationErrors,
  renderValidationError,
  updateQuestion,
  updateOption,
  updateMatchingPair,
  addMatchingPair,
  removeMatchingPair,
  addFillInBlank,
  removeFillInBlank,
  updateFillInBlank,
  onRemoveQuestion
}) {
  const questionTypes = [
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "fill_in_blanks", label: "Fill in the Blanks" },
    { value: "matching", label: "Matching" }
  ]

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h5 className="font-medium">Question {questionIndex + 1}</h5>
          {(showValidation && (validationErrors[`quiz_${moduleIndex}_question_${questionIndex}`] ||
            validationErrors[`quiz_${moduleIndex}_question_${questionIndex}_content`])) && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              Please complete this question
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemoveQuestion}
          disabled={moduleIndex === 0 && questionIndex === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Question Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Question Type <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full rounded-md border border-gray-300 p-2"
          value={question.type || "multiple_choice"}
          onChange={(e) => updateQuestion(moduleIndex, questionIndex, "type", e.target.value)}
        >
          {questionTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Question <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`w-full rounded-md border p-2 ${showValidation && validationErrors[`quiz_${moduleIndex}_question_${questionIndex}`] ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter your question"
          rows={2}
          value={question.question}
          onChange={(e) => updateQuestion(moduleIndex, questionIndex, "question", e.target.value)}
        />
        {renderValidationError(`quiz_${moduleIndex}_question_${questionIndex}`)}
      </div>

      {/* Points */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Points</label>
        <input
          type="number"
          min="1"
          max="10"
          className="w-full rounded-md border border-gray-300 p-2"
          placeholder="Points for this question"
          value={question.points || 1}
          onChange={(e) => updateQuestion(moduleIndex, questionIndex, "points", parseInt(e.target.value) || 1)}
        />
      </div>

      {/* Render question type specific content */}
      {question.type === "multiple_choice" && (
        <MultipleChoiceQuestion
          question={question}
          questionIndex={questionIndex}
          moduleIndex={moduleIndex}
          updateQuestion={updateQuestion}
          updateOption={updateOption}
          showValidation={showValidation}
          validationErrors={validationErrors}
          renderValidationError={renderValidationError}
        />
      )}

      {question.type === "fill_in_blanks" && (
        <FillInBlanksQuestion
          question={question}
          questionIndex={questionIndex}
          moduleIndex={moduleIndex}
          updateQuestion={updateQuestion}
          addFillInBlank={addFillInBlank}
          removeFillInBlank={removeFillInBlank}
          updateFillInBlank={updateFillInBlank}
          showValidation={showValidation}
          validationErrors={validationErrors}
          renderValidationError={renderValidationError}
        />
      )}

      {question.type === "matching" && (
        <MatchingQuestion
          question={question}
          questionIndex={questionIndex}
          moduleIndex={moduleIndex}
          updateMatchingPair={updateMatchingPair}
          addMatchingPair={addMatchingPair}
          removeMatchingPair={removeMatchingPair}
          showValidation={showValidation}
          validationErrors={validationErrors}
          renderValidationError={renderValidationError}
        />
      )}
    </div>
  )
})

// Multiple Choice Question Component
const MultipleChoiceQuestion = memo(function MultipleChoiceQuestion({
  question,
  questionIndex,
  moduleIndex,
  updateQuestion,
  updateOption,
  showValidation,
  validationErrors,
  renderValidationError
}) {
  return (
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
  )
})

// Fill in the Blanks Question Component
const FillInBlanksQuestion = memo(function FillInBlanksQuestion({
  question,
  questionIndex,
  moduleIndex,
  updateQuestion,
  addFillInBlank,
  removeFillInBlank,
  updateFillInBlank,
  showValidation,
  validationErrors,
  renderValidationError
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Instructions
        </label>
        <p className="text-xs text-gray-600">
          Use ___ (3 underscores) to represent blanks in your question text above.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Answers for Blanks <span className="text-red-500">*</span>
        </label>
        {question.blanks?.map((blank, blankIndex) => (
          <div key={blankIndex} className="flex gap-2 items-center">
            <span className="text-sm font-medium w-16">Blank {blankIndex + 1}:</span>
            <input
              className="flex-1 rounded-md border border-gray-300 p-2"
              placeholder="Correct answer"
              value={blank.answer}
              onChange={(e) => updateFillInBlank(moduleIndex, questionIndex, blankIndex, "answer", e.target.value)}
            />
            <input
              className="w-32 rounded-md border border-gray-300 p-2"
              placeholder="Alternative"
              value={blank.alternatives?.[0] || ""}
              onChange={(e) => updateFillInBlank(moduleIndex, questionIndex, blankIndex, "alternatives", [e.target.value])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeFillInBlank(moduleIndex, questionIndex, blankIndex)}
              disabled={question.blanks?.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addFillInBlank(moduleIndex, questionIndex)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Blank
        </Button>
        {renderValidationError(`quiz_${moduleIndex}_question_${questionIndex}_blanks`)}
      </div>
    </div>
  )
})

// Matching Question Component
const MatchingQuestion = memo(function MatchingQuestion({
  question,
  questionIndex,
  moduleIndex,
  updateMatchingPair,
  addMatchingPair,
  removeMatchingPair,
  showValidation,
  validationErrors,
  renderValidationError
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Instructions
        </label>
        <p className="text-xs text-gray-600">
          Create pairs for students to match. Each correct match will award points.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Matching Pairs <span className="text-red-500">*</span>
        </label>
        {question.pairs?.map((pair, pairIndex) => (
          <div key={pairIndex} className="flex gap-2 items-center p-2 border rounded">
            <div className="flex-1 space-y-2">
              <input
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Left side (e.g., Word)"
                value={pair.left}
                onChange={(e) => updateMatchingPair(moduleIndex, questionIndex, pairIndex, "left", e.target.value)}
              />
              <input
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Right side (e.g., Definition)"
                value={pair.right}
                onChange={(e) => updateMatchingPair(moduleIndex, questionIndex, pairIndex, "right", e.target.value)}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Points</span>
              <input
                type="number"
                min="1"
                max="5"
                className="w-16 rounded-md border border-gray-300 p-1 text-center"
                value={pair.points || 1}
                onChange={(e) => updateMatchingPair(moduleIndex, questionIndex, pairIndex, "points", parseInt(e.target.value) || 1)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeMatchingPair(moduleIndex, questionIndex, pairIndex)}
              disabled={question.pairs?.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addMatchingPair(moduleIndex, questionIndex)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Pair
        </Button>
        {renderValidationError(`quiz_${moduleIndex}_question_${questionIndex}_pairs`)}
      </div>
    </div>
  )
})

QuizzesStep.displayName = 'QuizzesStep'

export default QuizzesStep