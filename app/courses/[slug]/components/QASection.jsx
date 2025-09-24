import { memo, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  MessageCircle, 
  Edit, 
  Trash2, 
  User, 
  Heart, 
  AlertTriangle, 
  X, 
  Lock,
  ThumbsUp,
  Reply,
  Pin,
  PinOff,
  Eye,
  Send,
  Loader2,
  ChevronDown
} from "lucide-react"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"

export const QASection = memo(function QASection({
  qaState,
  isLoggedIn,
  onSubmitQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
  onToggleForm,
  onSubmitComment,
  onDeleteComment,
  onUpdateComment,
  onToggleLike,
  onLoadMore,
  isEnrolled = false,
  userRole = 'student',
  courseData = null
}) {
  const {
    questions,
    loading,
    loadingMore,
    totalQuestions,
    hasMore,
    userHasAsked,
    showForm,
    submitting,
    newQuestion
  } = qaState

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editingComment, setEditingComment] = useState(null)
  const [commentText, setCommentText] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  const handleQuestionChange = useCallback((e) => {
    onUpdateQuestion({ question: e.target.value })
  }, [onUpdateQuestion])

  const handleAskQuestionClick = useCallback(() => {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    
    if (!isEnrolled) {
      return
    }
    
    onToggleForm(true)
  }, [isLoggedIn, isEnrolled, onToggleForm])

  const handleShowForm = useCallback(() => {
    handleAskQuestionClick()
  }, [handleAskQuestionClick])

  const handleCancelForm = useCallback(() => {
    onToggleForm(false)
    onUpdateQuestion({ question: "" })
  }, [onToggleForm, onUpdateQuestion])

  const handleEnrollClick = useCallback(() => {
    if (!courseData) return
    
    fetch('/api/courses/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: courseData?.id,
        title: courseData?.title || 'Course Enrollment',
        description: courseData?.description || courseData?.fullDescription || 'Full course access',
        price: Number(courseData?.price) || 0,
        thumbnail: courseData?.thumbnail || '',
      }),
    }).then(response => response.json())
    .then(data => {
      if (data.url) {
        window.location.assign(data.url);
      }
    }).catch(console.error);
  }, [courseData])
  
  const handleDeleteClick = useCallback((type, id, commentId = null) => {
    setDeleteTarget({ type, id, commentId })
    setShowDeleteConfirm(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget?.type === 'question') {
      onDeleteQuestion(deleteTarget.id)
    } else if (deleteTarget?.type === 'comment') {
      onDeleteComment(deleteTarget.id, deleteTarget.commentId)
    }
    setShowDeleteConfirm(false)
    setDeleteTarget(null)
  }, [deleteTarget, onDeleteQuestion, onDeleteComment])

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false)
    setDeleteTarget(null)
  }, [])

  const handleSubmitComment = useCallback((questionId) => {
    console.log('🔍 handleSubmitComment called:', { questionId, commentText: commentText.trim() });
    
    if (commentText.trim()) {
      onSubmitComment(questionId, commentText.trim());
      setCommentText("");
      setReplyingTo(null);
    } else {
      console.log('❌ Comment text is empty');
      alert('Please enter a comment before submitting');
    }
  }, [commentText, onSubmitComment])

  const handleEditComment = useCallback((comment) => {
    setEditingComment(comment._id)
    setCommentText(comment.comment)
  }, [])

  const handleUpdateComment = useCallback((questionId, commentId) => {
    if (commentText.trim()) {
      onUpdateComment(questionId, commentId, commentText.trim())
      setEditingComment(null)
      setCommentText("")
    }
  }, [commentText, onUpdateComment])

  const handleCancelEdit = useCallback(() => {
    setEditingComment(null)
    setCommentText("")
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      onLoadMore()
    }
  }, [loadingMore, hasMore, onLoadMore])

  const sortedQuestions = useMemo(() => {
    if (!questions) return []
    
    const sorted = [...questions]
    
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case 'most_liked':
        return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      case 'most_answers':
        return sorted.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }, [questions, sortBy])
  

  return (
    <>
      {isLoggedIn && isEnrolled ? (
        <div className="mt-4 rounded-lg border border-[#dce4d7] bg-white shadow-sm p-4">
          <QAHeader
            totalQuestions={totalQuestions}
            loadedQuestions={questions.length}
            isLoggedIn={isLoggedIn}
            userHasAsked={userHasAsked}
            showForm={showForm}
            onShowForm={handleShowForm}
            onAskQuestion={handleAskQuestionClick}
            isEnrolled={isEnrolled}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {showForm && (
            <QuestionForm
              newQuestion={newQuestion}
              submitting={submitting}
              onQuestionChange={handleQuestionChange}
              onSubmitQuestion={onSubmitQuestion}
              onCancelQuestion={handleCancelForm}
            />
          )}

          <>
            <QuestionsList 
              questions={sortedQuestions} 
              loading={loading}
              isLoggedIn={isLoggedIn}
              isEnrolled={isEnrolled}
              userRole={userRole}
              onDeleteQuestion={(id) => handleDeleteClick('question', id)}
              onToggleLike={onToggleLike}
              onSubmitComment={handleSubmitComment}
              onDeleteComment={(questionId, commentId) => handleDeleteClick('comment', questionId, commentId)}
              onEditComment={handleEditComment}
              onUpdateComment={handleUpdateComment}
              onCancelEdit={handleCancelEdit}
              editingComment={editingComment}
              commentText={commentText}
              setCommentText={setCommentText}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
            />

            {!loading && questions.length > 0 && hasMore && (
              <div className="mt-6 text-center border-t border-[#dce4d7] pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] w-full sm:w-auto"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more questions...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Load More Questions
                    </>
                  )}
                </Button>
                <p className="text-xs text-[#5c6d5e] mt-2">
                  Showing {questions.length} of {totalQuestions} questions
                </p>
              </div>
            )}

            {!loading && questions.length > 0 && !hasMore && (
              <div className="mt-6 text-center border-t border-[#dce4d7] pt-6">
                <p className="text-xs text-[#5c6d5e] mt-1">
                  All questions loaded
                </p>
              </div>
            )}
          </>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm text-center">
          <div className="text-[#5c6d5e] mb-4">
            <p className="text-lg font-medium text-[#2c3e2d] mb-2">
              Join the Discussion
            </p>
            <p className="text-sm">
              Enroll in this course to access student discussions and ask questions
            </p>
          </div>
          <button 
            onClick={!isLoggedIn ? () => window.location.href = '/auth/login' : handleEnrollClick}
            className="bg-[#4a7c59] text-white px-6 py-2 rounded-lg hover:bg-[#3a6147] transition-colors"
          >
            {!isLoggedIn ? "Log In to Continue" : `Enroll Now`}
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          type={deleteTarget?.type}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  )
})

