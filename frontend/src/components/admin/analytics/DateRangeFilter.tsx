interface DateRangeFilterProps {
  dateRange?:
    | {
        from: Date
        to: Date
      }
    | 'week'
    | 'month'
    | 'quarter'
    | 'year'
    | 'custom'
  customDateRange?: {
    from: Date
    to: Date
  }
  onDateRangeChange?: (
    value: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  ) => void
  onCustomDateRangeChange?: (range: { from: Date; to: Date }) => void
}

export function DateRangeFilter({
  customDateRange,
  onCustomDateRangeChange,
}: DateRangeFilterProps) {
  // Handle both old and new prop styles
  const isCustomDateRangeObject =
    customDateRange && typeof customDateRange === 'object'

  if (isCustomDateRangeObject && onCustomDateRangeChange) {
    return (
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="date"
            value={customDateRange.from.toISOString().split('T')[0]}
            onChange={(e) =>
              onCustomDateRangeChange({
                ...customDateRange,
                from: new Date(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
          />
        </div>
        <span className="text-muted-foreground self-center">to</span>
        <div className="flex-1">
          <input
            type="date"
            value={customDateRange.to.toISOString().split('T')[0]}
            onChange={(e) =>
              onCustomDateRangeChange({
                ...customDateRange,
                to: new Date(e.target.value),
              })
            }
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
          />
        </div>
      </div>
    )
  }

  return null
}
