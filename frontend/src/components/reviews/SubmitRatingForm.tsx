import { useState, useRef, useEffect } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StarRating } from './StarRating'
import { cn } from '@/lib/utils'
import type { RatingSubmission, RatingFormState } from './reviews.types'

interface SubmitRatingFormProps {
  bookingId: string
  tripReference: string
  onSubmit: (ratingData: RatingSubmission) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  initialValues?: RatingFormState
  onStateChange?: (state: RatingFormState) => void
}

const RATING_CATEGORIES = [
  { id: 'overall', label: 'Overall Experience' },
  { id: 'cleanliness', label: 'Bus Cleanliness' },
  { id: 'driver_behavior', label: 'Driver Behavior' },
  { id: 'punctuality', label: 'Punctuality' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'value_for_money', label: 'Value for Money' },
]

const MAX_PHOTOS = 5
const MAX_REVIEW_CHARS = 500
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function SubmitRatingForm({
  bookingId,
  tripReference,
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues,
  onStateChange,
}: SubmitRatingFormProps) {
  const [ratings, setRatings] = useState<Record<string, number>>(
    initialValues?.ratings ||
      RATING_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {})
  )
  const [reviewText, setReviewText] = useState(initialValues?.review || '')
  const [photos, setPhotos] = useState<File[]>(initialValues?.photos || [])
  const [photoPreview, setPhotoPreview] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Save state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ ratings, review: reviewText, photos })
    }
  }, [ratings, reviewText, photos, onStateChange])

  const handleRatingChange = (categoryId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [categoryId]: value }))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const currentCount = photos.length
    const remainingSlots = MAX_PHOTOS - currentCount

    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can only upload ${MAX_PHOTOS} photos. ${remainingSlots} slot(s) remaining.`
      )
      return
    }

    // Validate file sizes
    const invalidFiles = selectedFiles.filter((f) => f.size > MAX_FILE_SIZE)
    if (invalidFiles.length > 0) {
      setError('Some files exceed 5MB limit. Please select smaller files.')
      return
    }

    // Validate file types
    const invalidTypes = selectedFiles.filter(
      (f) => !f.type.startsWith('image/')
    )
    if (invalidTypes.length > 0) {
      setError('Only image files are allowed.')
      return
    }

    setError(null)
    setPhotos((prev) => [...prev, ...selectedFiles])

    // Create preview URLs
    selectedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all categories are rated (matches backend requirement)
    const allRated = Object.values(ratings).every((r) => r > 0)
    if (!allRated) {
      setError('Please rate all categories before submitting.')
      return
    }

    try {
      await onSubmit({
        bookingId,
        tripId: tripReference,
        ratings,
        review: reviewText.trim() || undefined,
        photos: photos.length > 0 ? photos : undefined,
        submittedAt: new Date(),
      })
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit rating. Please try again.'
      )
    }
  }

  if (submitted) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 p-8 shadow-lg">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
              🎉 Review Submitted Successfully!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-lg">
              Thank you for your valuable feedback!
            </p>
          </div>

          {/* Details */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Your rating has been recorded</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Photos uploaded successfully</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Review will be published after moderation</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-green-600 dark:text-green-400">
              Your feedback helps improve our service and assists other
              travelers in making informed decisions.
            </p>
            <p className="text-xs text-green-500 dark:text-green-500">
              Booking Reference:{' '}
              <span className="font-mono font-semibold">{tripReference}</span>
            </p>
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
          >
            Continue
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex gap-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Rating Categories */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Rate Your Experience</h3>
        <div className="bg-card/50 rounded-lg p-4 space-y-4">
          {RATING_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between pb-3 last:pb-0 border-b border-border/50 last:border-0"
            >
              <label className="text-sm font-medium text-foreground">
                {category.label}
              </label>
              <StarRating
                value={ratings[category.id]}
                onChange={(value) => handleRatingChange(category.id, value)}
                size="md"
                interactive
              />
            </div>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="review" className="font-semibold text-foreground">
            Write a Review (Optional)
          </label>
          <span className="text-xs text-muted-foreground">
            {reviewText.length}/{MAX_REVIEW_CHARS}
          </span>
        </div>
        <textarea
          id="review"
          value={reviewText}
          onChange={(e) =>
            setReviewText(e.target.value.slice(0, MAX_REVIEW_CHARS))
          }
          placeholder="Share your experience with this trip. What did you like? What could be improved?"
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Please follow our review guidelines and avoid inappropriate content.
        </p>
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-foreground">
            Add Photos (Optional)
          </label>
          <span className="text-xs text-muted-foreground">
            {photos.length}/{MAX_PHOTOS} photos
          </span>
        </div>

        {photoPreview.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photoPreview.map((preview, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted"
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            photos.length < MAX_PHOTOS
              ? 'border-border hover:border-primary/50 hover:bg-primary/5'
              : 'border-border/50 bg-muted/30 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoSelect}
            disabled={photos.length >= MAX_PHOTOS}
            className="hidden"
            aria-label="Upload photos"
          />
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {photos.length >= MAX_PHOTOS
              ? 'Maximum photos reached'
              : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG up to 5MB each
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
          variant="default"
        >
          {isLoading ? 'Submitting...' : 'Submit Rating'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
