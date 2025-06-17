// components/Quiz.jsx - Minimalist version matching your design
import { memo, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, AlertCircle, ChevronLeft, RotateCcw } from "lucide-react"

export const QuizSection = memo(function QuizSection({
  quiz,
  quizState,
  onStartQuiz,
  onSelectAnswer,
  onSubmitQuiz,
  onRetryQuiz,
  onProceed,
  onBack,
  isLastModule
}) {
  const { started, completed, score, selectedAnswers } = quizState

  const isAllAnswered = useMemo(() => {
    if (!quiz?.questions) return false
    
    return quiz.questions.every(question => {
      const answer = selectedAnswers[question.id]
      
      switch (question.type) {
        case "multiple_choice":
          return answer !== undefined
        
        case "fill_in_blanks":
          const blankCount = (question.question.match(/___/g) || []).length
          return answer && Object.keys(answer).length === blankCount && 
                 Object.values(answer).every(val => val && val.trim())
        
        case "matching":
          return answer && Object.keys(answer).length === question.pairs?.length
        
        default:
          return answer !== undefined
      }
    })
  }, [quiz?.questions, selectedAnswers])

  const getAnsweredCount = useMemo(() => {
    if (!quiz?.questions) return 0
    
    return quiz.questions.filter(question => {
      const answer = selectedAnswers[question.id]
      
      switch (question.type) {
        case "multiple_choice":
          return answer !== undefined
        
        case "fill_in_blanks":
          const blankCount = (question.question.match(/___/g) || []).length
          return answer && Object.keys(answer).length === blankCount
        
        case "matching":
          return answer && Object.keys(answer).length === question.pairs?.length
        
        default:
          return answer !== undefined
      }
    }).length
  }, [quiz?.questions, selectedAnswers])

  if (!started) {
    return (
      <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm text-center">
        <BookOpen className="mx-auto mb-4 h-16 w-16 text-[#4a7c59]" />
        <h2 className="mb-2 text-2xl font-bold text-[#2c3e2d]">{quiz?.title}</h2>
        <p className="mb-6 text-[#5c6d5e]">
          Complete this quiz with a score of 70% or higher to proceed.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-[#4a7c59] text-[#4a7c59]"
            onClick={onBack}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Module
          </Button>
          <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={onStartQuiz}>
            Start Quiz
          </Button>
        </div>
      </div>
    )
  }

  if (completed) {
    const isPassed = score >= 70
    
    return (
      <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm text-center">
        {isPassed ? (
          <Award className="mx-auto mb-4 h-16 w-16 text-[#4a7c59]" />
        ) : (
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-[#e67e22]" />
        )}
        <h2 className="mb-2 text-2xl font-bold text-[#2c3e2d]">Quiz Results</h2>
        <div className="mb-4 inline-block rounded-full bg-[#eef2eb] px-6 py-3">
          <span className={`text-2xl font-bold ${isPassed ? 'text-[#4a7c59]' : 'text-[#e67e22]'}`}>
            {score}%
          </span>
        </div>
        <p className="mb-6 text-[#5c6d5e]">
          {isPassed
            ? "Congratulations! You've passed the quiz."
            : "You need to score at least 70% to proceed. Don't worry, you can try again!"}
        </p>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-[#4a7c59] text-[#4a7c59]"
            onClick={onBack}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Module
          </Button>
          
          {isPassed ? (
            <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={onProceed}>
              {isLastModule ? "Complete Course" : "Next Module"}
            </Button>
          ) : (
            <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={onRetryQuiz}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Retry Quiz
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm text-center">
        <p>Loading quiz...</p>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#2c3e2d]">{quiz.title}</h2>
      
      {/* Progress Section */}
      <div className="mb-6 bg-[#eef2eb] rounded-lg py-3 px-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#5c6d5e]">Progress:</span>
          <span className="text-sm font-medium text-[#2c3e2d]">
            {getAnsweredCount} of {quiz.questions.length} answered
          </span>
        </div>
        <div className="w-full bg-[#dce4d7] rounded-full h-2">
          <div 
            className="bg-[#4a7c59] h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${quiz.questions.length > 0 ? (getAnsweredCount / quiz.questions.length) * 100 : 0}%` 
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, qIndex) => (
          <QuizQuestion
            key={question.id}
            question={question}
            qIndex={qIndex}
            selectedAnswer={selectedAnswers[question.id]}
            onSelectAnswer={onSelectAnswer}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          className="border-[#4a7c59] text-[#4a7c59]"
          onClick={onBack}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Module
        </Button>
        <Button
          className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
          onClick={onSubmitQuiz}
          disabled={!isAllAnswered}
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  )
})

const QuizQuestion = memo(function QuizQuestion({ question, qIndex, selectedAnswer, onSelectAnswer }) {
  const questionId = question._id || question.id
  const questionType = question.type

  return (
    <div className="rounded-lg border border-[#dce4d7] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-medium text-[#2c3e2d] flex-1 pr-3">
          <span className="mr-2 font-bold text-[#4a7c59]">{qIndex + 1}.</span>
          {question.question}
        </h3>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium italic text-[#5c6d5e]">
            {question.points || 1} {question.points === 1 ? 'point' : 'points'}
          </span>
        </div>
      </div>
      
      {questionType === "multiple_choice" && (
        <MultipleChoiceQuestion
          question={question}
          questionId={questionId}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={onSelectAnswer}
        />
      )}

      {questionType === "fill_in_blanks" && (
        <div>
          <p className="text-sm text-[#5c6d5e] mb-2 italic">Complete the sentence:</p>
          <FillInBlanksQuestion
            question={question}
            questionId={questionId}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={onSelectAnswer}
          />
        </div>
      )}

      {questionType === "matching" && (
        <div>
          <p className="text-sm text-[#5c6d5e] mb-2 italic">Match the items:</p>
          <MatchingQuestion
            question={question}
            questionId={questionId}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={onSelectAnswer}
          />
        </div>
      )}

      {!["multiple_choice", "fill_in_blanks", "matching"].includes(questionType) && (
        <div className="text-red-500 text-xs p-3 bg-red-50 rounded">
          <p>Unknown question type: "{questionType}"</p>
        </div>
      )}
    </div>
  )
})

const MultipleChoiceQuestion = memo(function MultipleChoiceQuestion({ question, questionId, selectedAnswer, onSelectAnswer }) {
  const handleOptionClick = useCallback((optionIndex) => {
    onSelectAnswer(questionId, optionIndex)
  }, [questionId, onSelectAnswer])

  const options = question.options || []

  if (options.length === 0) {
    return (
      <div className="text-red-500 text-xs p-3 bg-red-50 rounded">
        <p>This multiple choice question has no options configured.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {options.map((option, oIndex) => {
        const optionText = typeof option === 'string' ? option : (option.text || option)
        
        return (
          <div
            key={oIndex}
            className={`cursor-pointer rounded-md border p-3 transition-colors ${
              selectedAnswer === oIndex
                ? "border-[#4a7c59] bg-[#eef2eb]"
                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
            }`}
            onClick={() => handleOptionClick(oIndex)}
          >
            <div className="flex items-center">
              <div
                className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border text-sm ${
                  selectedAnswer === oIndex
                    ? "border-[#4a7c59] bg-[#4a7c59] text-white"
                    : "border-[#dce4d7]"
                }`}
              >
                {String.fromCharCode(65 + oIndex)}
              </div>
              <span className="text-[#2c3e2d]">{optionText}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})

const FillInBlanksQuestion = memo(function FillInBlanksQuestion({ question, questionId, selectedAnswer, onSelectAnswer }) {
  const handleBlankChange = useCallback((blankIndex, value) => {
    const newAnswer = { ...(selectedAnswer || {}) }
    newAnswer[blankIndex] = value
    onSelectAnswer(questionId, newAnswer)
  }, [questionId, selectedAnswer, onSelectAnswer])

  const renderQuestionWithBlanks = () => {
    const parts = question.question.split('___')
    const elements = []
    
    parts.forEach((part, index) => {
      elements.push(
        <span key={`text-${index}`} className="text-[#2c3e2d]">
          {part}
        </span>
      )
      
      if (index < parts.length - 1) {
        elements.push(
          <input
            key={`blank-${index}`}
            type="text"
            placeholder="fill in"
            value={selectedAnswer?.[index] || ''}
            onChange={(e) => handleBlankChange(index, e.target.value)}
            className="mx-1 px-2 py-1 border-b border-[#4a7c59] bg-transparent focus:outline-none focus:border-[#2c3e2d] w-28 text-center"
          />
        )
      }
    })
    
    return elements
  }

  return (
    <div className="bg-[#f8f7f4] p-3 rounded border border-[#dce4d7]">
      <p className="leading-relaxed">
        {renderQuestionWithBlanks()}
      </p>
    </div>
  )
})

const MatchingQuestion = memo(function MatchingQuestion({ question, questionId, selectedAnswer, onSelectAnswer }) {
  const handleMatchingAnswer = useCallback((leftId, rightValue) => {
    const newAnswer = { ...(selectedAnswer || {}) }
    newAnswer[leftId] = rightValue
    onSelectAnswer(questionId, newAnswer)
  }, [questionId, selectedAnswer, onSelectAnswer])

  if (!question.pairs || question.pairs.length === 0) {
    return (
      <div className="text-red-500 text-xs">
        No matching pairs available for this question.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-[#2c3e2d] text-center">Items</h4>
          {question.pairs.map((pair, index) => (
            <div
              key={index}
              className="p-3 border border-[#dce4d7] rounded text-center font-medium text-lg bg-white h-[48px] flex items-center justify-center"
            >
              {pair.left}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-[#2c3e2d] text-center">Match with</h4>
          {question.pairs.map((pair, index) => (
            <select
              key={index}
              value={selectedAnswer?.[index] || ""}
              onChange={(e) => handleMatchingAnswer(index, e.target.value)}
              className="w-full p-3 border border-[#dce4d7] rounded focus:ring-1 focus:ring-[#4a7c59] focus:border-[#4a7c59] bg-white text-center h-[48px] flex items-center justify-center"
            >
              <option value="">Select match...</option>
              {question.pairs.map((p, pIndex) => (
                <option key={pIndex} value={p.right}>
                  {p.right}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
    </div>
  )
})

export default QuizSection