const QAHeader = memo(function QAHeader({
  totalQuestions,
  loadedQuestions,
  isLoggedIn,
  userHasAsked,
  showForm,
  onShowForm,
  onAskQuestion,
  isEnrolled,
  sortBy,
  onSortChange
}) {
  return (
    <div className="border-b border-[#dce4d7] pb-4">
      <div className="flex items-center justify-between flex-col sm:flex-row">
        <div className="flex w-full sm:w-max justify-between gap-4 min-w-0 pb-4 sm:pb-0"> 
          <h3 className="text-sm sm:text-base font-medium text-[#2c3e2d]">Questions & Answers</h3>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm text-[#5c6d5e] whitespace-nowrap">
              {loadedQuestions > 0 && loadedQuestions !== totalQuestions 
                ? `${loadedQuestions} of ${totalQuestions} questions`
                : `${totalQuestions} questions`
              }
            </span>
          </div>
        </div>
        
        {isLoggedIn && isEnrolled && !showForm && (
          <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto border-[#4a7c59] text-[#4a7c59]"
              onClick={onAskQuestion}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Ask a Question
            </Button>
          </div>
        )}
      </div>

      {totalQuestions > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm border border-[#dce4d7] rounded px-2 py-1 bg-white focus:outline-none focus:border-[#4a7c59] w-full sm:w-auto"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most_liked">Most liked</option>
            <option value="most_answers">Most answers</option>
          </select>
        </div>
      )}
    </div>
  )
})

const DeleteConfirmationModal = memo(function DeleteConfirmationModal({
  type,
  onConfirm,
  onCancel
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-[#2c3e2d]">
            Delete {type === 'question' ? 'Question' : 'Comment'}
          </h3>
        </div>
        
        <p className="text-[#5c6d5e] mb-6">
          Are you sure you want to delete this {type}? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-[#dce4d7] text-[#5c6d5e]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Delete {type === 'question' ? 'Question' : 'Comment'}
          </Button>
        </div>
      </div>
    </div>
  )
})

const QuestionForm = memo(function QuestionForm({
  newQuestion,
  submitting,
  onQuestionChange,
  onSubmitQuestion,
  onCancelQuestion
}) {
  const canSubmit = useMemo(() => 
    newQuestion.question.trim() !== "" && !submitting,
    [newQuestion.question, submitting]
  )

  return (
    <div className="border-b border-[#dce4d7] py-4">
      <h4 className="mb-3 font-medium text-[#2c3e2d]">Ask a Question</h4>
      
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-[#2c3e2d]">
          Your Question *
        </label>
        <textarea
          className="w-full rounded-md border border-[#dce4d7] p-3 text-sm focus:border-[#4a7c59] focus:outline-none focus:ring-1 focus:ring-[#4a7c59] resize-none"
          rows="4"
          placeholder="Ask anything about this course..."
          value={newQuestion.question}
          onChange={onQuestionChange}
          disabled={submitting}
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-[#5c6d5e]">
          {newQuestion.question.length}/1000 characters
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="sm"
          className="bg-[#4a7c59] text-white hover:bg-[#3a6147] w-full sm:w-auto"
          onClick={onSubmitQuestion}
          disabled={!canSubmit}
        >
          {submitting ? "Posting..." : "Post Question"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#4a7c59] text-[#4a7c59] w-full sm:w-auto"
          onClick={onCancelQuestion}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
})

const QuestionsList = memo(function QuestionsList({ 
  questions, 
  loading,
  isLoggedIn,
  isEnrolled,
  userRole,
  onDeleteQuestion,
  onToggleLike,
  onSubmitComment,
  onDeleteComment,
  onEditComment,
  onUpdateComment,
  onCancelEdit,
  editingComment,
  commentText,
  setCommentText,
  replyingTo,
  setReplyingTo
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a7c59] mx-auto mb-3"></div>
        <p className="text-[#5c6d5e]">Loading questions...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="mx-auto mb-3 h-12 w-12 text-[#5c6d5e]" />
        <p className="text-[#5c6d5e]">No questions yet. Be the first to ask!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-4">
      {questions.map((question) => (
        <QuestionItem 
          key={question.id} 
          question={question}
          isLoggedIn={isLoggedIn}
          isEnrolled={isEnrolled}
          userRole={userRole}
          onDeleteQuestion={onDeleteQuestion}
          onToggleLike={onToggleLike}
          onSubmitComment={onSubmitComment}
          onDeleteComment={onDeleteComment}
          onEditComment={onEditComment}
          onUpdateComment={onUpdateComment}
          onCancelEdit={onCancelEdit}
          editingComment={editingComment}
          commentText={commentText}
          setCommentText={setCommentText}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
        />
      ))}
    </div>
  )
})

const QuestionItem = memo(function QuestionItem({ 
  question,
  isLoggedIn,
  isEnrolled,
  userRole,
  onDeleteQuestion,
  onToggleLike,
  onSubmitComment,
  onDeleteComment,
  onEditComment,
  onUpdateComment,
  onCancelEdit,
  editingComment,
  commentText,
  setCommentText,
  replyingTo,
  setReplyingTo
}) {
  const [imageError, setImageError] = useState(false)
  const [showComments, setShowComments] = useState(true)
  
  const handleImageError = () => {
    setImageError(true)
  }

  const renderAvatar = (user) => {
    if (!user) {
      return (
        <div className="h-10 w-10 rounded-full border border-[#4a7c59] bg-gray-200 flex items-center justify-center">
          <User className="h-5 w-5 text-gray-500" />
        </div>
      )
    }
    
    if (user.icon && !imageError) {
      if (user.icon === 'bonsai') {
        return (
          <div className="h-10 w-10 rounded-full border border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden">
            <BonsaiSVG 
              level={user.bonsai?.level || 1}
              treeColor={user.bonsai?.customization?.foliageColor || '#77DD82'} 
              potColor={user.bonsai?.customization?.potColor || '#FD9475'} 
              selectedEyes={user.bonsai?.customization?.eyes || 'default_eyes'}
              selectedMouth={user.bonsai?.customization?.mouth || 'default_mouth'}
              selectedPotStyle={user.bonsai?.customization?.potStyle || 'default_pot'}
              selectedGroundStyle={user.bonsai?.customization?.groundStyle || 'default_ground'}
              decorations={user.bonsai?.customization?.decorations ? Object.values(user.bonsai.customization.decorations).filter(Boolean) : []}
              zoomed={true}
              profileIcon={true}
            />
          </div>
        )
      } else if (user.icon.startsWith('http')) {
        return (
          <img
            src={user.icon}
            alt={user.name}
            className="h-10 w-10 rounded-full border border-[#4a7c59] object-cover"
            onError={handleImageError}
          />
        )
      } else {
        return (
          <div className="h-10 w-10 rounded-full border border-[#4a7c59] bg-gray-100 flex items-center justify-center">
            <span className="text-2xl">{user.icon}</span>
          </div>
        )
      }
    } else {
      return (
        <div className="h-10 w-10 rounded-full border border-[#4a7c59] bg-gray-200 flex items-center justify-center">
          <User className="h-5 w-5 text-gray-500" />
        </div>
      )
    }
  }

  return (
    <div className="border-b border-[#dce4d7] pb-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {renderAvatar(question.user)}
        </div>

        <div className="flex-1 min-w-0"> {/* FIXED: Added min-w-0 for proper flex shrinking */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0"> {/* FIXED: Added min-w-0 */}
              <h5 className="font-medium text-[#2c3e2d] truncate">{question.user?.name || 'Anonymous'}</h5> {/* FIXED: Added truncate */}
              {question.isPinned && (
                <Pin className="h-4 w-4 text-[#4a7c59] flex-shrink-0" />
              )}
              {question.isAnswered && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                  Answered
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5c6d5e] whitespace-nowrap">{question.createdAt}</span>
              </div>
            </div>
            {question.user?.email === question.currentUserEmail && (
              <div className="flex items-center gap-2 flex-shrink-0"> {/* FIXED: Added flex-shrink-0 */}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => onDeleteQuestion(question.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* FIXED: Question Content with proper text wrapping */}
          <p className="text-sm text-[#5c6d5e] mb-2 leading-relaxed break-words overflow-wrap-anywhere">
            {question.question}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm mb-4">
            <button
              className={`flex items-center gap-1 transition-colors ${
                question.isLiked 
                  ? "text-[#4a7c59]" 
                  : "text-[#5c6d5e] hover:text-[#4a7c59]"
              }`}
              onClick={() => onToggleLike('question', question.id)}
              disabled={!isLoggedIn}
            >
              <ThumbsUp className={`h-4 w-4 ${question.isLiked ? "fill-current" : ""}`} />
              <span>{question.likeCount || 0}</span>
            </button>

            <button
              className="flex items-center gap-1 text-[#5c6d5e] hover:text-[#4a7c59] transition-colors"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{question.comments?.length || 0} answers</span>
            </button>

            {isLoggedIn && isEnrolled && (
              <button
                className="flex items-center gap-1 text-[#5c6d5e] hover:text-[#4a7c59] transition-colors"
                onClick={() => setReplyingTo(replyingTo === question.id ? null : question.id)}
              >
                <Reply className="h-4 w-4" />
                <span>Answer</span>
              </button>
            )}
          </div>

          {replyingTo === question.id && isLoggedIn && isEnrolled && (
            <div className="mb-2 bg-white border border-[#dce4d7] rounded-lg p-2">
              <textarea
                className="w-full border border-[#dce4d7] rounded p-2 text-sm focus:border-[#4a7c59] focus:outline-none resize-none"
                rows="3"
                placeholder="Write your answer..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-2">
                <span className="text-xs text-[#5c6d5e]">{commentText.length}/500</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    className="bg-[#4a7c59] text-white hover:bg-[#3a6147] w-full sm:w-auto"
                    onClick={() => onSubmitComment(question.id)}
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Post Answer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setReplyingTo(null)
                      setCommentText("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showComments && question.comments && question.comments.length > 0 && (
            <div className="space-y-3 ml-0">
              {question.comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  questionId={question.id}
                  isLoggedIn={isLoggedIn}
                  userRole={userRole}
                  onDeleteComment={onDeleteComment}
                  onEditComment={onEditComment}
                  onUpdateComment={onUpdateComment}
                  onCancelEdit={onCancelEdit}
                  onToggleLike={onToggleLike}
                  editingComment={editingComment}
                  commentText={commentText}
                  setCommentText={setCommentText}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

const CommentItem = memo(function CommentItem({
  comment,
  questionId,
  isLoggedIn,
  userRole,
  onDeleteComment,
  onEditComment,
  onUpdateComment,
  onCancelEdit,
  onToggleLike,
  editingComment,
  commentText,
  setCommentText
}) {
  const [imageError, setImageError] = useState(false)
  
  const handleImageError = () => {
    setImageError(true)
  }

  const renderAvatar = (user) => {
    if (!user) {
      return (
        <div className="h-8 w-8 rounded-full border border-[#4a7c59] bg-gray-200 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      )
    }
    
    if (user.icon && !imageError) {
      if (user.icon === 'bonsai') {
        return (
          <div className="h-8 w-8 rounded-full border border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden">
            <BonsaiSVG 
              level={user.bonsai?.level || 1}
              treeColor={user.bonsai?.customization?.foliageColor || '#77DD82'} 
              potColor={user.bonsai?.customization?.potColor || '#FD9475'} 
              selectedEyes={user.bonsai?.customization?.eyes || 'default_eyes'}
              selectedMouth={user.bonsai?.customization?.mouth || 'default_mouth'}
              selectedPotStyle={user.bonsai?.customization?.potStyle || 'default_pot'}
              selectedGroundStyle={user.bonsai?.customization?.groundStyle || 'default_ground'}
              decorations={user.bonsai?.customization?.decorations ? Object.values(user.bonsai.customization.decorations).filter(Boolean) : []}
              zoomed={true}
              profileIcon={true}
            />
          </div>
        )
      } else if (user.icon.startsWith('http')) {
        return (
          <img
            src={user.icon}
            alt={user.name}
            className="h-8 w-8 rounded-full border border-[#4a7c59] object-cover"
            onError={handleImageError}
          />
        )
      } else {
        return (
          <div className="h-8 w-8 rounded-full border border-[#4a7c59] bg-gray-100 flex items-center justify-center">
            <span className="text-lg">{user.icon}</span>
          </div>
        )
      }
    } else {
      return (
        <div className="h-8 w-8 rounded-full border border-[#4a7c59] bg-gray-200 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      )
    }
  }

  return (
    <div className="border-b border-[#dce4d7] pb-2 last:border-b-0 last:pb-0 pl-0">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {renderAvatar(comment.user)}
        </div>

        <div className="flex-1 min-w-0"> {/* FIXED: Added min-w-0 for proper flex shrinking */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
            <div className="flex flex-wrap items-center gap-2 min-w-0"> {/* FIXED: Added min-w-0 */}
              <h6 className="font-medium text-[#2c3e2d] text-sm truncate">{comment.user?.name || 'Anonymous'}</h6> {/* FIXED: Added truncate */}
              {comment.isInstructorReply && (
                <span className="bg-[#4a7c59] text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                  Instructor
                </span>
              )}
              <span className="text-xs text-[#5c6d5e] whitespace-nowrap">{comment.createdAt}</span>
            </div>
            {comment.user?.email === comment.currentUserEmail && (
              <div className="flex gap-1 flex-shrink-0 self-start sm:self-auto"> {/* FIXED: Added flex-shrink-0 */}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
                  onClick={() => onEditComment(comment)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0 border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => onDeleteComment(questionId, comment._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {editingComment === comment._id ? (
            <div className="space-y-1">
              <textarea
                className="w-full border border-[#dce4d7] rounded p-2 text-sm focus:border-[#4a7c59] focus:outline-none resize-none"
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-xs text-[#5c6d5e]">{commentText.length}/500</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    className="bg-[#4a7c59] text-white hover:bg-[#3a6147] w-full sm:w-auto"
                    onClick={() => onUpdateComment(questionId, comment._id)}
                    disabled={!commentText.trim()}
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* FIXED: Comment Content with proper text wrapping */}
              <p className="text-sm text-[#5c6d5e] mb-1 leading-relaxed break-words overflow-wrap-anywhere">
                {comment.comment}
              </p>
              
              <div className="flex items-center gap-4 text-sm mb-2">
                <button
                  className={`flex items-center gap-1 transition-colors ${
                    comment.isLiked 
                      ? "text-[#4a7c59]" 
                      : "text-[#5c6d5e] hover:text-[#4a7c59]"
                  }`}
                  onClick={() => onToggleLike('comment', questionId, comment._id)}
                  disabled={!isLoggedIn}
                >
                  <ThumbsUp className={`h-3 w-3 ${comment.isLiked ? "fill-current" : ""}`} />
                  <span>{comment.likeCount || 0}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

// Export as default
export default QASection