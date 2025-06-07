import { memo, useCallback, useMemo } from "react"
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

  const isAllAnswered = useMemo(() => 
    quiz?.questions ? Object.keys(selectedAnswers).length >= quiz.questions.length : false,
    [quiz?.questions, selectedAnswers]
  )

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
      <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">{quiz.title}</h2>
      
      {/* Quiz Progress */}
      <div className="mb-6 bg-[#eef2eb] rounded-lg p-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#5c6d5e]">Progress:</span>
          <span className="font-medium text-[#2c3e2d]">
            {Object.keys(selectedAnswers).length} of {quiz.questions.length} answered
          </span>
        </div>
        <div className="mt-2 bg-white rounded-full h-2">
          <div 
            className="bg-[#4a7c59] h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.keys(selectedAnswers).length / quiz.questions.length) * 100}%` 
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
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

      <div className="mt-8 flex justify-between">
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
          Submit Quiz ({Object.keys(selectedAnswers).length}/{quiz.questions.length})
        </Button>
      </div>
    </div>
  )
})

const QuizQuestion = memo(function QuizQuestion({ question, qIndex, selectedAnswer, onSelectAnswer }) {
  const handleOptionClick = useCallback((optionIndex) => {
    onSelectAnswer(question.id, optionIndex)
  }, [question.id, onSelectAnswer])

  return (
    <div className="rounded-lg border border-[#dce4d7] p-4">
      <h3 className="mb-3 text-lg font-medium text-[#2c3e2d]">
        <span className="mr-2 font-bold">{qIndex + 1}.</span>
        {question.question}
      </h3>
      <div className="space-y-2">
        {question.options.map((option, oIndex) => (
          <QuizOption
            key={oIndex}
            option={option}
            optionIndex={oIndex}
            isSelected={selectedAnswer === oIndex}
            onClick={handleOptionClick}
          />
        ))}
      </div>
    </div>
  )
})

const QuizOption = memo(function QuizOption({ option, optionIndex, isSelected, onClick }) {
  const handleClick = useCallback(() => {
    onClick(optionIndex)
  }, [optionIndex, onClick])

  return (
    <div
      className={`cursor-pointer rounded-md border p-3 transition-colors ${
        isSelected
          ? "border-[#4a7c59] bg-[#eef2eb]"
          : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div
          className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border ${
            isSelected
              ? "border-[#4a7c59] bg-[#4a7c59] text-white"
              : "border-[#dce4d7]"
          }`}
        >
          {String.fromCharCode(65 + optionIndex)}
        </div>
        <span className="text-[#2c3e2d]">{option}</span>
      </div>
    </div>
  )
})

export default QuizSection