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
  courseData = null // Add courseData prop for enrollment
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

  // UPDATED: Handle "Ask Question" button click
  const handleAskQuestionClick = useCallback(() => {
    if (!isLoggedIn) {
      // Redirect to login
      window.location.href = '/login'
      return
    }
    
    if (!isEnrolled) {
      // Non-enrolled users see the prompt in place of questions
      return
    }
    
    // User is logged in and enrolled, show the form
    onToggleForm(true)
  }, [isLoggedIn, isEnrolled, onToggleForm])

  const handleShowForm = useCallback(() => {
    handleAskQuestionClick()
  }, [handleAskQuestionClick])

  const handleCancelForm = useCallback(() => {
    onToggleForm(false)
    onUpdateQuestion({ question: "" })
  }, [onToggleForm, onUpdateQuestion])

  // Handle enrollment
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
      {/* Show full Q&A interface only for logged in and enrolled users */}
      {isLoggedIn && isEnrolled ? (
        <div className="mt-4 rounded-lg border border-[#dce4d7] bg-white p-4 shadow-sm">
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

          {/* Show form only if user is logged in AND enrolled */}
          {showForm && (
            <QuestionForm
              newQuestion={newQuestion}
              submitting={submitting}
              onQuestionChange={handleQuestionChange}
              onSubmitQuestion={onSubmitQuestion}
              onCancelQuestion={handleCancelForm}
            />
          )}

          {/* Questions list for enrolled users */}
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

            {/* Load More Button */}
            {!loading && questions.length > 0 && hasMore && (
              <div className="mt-6 text-center border-t border-[#dce4d7] pt-6">
                <Button
                  variant="outline"
                  className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
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

            {/* End of questions message */}
            {!loading && questions.length > 0 && !hasMore && (
              <div className="mt-6 text-center border-t border-[#dce4d7] pt-6">
                <p className="text-sm text-[#5c6d5e]">
                  You've reached the end! 🎉
                </p>
                <p className="text-xs text-[#5c6d5e] mt-1">
                  All {totalQuestions} questions loaded
                </p>
              </div>
            )}
          </>
        </div>
      ) : (
        /* Clean enrollment prompt for non-enrolled users - matches your design */
        <div className="mt-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm text-center">
          <div className="text-[#5c6d5e] mb-4">
            <p className="text-lg font-medium text-[#2c3e2d] mb-2">
              Join the Discussion
            </p>
            <p className="text-sm">
              {!isLoggedIn 
                ? "Log in to view and participate in course discussions"
                : "Enroll in this course to access student discussions and ask questions"
              }
            </p>
          </div>
          <button 
            onClick={!isLoggedIn ? () => window.location.href = '/login' : handleEnrollClick}
            className="bg-[#4a7c59] text-white px-6 py-2 rounded-lg hover:bg-[#3a6147] transition-colors"
          >
            {!isLoggedIn ? "Log In to Continue" : `Enroll Now`}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-[#2c3e2d]">Questions & Answers</h3>
          <span className="text-sm text-[#5c6d5e]">
            {loadedQuestions > 0 && loadedQuestions !== totalQuestions 
              ? `${loadedQuestions} of ${totalQuestions} questions`
              : `${totalQuestions} questions`
            }
          </span>
        </div>
        
        {/* Ask Question Button */}
        {isLoggedIn && isEnrolled && !showForm && (
          <Button
            variant="outline"
            className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
            onClick={onAskQuestion}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Ask a Question
          </Button>
        )}
      </div>

      {/* Sort Options */}
      {totalQuestions > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5c6d5e]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm border border-[#dce4d7] rounded px-2 py-1 bg-white focus:outline-none focus:border-[#4a7c59]"
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

      <div className="flex gap-3">
        <Button
          className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
          onClick={onSubmitQuestion}
          disabled={!canSubmit}
        >
          {submitting ? "Posting..." : "Post Question"}
        </Button>
        <Button
          variant="outline"
          className="border-[#4a7c59] text-[#4a7c59]"
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
    if (user.avatar && !imageError) {
      if (user.avatar.startsWith('http')) {
        return (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover"
            onError={handleImageError}
          />
        )
      } else {
        return (
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-2xl">{user.avatar}</span>
          </div>
        )
      }
    } else {
      return (
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-5 w-5 text-gray-500" />
        </div>
      )
    }
  }

  return (
    <div className="border-b border-[#dce4d7] pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {renderAvatar(question.user)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h5 className="font-medium text-[#2c3e2d]">{question.user.name}</h5>
              {question.isPinned && (
                <Pin className="h-4 w-4 text-[#4a7c59]" />
              )}
              {question.isAnswered && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Answered
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5c6d5e]">{question.createdAt}</span>
              </div>
            </div>
            {question.user.email === question.currentUserEmail && (
              <div className="flex items-center gap-2">
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

          {/* Question Content */}
          <p className="text-sm text-[#5c6d5e] mb-3 leading-relaxed">{question.question}</p>

          {/* Question Actions */}
          <div className="flex items-center gap-4 text-sm mb-3">
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

          {/* Reply Form */}
          {replyingTo === question.id && isLoggedIn && isEnrolled && (
            <div className="mb-4 bg-white border border-[#dce4d7] rounded-lg p-3">
              <textarea
                className="w-full border border-[#dce4d7] rounded p-2 text-sm focus:border-[#4a7c59] focus:outline-none resize-none"
                rows="3"
                placeholder="Write your answer..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-[#5c6d5e]">{commentText.length}/500</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                    onClick={() => onSubmitComment(question.id)}
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Post Answer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
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

          {/* Comments/Answers Section */}
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
    if (user.avatar && !imageError) {
      if (user.avatar.startsWith('http')) {
        return (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
            onError={handleImageError}
          />
        )
      } else {
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-lg">{user.avatar}</span>
          </div>
        )
      }
    } else {
      return (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      )
    }
  }

  return (
    <div className="border-b border-[#dce4d7] pb-3 last:border-b-0 last:pb-0 pl-0">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {renderAvatar(comment.user)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h6 className="font-medium text-[#2c3e2d] text-sm">{comment.user.name}</h6>
              {comment.isInstructorReply && (
                <span className="bg-[#4a7c59] text-white text-xs px-2 py-1 rounded-full">
                  Instructor
                </span>
              )}
              <span className="text-xs text-[#5c6d5e]">{comment.createdAt}</span>
            </div>
            {comment.user.email === comment.currentUserEmail && (
              <div className="flex gap-1">
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

          {/* Comment Content or Edit Form */}
          {editingComment === comment._id ? (
            <div className="space-y-2">
              <textarea
                className="w-full border border-[#dce4d7] rounded p-2 text-sm focus:border-[#4a7c59] focus:outline-none resize-none"
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#5c6d5e]">{commentText.length}/500</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                    onClick={() => onUpdateComment(questionId, comment._id)}
                    disabled={!commentText.trim()}
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#5c6d5e] mb-2 leading-relaxed">{comment.comment}</p>
              
              {/* Comment Actions */}
              <div className="flex items-center gap-4 text-sm">
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