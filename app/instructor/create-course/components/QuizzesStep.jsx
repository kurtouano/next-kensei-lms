// components/QuizzesStep.jsx - Enhanced version with automated points calculation
import { memo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, AlertCircle, Info } from "lucide-react"

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

  // Auto-calculate points when question data changes
  const calculateAndUpdatePoints = (moduleIndex, questionIndex, question) => {
    let calculatedPoints = 1; // default

    switch (question.type) {
      case "multiple_choice":
        calculatedPoints = 1; // Always 1 point for multiple choice
        break;
      case "fill_in_blanks":
        calculatedPoints = question.blanks?.length || 1; // 1 point per blank
        break;
      case "matching":
        calculatedPoints = question.pairs?.length || 1; // 1 point per pair
        break;
      default:
        calculatedPoints = 1;
    }

    // Only update if points changed to avoid infinite loops
    if (question.points !== calculatedPoints) {
      updateQuestion(moduleIndex, questionIndex, "points", calculatedPoints);
    }
  };

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

            {/* Points Calculation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Points Auto-Calculation:</strong>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• <strong>Multiple Choice:</strong> 1 point per question</li>
                    <li>• <strong>Fill in Blanks:</strong> 1 point per blank (e.g., 3 blanks = 3 points)</li>
                    <li>• <strong>Matching:</strong> 1 point per pair (e.g., 5 pairs = 5 points)</li>
                  </ul>
                </div>
              </div>
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
                calculateAndUpdatePoints={calculateAndUpdatePoints}
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

// Enhanced Question Card Component with auto-points calculation
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
  calculateAndUpdatePoints,
  onRemoveQuestion
}) {
  const questionTypes = [
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "fill_in_blanks", label: "Fill in the Blanks" },
    { value: "matching", label: "Matching" }
  ]

  // Auto-calculate points whenever question data changes
  useEffect(() => {
    calculateAndUpdatePoints(moduleIndex, questionIndex, question);
  }, [question.type, question.blanks?.length, question.pairs?.length, moduleIndex, questionIndex]);

  // Get points display text based on question type
  const getPointsDisplay = () => {
    switch (question.type) {
      case "multiple_choice":
        return "1 point (auto-calculated)";
      case "fill_in_blanks":
        const blankCount = question.blanks?.length || 1;
        return `${blankCount} ${blankCount === 1 ? 'point' : 'points'} (${blankCount} ${blankCount === 1 ? 'blank' : 'blanks'})`;
      case "matching":
        const pairCount = question.pairs?.length || 1;
        return `${pairCount} ${pairCount === 1 ? 'point' : 'points'} (${pairCount} ${pairCount === 1 ? 'pair' : 'pairs'})`;
      default:
        return "1 point";
    }
  };

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
        <label className="text-sm font-medium flex flex-row items-center">
          Question <span className="text-red-500">*</span>
          {question.type === "fill_in_blanks" && (
            <p className="text-xs ml-2 text-gray-600">
              {`[ Use ___ (3 underscores) to represent blanks in your question. ]`}
            </p>
          )}
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

      {/* Auto-calculated Points Display */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Points:</span>
          <span className="text-sm text-green-700 font-medium">{getPointsDisplay()}</span>
        </div>
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

// Multiple Choice Question Component (unchanged)
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

// Fill in the Blanks Question Component (removed individual points)
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
          Answers for Blanks <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-600">
          Each blank is worth 1 point. Total points = number of blanks.
        </p>
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

// Matching Question Component (removed individual pair points)
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
          Create pairs for students to match. Each correct match is worth 1 point. Total points = number of pairs.
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