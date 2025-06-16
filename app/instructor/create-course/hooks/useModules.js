// hooks/useModules.js
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

// Default question structure
const createDefaultQuestion = () => ({
  question: "",
  options: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: true },
  ],
})

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

  // Quiz handlers
  const addQuestion = useCallback((moduleIndex) => {
    updateModule(moduleIndex, "quiz", {
      ...modules[moduleIndex].quiz,
      questions: [...modules[moduleIndex].quiz.questions, createDefaultQuestion()]
    })
  }, [modules, updateModule])

  const updateQuestion = useCallback((moduleIndex, questionIndex, field, value) => {
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
    
    // Quiz handlers
    addQuestion,
    updateQuestion,
    updateOption,
  }), [
    addModule, updateModule, removeModule,
    addLesson, updateLesson, removeLesson,
    addResource, updateResource, removeResource,
    addQuestion, updateQuestion, updateOption
  ])

  return {
    modules,
    moduleHandlers
  }
}