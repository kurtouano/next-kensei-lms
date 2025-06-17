// hooks/useModules.js - Enhanced version with multiple question types
import { useState, useCallback, useMemo } from "react"

// Default module structure
const createDefaultModule = (order) => ({
  title: "",
  order,
  lessons: [createDefaultLesson(1)],
  quiz: createDefaultQuiz(),
})

// Default lesson structure
const createDefaultLesson = (order) => ({
  title: "",
  order,
  videoUrl: "",
  videoDuration: 0,
  resources: [{ title: "", fileUrl: ""}],
  isPublished: false,
})

// Default quiz structure
const createDefaultQuiz = () => ({
  title: "",
  questions: [createDefaultQuestion()],
})

// Enhanced default question structure with support for multiple types
const createDefaultQuestion = (type = "multiple_choice") => {
  const baseQuestion = {
    id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    question: "",
    type,
    points: 1
  }

  switch (type) {
    case "multiple_choice":
      return {
        ...baseQuestion,
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: true },
        ],
      }
    
    case "fill_in_blanks":
      return {
        ...baseQuestion,
        blanks: [
          { answer: "", alternatives: [""] }
        ],
      }
    
    case "matching":
      return {
        ...baseQuestion,
        pairs: [
          { left: "", right: "", points: 1 },
          { left: "", right: "", points: 1 }
        ],
      }
    
    default:
      return baseQuestion
  }
}

