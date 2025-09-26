import { memo, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, Edit, Trash2, MessageSquare, User, Heart, AlertTriangle, X, Lock } from "lucide-react"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"

export const ReviewSection = memo(function ReviewSection({
  reviewsState,
  isLoggedIn,
  onSubmitReview,
  onDeleteReview,
  onUpdateReview,
  onToggleForm,
  onLoadMore,
  isEnrolled = false
}) {
  const {
    reviews,
    loading,
    loadingMore,
    averageRating,
    totalReviews,
    hasMore,
    userHasReviewed,
    userReview,
    showForm,
    submitting,
    newReview
  } = reviewsState

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleRatingClick = useCallback((rating) => {
    onUpdateReview({ rating })
  }, [onUpdateReview])

  const handleCommentChange = useCallback((e) => {
    onUpdateReview({ comment: e.target.value })
  }, [onUpdateReview])

  const handleShowForm = useCallback(() => {
    onToggleForm(true)
  }, [onToggleForm])

  const handleCancelForm = useCallback(() => {
    onToggleForm(false)
    if (userHasReviewed && userReview) {
      onUpdateReview({
        rating: userReview.rating,
        comment: userReview.comment
      })
    } else {
      onUpdateReview({ rating: 0, comment: "" })
    }
  }, [onToggleForm, userHasReviewed, userReview, onUpdateReview])

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    onDeleteReview()
    setShowDeleteConfirm(false)
  }, [onDeleteReview])

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  return (
    <>
      <div className="mt-4 rounded-lg border border-[#dce4d7] bg-white p-4 shadow-sm">
        <ReviewHeader
          averageRating={averageRating}
          totalReviews={totalReviews}
          isLoggedIn={isLoggedIn}
          userHasReviewed={userHasReviewed}
          showForm={showForm}
          onShowForm={handleShowForm}
          onEditReview={handleShowForm}
          onDeleteReview={handleDeleteClick}
          isEnrolled={isEnrolled}
        />

        {showForm && isLoggedIn && isEnrolled && (
          <ReviewForm
            newReview={newReview}
            userHasReviewed={userHasReviewed}
            submitting={submitting}
            onRatingClick={handleRatingClick}
            onCommentChange={handleCommentChange}
            onSubmitReview={onSubmitReview}
            onCancelReview={handleCancelForm}
          />
        )}

        {isLoggedIn && !isEnrolled && (
          <div className="border-b border-[#dce4d7] py-4">
            <div className="flex items-center justify-center p-4 bg-[#eef2eb] rounded-md border border-[#4a7c59]">
              <div className="text-center">
                <p className="text-sm font-medium text-[#2c3e2d] mb-1">
                  Enroll to Leave a Review
                </p>
                <p className="text-xs text-[#5c6d5e]">
                  You need to be enrolled in this course to write a review
                </p>
              </div>
            </div>
          </div>
        )}

        <ReviewsList 
          reviews={reviews} 
          loading={loading} 
          loadingMore={loadingMore}
          hasMore={hasMore}
          totalReviews={totalReviews}
          onLoadMore={onLoadMore}
        />
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  )
})

