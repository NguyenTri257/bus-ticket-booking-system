import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StarRating } from './StarRating'
import { ThumbsUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ReviewData {
  id: string
  authorName: string
  authorEmail?: string
  rating: number
  categoryRatings: Record<string, number>
  reviewText?: string
  photos?: string[]
  createdAt: Date
  updatedAt?: Date
  isVerifiedBooking: boolean
  helpfulCount?: number
  userHelpful?: boolean
  isAuthor?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

interface ReviewCardProps {
  review: ReviewData
  onHelpful?: (helpful: boolean) => Promise<void>
  onEdit?: () => void
  onDelete?: () => Promise<void>
  isLoading?: boolean
}

export function ReviewCard({
  review,
  onHelpful,
  onEdit,
  onDelete,
  isLoading = false,
}: ReviewCardProps) {
  const avgRating =
    review.categoryRatings && Object.keys(review.categoryRatings).length > 0
      ? (
          Object.values(review.categoryRatings).reduce((a, b) => a + b, 0) /
          Object.keys(review.categoryRatings).length
        ).toFixed(1)
      : review.rating?.toFixed(1) || '0'

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <Card className="bg-card border-border/50 p-4 sm:p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground truncate">
              {review.authorName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(review.createdAt)}
              {review.isVerifiedBooking && (
                <span className="ml-2 inline-block px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded">
                  ✓ Verified Booking
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        {(review.canEdit || review.canDelete) && (
          <div className="flex gap-2 flex-shrink-0">
            {review.canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                disabled={isLoading}
              >
                Edit
              </Button>
            )}
            {review.canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={isLoading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <StarRating
            value={Math.round(parseFloat(avgRating))}
            readonly
            size="sm"
          />
          <span className="text-sm font-semibold text-foreground">
            {avgRating}
          </span>
        </div>

        {/* Category Ratings */}
        {review.categoryRatings &&
          Object.keys(review.categoryRatings).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.entries(review.categoryRatings).map(
                ([category, rating]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded text-muted-foreground"
                  >
                    <span className="capitalize text-xs font-medium">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-foreground">
                      {rating}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
      </div>

      {/* Review Text */}
      {review.reviewText && (
        <p className="text-sm text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
          {review.reviewText}
        </p>
      )}

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {review.photos.map((photo, index) => (
              <a
                key={index}
                href={photo}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <img
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer - Helpful */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        <button
          onClick={() => onHelpful?.(true)}
          disabled={isLoading}
          className={cn(
            'inline-flex items-center gap-2 text-xs font-medium transition-colors',
            review.userHelpful
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ThumbsUp
            className={cn('w-4 h-4', review.userHelpful && 'fill-current')}
          />
          <span>
            Helpful {review.helpfulCount ? `(${review.helpfulCount})` : ''}
          </span>
        </button>
      </div>
    </Card>
  )
}