export const useModules = () => {
  const [modules, setModules] = useState([createDefaultModule(1)])

  // Generic modules updater
  const updateModules = useCallback((updater) => {
    setModules(prev => {
      if (typeof updater === 'function') {
        return updater(prev)
      }
      return updater
    })
  }, [])

  // Module handlers
  const addModule = useCallback(() => {
    updateModules(prev => [...prev, createDefaultModule(prev.length + 1)])
  }, [updateModules])

  const updateModule = useCallback((moduleIndex, field, value) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? { ...module, [field]: value } : module
    ))
  }, [updateModules])

  const removeModule = useCallback((moduleIndex) => {
    updateModules(prev => prev.filter((_, i) => i !== moduleIndex))
  }, [updateModules])

  // Lesson handlers
  const addLesson = useCallback((moduleIndex) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: [...module.lessons, createDefaultLesson(module.lessons.length + 1)]
      } : module
    ))
  }, [updateModules])

  const updateLesson = useCallback((moduleIndex, lessonIndex, field, value) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.map((lesson, j) => 
          j === lessonIndex ? { ...lesson, [field]: value } : lesson
        )
      } : module
    ))
  }, [updateModules])

  const removeLesson = useCallback((moduleIndex, lessonIndex) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.filter((_, j) => j !== lessonIndex)
      } : module
    ))
  }, [updateModules])

  // Resource handlers
  const addResource = useCallback((moduleIndex, lessonIndex) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.map((lesson, j) => 
          j === lessonIndex ? {
            ...lesson,
            resources: [...lesson.resources, { title: "", fileUrl: ""}]
          } : lesson
        )
      } : module
    ))
  }, [updateModules])

  const updateResource = useCallback((moduleIndex, lessonIndex, resourceIndex, field, value) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.map((lesson, j) => 
          j === lessonIndex ? {
            ...lesson,
            resources: lesson.resources.map((resource, k) => 
              k === resourceIndex ? { ...resource, [field]: value } : resource
            )
          } : lesson
        )
      } : module
    ))
  }, [updateModules])

  const removeResource = useCallback((moduleIndex, lessonIndex, resourceIndex) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.map((lesson, j) => 
          j === lessonIndex ? {
            ...lesson,
            resources: lesson.resources.filter((_, k) => k !== resourceIndex)
          } : lesson
        )
      } : module
    ))
  }, [updateModules])

  // Enhanced Quiz handlers with support for multiple question types
  const addQuestion = useCallback((moduleIndex, questionType = "multiple_choice") => {
    updateModule(moduleIndex, "quiz", {
      ...modules[moduleIndex].quiz,
      questions: [...modules[moduleIndex].quiz.questions, createDefaultQuestion(questionType)]
    })
  }, [modules, updateModule])

  const updateQuestion = useCallback((moduleIndex, questionIndex, field, value) => {
    const currentQuestion = modules[moduleIndex].quiz.questions[questionIndex]
    
    // Handle question type changes
    if (field === "type" && value !== currentQuestion.type) {
      const newQuestion = createDefaultQuestion(value)
      newQuestion.question = currentQuestion.question
      newQuestion.points = currentQuestion.points
      
      const updatedQuiz = {
        ...modules[moduleIndex].quiz,
        questions: modules[moduleIndex].quiz.questions.map((question, j) =>
          j === questionIndex ? newQuestion : question
        )
      }
      updateModule(moduleIndex, "quiz", updatedQuiz)
      return
    }

    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? { ...question, [field]: value } : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  const updateOption = useCallback((moduleIndex, questionIndex, optionIndex, field, value) => {
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? {
          ...question,
          options: question.options.map((option, k) =>
            k === optionIndex ? { ...option, [field]: value } : option
          )
        } : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  // New handlers for fill-in-the-blanks questions
  const addFillInBlank = useCallback((moduleIndex, questionIndex) => {
    const currentQuestion = modules[moduleIndex].quiz.questions[questionIndex]
    const updatedQuestion = {
      ...currentQuestion,
      blanks: [...(currentQuestion.blanks || []), { answer: "", alternatives: [""] }]
    }
    
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? updatedQuestion : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  const removeFillInBlank = useCallback((moduleIndex, questionIndex, blankIndex) => {
    const currentQuestion = modules[moduleIndex].quiz.questions[questionIndex]
    const updatedQuestion = {
      ...currentQuestion,
      blanks: currentQuestion.blanks.filter((_, k) => k !== blankIndex)
    }
    
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? updatedQuestion : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  const updateFillInBlank = useCallback((moduleIndex, questionIndex, blankIndex, field, value) => {
    const currentQuestion = modules[moduleIndex].quiz.questions[questionIndex]
    const updatedQuestion = {
      ...currentQuestion,
      blanks: currentQuestion.blanks.map((blank, k) =>
        k === blankIndex ? { ...blank, [field]: value } : blank
      )
    }
    
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? updatedQuestion : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  // New handlers for matching questions
  const addMatchingPair = useCallback((moduleIndex, questionIndex) => {
    const currentQuestion = modules[moduleIndex].quiz.questions[questionIndex]
    const updatedQuestion = {
      ...currentQuestion,
      pairs: [...(currentQuestion.pairs || []), { left: "", right: "", points: 1 }]
    }
    
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? updatedQuestion : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  const removeMatchingPair = useCallback((moduleIndex, questionIndex, pairIndex) => {
    const currentQuestion = modules[moduleIndex].quiz.questions[questionIndex]
    const updatedQuestion = {
      ...currentQuestion,
      pairs: currentQuestion.pairs.filter((_, k) => k !== pairIndex)
    }
    
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? updatedQuestion : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  const updateMatchingPair = useCallback((moduleIndex, questionIndex, pairIndex, field, value) => {
    const currentQuestion = modules[moduleIndex].quiz.questions[questionIndex]
    const updatedQuestion = {
      ...currentQuestion,
      pairs: currentQuestion.pairs.map((pair, k) =>
        k === pairIndex ? { ...pair, [field]: value } : pair
      )
    }
    
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? updatedQuestion : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  // Memoized handlers object
  const moduleHandlers = useMemo(() => ({
    // Module handlers
    addModule,
    updateModule,
    removeModule,
    
    // Lesson handlers
    addLesson,
    updateLesson,
    removeLesson,
    
    // Resource handlers
    addResource,
    updateResource,
    removeResource,
    
    // Quiz handlers (enhanced)
    addQuestion,
    updateQuestion,
    updateOption,
    
    // Fill-in-the-blanks handlers
    addFillInBlank,
    removeFillInBlank,
    updateFillInBlank,
    
    // Matching handlers
    addMatchingPair,
    removeMatchingPair,
    updateMatchingPair,
  }), [
    addModule, updateModule, removeModule,
    addLesson, updateLesson, removeLesson,
    addResource, updateResource, removeResource,
    addQuestion, updateQuestion, updateOption,
    addFillInBlank, removeFillInBlank, updateFillInBlank,
    addMatchingPair, removeMatchingPair, updateMatchingPair
  ])

  return {
    modules,
    moduleHandlers
  }
}