const ReviewHeader = memo(function ReviewHeader({
  averageRating,
  totalReviews,
  isLoggedIn,
  userHasReviewed,
  showForm,
  onShowForm,
  onEditReview,
  onDeleteReview,
  isEnrolled
}) {
  return (
    <div className="border-b border-[#dce4d7] pb-4">
      <div className="flex items-center justify-between flex-col sm:flex-row">
        <div className="flex w-full sm:w-max justify-between gap-4 min-w-0 pb-4 sm:pb-0"> 
          <h3 className="font-medium text-[#2c3e2d]">Reviews & Ratings</h3>
          <div className="flex items-center gap-2 min-w-0">
            <StarRating rating={Math.round(averageRating)} size="h-4 w-4"  />
            <span className="text-xs text-[#5c6d5e] whitespace-nowrap">
              {averageRating} ({totalReviews} reviews)
            </span>
          </div>
        </div>
        
{isLoggedIn && isEnrolled && !showForm && (
  <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
    {userHasReviewed ? (
      <>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none border-[#4a7c59] text-[#4a7c59]"
          onClick={onEditReview}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Review
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none border-red-500 text-red-500 hover:bg-red-50"
          onClick={onDeleteReview}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </>
    ) : (
      <Button
        variant="outline"
        className="w-full sm:w-auto border-[#4a7c59] text-[#4a7c59]"
        onClick={onShowForm}
      >
        <Star className="mr-2 h-4 w-4" />
        Write Review
      </Button>
    )}
  </div>
)}
      </div>
    </div>
  )
})

const DeleteConfirmationModal = memo(function DeleteConfirmationModal({
  onConfirm,
  onCancel
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-[#2c3e2d]">Delete Review</h3>
        </div>
        
        <p className="text-[#5c6d5e] mb-6">
          Are you sure you want to delete your review? This action cannot be undone.
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
            Delete Review
          </Button>
        </div>
      </div>
    </div>
  )
})

const ReviewForm = memo(function ReviewForm({
  newReview,
  userHasReviewed,
  submitting,
  onRatingClick,
  onCommentChange,
  onSubmitReview,
  onCancelReview
}) {
  const canSubmit = useMemo(() => 
    newReview.rating > 0 && newReview.comment.trim() !== "" && !submitting,
    [newReview.rating, newReview.comment, submitting]
  )

  return (
    <div className="border-b border-[#dce4d7] py-4">
      <h4 className="mb-3 font-medium text-[#2c3e2d]">
        {userHasReviewed ? "Edit Your Review" : "Write a Review"}
      </h4>
      
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-[#2c3e2d]">
          Rating *
        </label>
        <StarRating 
          rating={newReview.rating} 
          interactive={true} 
          onStarClick={onRatingClick}
          size="h-6 w-6"
        />
        {newReview.rating > 0 && (
          <p className="mt-1 text-sm text-[#5c6d5e]">
            {newReview.rating} out of 5 stars
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-[#2c3e2d]">
          Comment *
        </label>
        <textarea
          className="w-full rounded-md border border-[#dce4d7] p-3 text-sm focus:border-[#4a7c59] focus:outline-none focus:ring-1 focus:ring-[#4a7c59] resize-none"
          rows="4"
          placeholder="Share your thoughts about this course..."
          value={newReview.comment}
          onChange={onCommentChange}
          disabled={submitting}
          maxLength={500}
        />
        <p className="mt-1 text-xs text-[#5c6d5e]">
          {newReview.comment.length}/500 characters
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
          onClick={onSubmitReview}
          disabled={!canSubmit}
        >
          {submitting ? "Submitting..." : userHasReviewed ? "Update Review" : "Submit Review"}
        </Button>
        <Button
          variant="outline"
          className="border-[#4a7c59] text-[#4a7c59]"
          onClick={onCancelReview}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
})

const ReviewsList = memo(function ReviewsList({ 
  reviews, 
  loading, 
  loadingMore, 
  hasMore, 
  totalReviews, 
  onLoadMore 
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a7c59] mx-auto mb-3"></div>
        <p className="text-[#5c6d5e]">Loading reviews...</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-[#5c6d5e]" />
        <p className="text-[#5c6d5e]">No reviews yet. Be the first to review this course!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 pt-4">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {!loading && reviews.length > 0 && hasMore && (
        <div className="mt-6 text-center border-t border-[#dce4d7] pt-6">
          <Button
            variant="outline"
            size="sm"
            className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] w-full sm:w-auto"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4a7c59] mr-2"></div>
                Loading more reviews...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Load More Reviews
              </>
            )}
          </Button>
        </div>
      )}

      {!loading && reviews.length > 0 && !hasMore && (
        <div className="mt-6 text-center border-t border-[#dce4d7] pt-6">
          <p className="text-xs text-[#5c6d5e] mt-1">
            All reviews loaded
          </p>
        </div>
      )}

    </>
  )
})

const ReviewItem = memo(function ReviewItem({ review }) {
  const [imageError, setImageError] = useState(false)
  
  const handleImageError = () => {
    setImageError(true)
  }

  const renderAvatar = () => {
    if (review.user.icon && !imageError) {
      if (review.user.icon === 'bonsai') {
        return (
          <div className="h-10 w-10 rounded-full border border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden">
            <BonsaiSVG 
              level={review.user.bonsai?.level || 1}
              treeColor={review.user.bonsai?.customization?.foliageColor || '#77DD82'} 
              potColor={review.user.bonsai?.customization?.potColor || '#FD9475'} 
              selectedEyes={review.user.bonsai?.customization?.eyes || 'default_eyes'}
              selectedMouth={review.user.bonsai?.customization?.mouth || 'default_mouth'}
              selectedPotStyle={review.user.bonsai?.customization?.potStyle || 'default_pot'}
              selectedGroundStyle={review.user.bonsai?.customization?.groundStyle || 'default_ground'}
              decorations={review.user.bonsai?.customization?.decorations ? Object.values(review.user.bonsai.customization.decorations).filter(Boolean) : []}
              zoomed={true}
            />
          </div>
        )
      } else if (review.user.icon.startsWith('http')) {
        return (
          <img
            src={review.user.icon}
            alt={review.user.name}
            className="h-10 w-10 rounded-full border border-[#4a7c59] object-cover"
            onError={handleImageError}
          />
        )
      } else {
        return (
          <div className="h-10 w-10 rounded-full border border-[#4a7c59] bg-gray-100 flex items-center justify-center">
            <span className="text-2xl">{review.user.icon}</span>
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
    <div className="border-b border-[#dce4d7] pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {renderAvatar()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0">
              <h5 className="font-medium text-[#2c3e2d] truncate">{review.user.name}</h5>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="text-xs text-[#5c6d5e] whitespace-nowrap">{review.createdAt}</span>
              </div>
            </div>
            {review.isLiked && (
              <div className="flex items-center text-red-500 flex-shrink-0">
                <Heart className="h-4 w-4 fill-current" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-[#5c6d5e] break-words overflow-wrap-anywhere">
            {review.comment}
          </p>
        </div>
      </div>
    </div>
  )
})

const StarRating = memo(function StarRating({ 
  rating, 
  interactive = false, 
  onStarClick = null, 
  size = "h-4 w-4" 
}) {
  const stars = useMemo(() => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${
          star <= rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        } ${interactive ? "cursor-pointer hover:text-yellow-400 transition-colors" : ""}`}
        onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
      />
    ))
  }, [rating, size, interactive, onStarClick])

  return (
    <div className="flex items-center">
      {stars}
    </div>
  )
})

export default ReviewSection