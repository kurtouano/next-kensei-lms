// components/QuizzesStep.jsx - Enhanced version with automated quiz titles
import { memo, useEffect, useCallback } from "react"
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

  // Auto-update quiz titles when module titles change
  useEffect(() => {
    modules.forEach((module, moduleIndex) => {
      const expectedQuizTitle = module.title ? `${module.title} Quiz` : ""
      if (module.quiz.title !== expectedQuizTitle) {
        updateModule(moduleIndex, "quiz", { ...module.quiz, title: expectedQuizTitle })
      }
    })
  }, [modules.map(m => m.title).join(','), updateModule]) // Only re-run when module titles change

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

  // Auto-generate blanks based on underscores in question text
  const autoGenerateBlanks = useCallback((moduleIndex, questionIndex, questionText) => {
    if (questionText) {
      // Count underscores (___ = 3 underscores = 1 blank)
      const underscoreMatches = questionText.match(/_{3,}/g);
      const blankCount = underscoreMatches ? underscoreMatches.length : 0;
      
      // Get current blanks
      const currentBlanks = modules[moduleIndex].quiz.questions[questionIndex].blanks || [];
      
      // Only update if the count has changed to avoid infinite loops
      if (currentBlanks.length !== blankCount && modules[moduleIndex].quiz.questions[questionIndex].type === "fill_in_blanks") {
        const newBlanks = [];
        for (let i = 0; i < blankCount; i++) {
          newBlanks.push({
            answer: currentBlanks[i]?.answer || "",
            alternatives: currentBlanks[i]?.alternatives || [""]
          });
        }
        
        updateQuestion(moduleIndex, questionIndex, "blanks", newBlanks);
      }
    }
  }, [modules, updateQuestion]);

  return (
    <div className="space-y-6">
      {modules.map((module, moduleIndex) => (
        <Card key={moduleIndex} className="border-l-4 border-l-[#4a7c59] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-[#f8faf9] to-[#f0f4f1] border-b border-[#e8f0ea]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#4a7c59] text-white rounded-full flex items-center justify-center text-sm font-bold">
                {moduleIndex + 1}
              </div>
              <div>
                <CardTitle className="text-lg text-[#2c3e2d]">Quiz for Module {moduleIndex + 1}: {module.title}</CardTitle>
                <p className="text-sm text-[#4a7c59] mt-1">
                  Quiz Title: <span className="font-medium">{module.title ? `${module.title} Quiz` : "Quiz title will auto-generate"}</span>
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                autoGenerateBlanks={autoGenerateBlanks}
                onRemoveQuestion={() => {
                  const newQuestions = module.quiz.questions.filter((_, i) => i !== questionIndex)
                  updateModule(moduleIndex, "quiz", { ...module.quiz, questions: newQuestions })
                }}
              />
            ))}

            <Button 
              type="button" 
              variant="outline" 
              onClick={() => addQuestion(moduleIndex)}
              className="w-full border-dashed border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
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
  autoGenerateBlanks,
  onRemoveQuestion
}) {
  // Auto-generation is handled in onChange handlers to avoid infinite loops
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
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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
          onChange={(e) => {
            const newType = e.target.value;
            updateQuestion(moduleIndex, questionIndex, "type", newType);
            // Auto-generate blanks when switching to fill-in-blanks
            if (newType === "fill_in_blanks") {
              // Trigger immediately for any existing text
              if (question.question) {
                autoGenerateBlanks(moduleIndex, questionIndex, question.question);
              }
              // Also trigger on next tick to ensure the type change is processed
              setTimeout(() => {
                if (question.question) {
                  autoGenerateBlanks(moduleIndex, questionIndex, question.question);
                }
              }, 0);
            }
          }}
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
              {`[ Use ___ (3 underscores) to mark where students should fill in answers. ]`}
            </p>
          )}
        </label>
        <textarea
          className={`w-full rounded-md border p-2 ${showValidation && validationErrors[`quiz_${moduleIndex}_question_${questionIndex}`] ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter your question"
          rows={2}
          value={question.question}
          onChange={(e) => {
            const newValue = e.target.value;
            updateQuestion(moduleIndex, questionIndex, "question", newValue);
            // Auto-generate blanks for fill-in-blanks questions
            if (question.type === "fill_in_blanks") {
              autoGenerateBlanks(moduleIndex, questionIndex, newValue);
            }
          }}
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
          Fill-in Answers <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-600">
          Each blank is worth 1 point. Total points = number of blanks.
        </p>
        {question.blanks?.map((blank, blankIndex) => (
          <div key={blankIndex} className="flex gap-2 items-center">
            <span className="text-sm font-medium w-24">Answer {blankIndex + 1}:</span>
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
            {/* Delete button removed - answers are auto-generated based on question text */}
          </div>
        ))}
        {/* Add Answer button removed - answers are auto-generated based on underscores in question */}
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
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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