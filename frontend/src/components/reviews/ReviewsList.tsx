import { useState } from 'react'
import { StarRating } from './StarRating'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReviewData } from './ReviewCard'

interface ReviewsListProps {
  reviews: ReviewData[]
  isLoading?: boolean
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  sortBy?: 'recent' | 'helpful' | 'rating-high' | 'rating-low'
  onSortChange?: (sort: string) => void
  ratingFilter?: number | null
  onRatingFilterChange?: (rating: number | null) => void
}

export function ReviewsList({
  reviews,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  sortBy = 'recent',
  onSortChange,
  ratingFilter = null,
  onRatingFilterChange,
}: ReviewsListProps) {
  const [showFilters, setShowFilters] = useState(false)

  const filteredReviews = ratingFilter
    ? reviews.filter((review) => {
        const avgRating = Math.round(
          review.categoryRatings &&
            Object.keys(review.categoryRatings).length > 0
            ? Object.values(review.categoryRatings).reduce((a, b) => a + b, 0) /
                Object.keys(review.categoryRatings).length
            : review.rating || 0
        )
        return avgRating === ratingFilter
      })
    : reviews

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return (b.helpfulCount || 0) - (a.helpfulCount || 0)
      case 'rating-high':
        return calculateAvgRating(b) - calculateAvgRating(a)
      case 'rating-low':
        return calculateAvgRating(a) - calculateAvgRating(b)
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const calculateAvgRating = (review: ReviewData): number => {
    if (
      review.categoryRatings &&
      Object.keys(review.categoryRatings).length > 0
    ) {
      return (
        Object.values(review.categoryRatings).reduce((a, b) => a + b, 0) /
        Object.keys(review.categoryRatings).length
      )
    }
    return review.rating || 0
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">No reviews yet</p>
        <p className="text-sm text-muted-foreground">
          Be the first to share your experience!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              showFilters && 'rotate-180'
            )}
          />
          Filters & Sort
        </button>

        <div className="w-full sm:w-auto">
          {onSortChange && (
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
                <SelectItem value="rating-high">Highest Rating</SelectItem>
                <SelectItem value="rating-low">Lowest Rating</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Filters Expandable Section */}
      {showFilters && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          {onRatingFilterChange && (
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Filter by Rating
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onRatingFilterChange(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    ratingFilter === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:bg-card/80'
                  )}
                >
                  All Ratings
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => onRatingFilterChange(rating)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      ratingFilter === rating
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-card/80'
                    )}
                  >
                    <StarRating value={rating} readonly size="sm" />
                    <span>{rating}★</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {sortedReviews.map((review) => (
          // ReviewCard should be used here after importing
          // import { ReviewCard } from './ReviewCard'
          <div
            key={review.id}
            className="p-4 border border-border/50 rounded-lg"
          >
            <p className="font-semibold">{review.authorName}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {review.reviewText || 'No review text provided'}
            </p>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </div>
  )
}
