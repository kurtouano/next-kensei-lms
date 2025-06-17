// components/Quiz.jsx - Enhanced with answer review and improved retake logic
import { memo, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, AlertCircle, ChevronLeft, RotateCcw, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"

export const QuizSection = memo(function QuizSection({
  quiz,
  quizState,
  onStartQuiz,
  onSelectAnswer,
  onSubmitQuiz,
  onRetryQuiz,
  onProceed,
  onBack,
  isLastModule,
  existingScore = null // Add existing score prop
}) {
  const { started, completed, score, selectedAnswers, showReview } = quizState
  const [showAnswerReview, setShowAnswerReview] = useState(false)

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

  const toggleAnswerReview = useCallback(() => {
    setShowAnswerReview(prev => !prev)
  }, [])

  if (!started) {
    return (
      <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm text-center">
        <BookOpen className="mx-auto mb-4 h-16 w-16 text-[#4a7c59]" />
        <h2 className="mb-2 text-2xl font-bold text-[#2c3e2d]">{quiz?.title}</h2>
        <p className="mb-4 text-[#5c6d5e]">
          Complete this quiz with a score of 70% or higher to proceed.
        </p>
        {existingScore && existingScore >= 70 && (
          <div className="mb-4 p-3 bg-[#eef2eb] rounded-lg border border-[#4a7c59]">
            <p className="text-sm text-[#2c3e2d]">
              Your current best score: <span className="font-bold text-[#4a7c59]">{existingScore}%</span>
            </p>
            <p className="text-xs text-[#5c6d5e] mt-1">
              You can retake this quiz to improve your score. Only higher scores will be saved.
            </p>
          </div>
        )}
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
            {existingScore && existingScore >= 70 ? "Retake Quiz" : "Start Quiz"}
          </Button>
        </div>
      </div>
    )
  }

  if (completed) {
    const isPassed = score >= 70
    const isImprovement = existingScore && score > existingScore
    const canProceed = score >= 70 || (existingScore && existingScore >= 70)
    
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
        
        {/* Score status messages */}
        {isPassed && isImprovement && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">🎉 New Best Score!</p>
            <p className="text-sm text-green-600">
              Improved from {existingScore}% to {score}%
            </p>
          </div>
        )}
        
        {isPassed && existingScore && !isImprovement && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 font-medium">Good job!</p>
            <p className="text-sm text-blue-600">
              Your best score remains {Math.max(existingScore, score)}%
            </p>
          </div>
        )}
        
        {!isPassed && existingScore && existingScore >= 70 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 font-medium">You can still proceed</p>
            <p className="text-sm text-yellow-600">
              Your previous score of {existingScore}% allows you to continue
            </p>
          </div>
        )}

        <p className="mb-4 text-[#5c6d5e]">
          {isPassed
            ? "Congratulations! You've passed the quiz."
            : canProceed
              ? "You didn't improve your score this time, but you can still proceed."
              : "You need to score at least 70% to proceed. Don't worry, you can try again!"}
        </p>

        {/* Answer Review Section */}
        <div className="mb-6">
          <Button
            variant="outline"
            className="border-[#4a7c59] text-[#4a7c59] mb-4"
            onClick={toggleAnswerReview}
          >
            {showAnswerReview ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Answer Review
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Review Answers
              </>
            )}
          </Button>

          {showAnswerReview && (
            <AnswerReview 
              quiz={quiz} 
              selectedAnswers={selectedAnswers}
            />
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-[#4a7c59] text-[#4a7c59]"
            onClick={onBack}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Module
          </Button>
          
          {canProceed ? (
            <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={onProceed}>
              {isLastModule ? "Complete Course" : "Next Module"}
            </Button>
          ) : (
            <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={onRetryQuiz}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Retry Quiz
            </Button>
          )}
          
          {/* Always show retry option */}
          {canProceed && (
            <Button 
              variant="outline"
              className="border-[#4a7c59] text-[#4a7c59]" 
              onClick={onRetryQuiz}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Try Again
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
        <div className="flex items-center gap-3 w-full">
          <span className="text-sm text-[#5c6d5e] whitespace-nowrap">Progress:</span>
          {/* Progress bar container */}
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#4a7c59] h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${quiz.questions.length > 0 ? (getAnsweredCount / quiz.questions.length) * 100 : 0}%` 
              }}
            />
          </div>
          <span className="text-sm font-medium text-[#2c3e2d] whitespace-nowrap">
            {getAnsweredCount} of {quiz.questions.length} answered
          </span>
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

// Answer Review Component
const AnswerReview = memo(function AnswerReview({ quiz, selectedAnswers }) {
  const getQuestionResult = useCallback((question) => {
    const questionId = question._id || question.id
    const userAnswer = selectedAnswers[questionId]
    
    switch (question.type) {
      case "multiple_choice":
        const correctIndex = question.correctAnswer !== undefined 
          ? question.correctAnswer 
          : question.options.findIndex(opt => opt.isCorrect)
        
        return {
          isCorrect: userAnswer === correctIndex,
          userAnswer: userAnswer !== undefined ? question.options[userAnswer] : "No answer",
          correctAnswer: question.options[correctIndex],
          correctIndex
        }

      case "fill_in_blanks":
        if (!question.blanks || typeof userAnswer !== 'object') {
          return { isCorrect: false, userAnswer: "No answer", correctAnswer: "Multiple blanks" }
        }
        
        let correctBlanks = 0
        const totalBlanks = question.blanks.length
        const blankDetails = []
        
        question.blanks.forEach((blank, index) => {
          const userBlankAnswer = userAnswer[index]?.toLowerCase().trim() || ""
          const correctAnswer = blank.answer.toLowerCase().trim()
          const alternatives = blank.alternatives?.map(alt => alt.toLowerCase().trim()) || []
          
          const isBlankCorrect = userBlankAnswer === correctAnswer || alternatives.includes(userBlankAnswer)
          if (isBlankCorrect) correctBlanks++
          
          blankDetails.push({
            blank: index + 1,
            userAnswer: userAnswer[index] || "No answer",
            correctAnswer: blank.answer,
            isCorrect: isBlankCorrect,
            alternatives: blank.alternatives || []
          })
        })
        
        return {
          isCorrect: correctBlanks === totalBlanks,
          partialCredit: correctBlanks > 0,
          score: `${correctBlanks}/${totalBlanks}`,
          details: blankDetails
        }

      case "matching":
        if (!question.pairs || typeof userAnswer !== 'object') {
          return { isCorrect: false, userAnswer: "No answer", correctAnswer: "Multiple pairs" }
        }
        
        let correctMatches = 0
        const totalPairs = question.pairs.length
        const matchingDetails = []
        
        Object.entries(userAnswer).forEach(([leftIndex, selectedRight]) => {
          const leftIndexNum = parseInt(leftIndex)
          const correctRight = question.pairs[leftIndexNum]?.right
          const isMatchCorrect = selectedRight === correctRight
          
          if (isMatchCorrect) correctMatches++
          
          matchingDetails.push({
            left: question.pairs[leftIndexNum]?.left || "Unknown",
            userAnswer: selectedRight || "No answer",
            correctAnswer: correctRight || "Unknown",
            isCorrect: isMatchCorrect
          })
        })
        
        return {
          isCorrect: correctMatches === totalPairs,
          partialCredit: correctMatches > 0,
          score: `${correctMatches}/${totalPairs}`,
          details: matchingDetails
        }

      default:
        return { isCorrect: false, userAnswer: "Unknown", correctAnswer: "Unknown" }
    }
  }, [selectedAnswers])

  return (
    <div className="bg-[#f8f7f4] border border-[#dce4d7] rounded-lg p-4 text-left">
      <h3 className="font-semibold text-[#2c3e2d] mb-4 text-center">Answer Review</h3>
      <div className="space-y-4">
        {quiz.questions.map((question, index) => {
          const result = getQuestionResult(question)
          
          return (
            <div
              key={question.id}
              className={`p-4 rounded-lg border-2 ${
                result.isCorrect
                  ? "border-green-300 bg-green-50"
                  : result.partialCredit
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-red-300 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {result.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : result.partialCredit ? (
                    <div className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-[#2c3e2d] mb-2">
                    <span className="text-[#4a7c59] font-bold">{index + 1}.</span> {question.question}
                  </div>
                  
                  {question.type === "multiple_choice" && (
                    <div className="space-y-2 text-sm">
                      <div className={`p-2 rounded ${
                        result.userAnswer === result.correctAnswer 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        <span className="font-medium">Your answer:</span> {result.userAnswer}
                      </div>
                      {result.userAnswer !== result.correctAnswer && (
                        <div className="p-2 rounded bg-green-100 text-green-800">
                          <span className="font-medium">Correct answer:</span> {result.correctAnswer}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {question.type === "fill_in_blanks" && result.details && (
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-[#2c3e2d]">
                        Score: {result.score} 
                        {result.partialCredit && !result.isCorrect && " (Partial Credit)"}
                      </div>
                      {result.details.map((detail, i) => (
                        <div key={i} className={`p-2 rounded ${
                          detail.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          <span className="font-medium">Blank {detail.blank}:</span> {detail.userAnswer}
                          {!detail.isCorrect && (
                            <div className="mt-1">
                              <span className="font-medium">Correct:</span> {detail.correctAnswer}
                              {detail.alternatives.length > 0 && (
                                <span className="text-xs"> (or: {detail.alternatives.join(", ")})</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === "matching" && result.details && (
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-[#2c3e2d]">
                        Score: {result.score}
                        {result.partialCredit && !result.isCorrect && " (Partial Credit)"}
                      </div>
                      {result.details.map((detail, i) => (
                        <div key={i} className={`p-2 rounded ${
                          detail.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          <div>
                            <span className="font-medium">{detail.left}</span> → {detail.userAnswer}
                          </div>
                          {!detail.isCorrect && (
                            <div className="mt-1 text-xs">
                              <span className="font-medium">Should be:</span> {detail.correctAnswer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-[#5c6d5e]">
                    Points: {question.points || 1}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

// Existing QuizQuestion components...
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
          <p className="text-sm text-[#5c6d5e] mb-2 italic">Fill in the blanks:</p>
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
            className="mx-1 px-2 border-b-[2px] border-[#4a7c59] bg-transparent focus:outline-none focus:border-[#2c3e2d] w-32 text-center"
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

  // Randomize the right-side options
  const shuffledRightOptions = useMemo(() => {
    if (!question.pairs || question.pairs.length === 0) return []
    
    // Extract all right-side values and shuffle them
    const rightValues = question.pairs.map(pair => pair.right)
    const shuffled = [...rightValues]
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled
  }, [question.pairs])

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
              className="p-3 border-[1.5px] border-[#dce4d7] rounded-md text-center font-medium text-lg bg-white h-[48px] hover:border-[#4a7c59] flex items-center justify-center transition-all"
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
              className="w-full p-3 border-[1.5px] border-[#dce4d7] rounded-md focus:outline-none hover:border-[#4a7c59]  bg-white text-center h-[48px] flex items-center justify-center"
            >
              <option value="">Select match...</option>
              {shuffledRightOptions.map((rightValue, optionIndex) => (
                <option key={optionIndex} value={rightValue}>
                  {rightValue}
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