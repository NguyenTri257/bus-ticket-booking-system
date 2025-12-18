import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BookingAnalyticsResponse } from '@/api/bookingAnalytics'

interface BookingSummaryCardsProps {
  data: BookingAnalyticsResponse
}

export function BookingSummaryCards({ data }: BookingSummaryCardsProps) {
  const { summary } = data.data

  const metrics = [
    {
      label: 'Total Bookings',
      value: summary.totalBookings,
      format: 'number',
    },
    {
      label: 'Success Rate',
      value: summary.successRate,
      format: 'percentage',
    },
    {
      label: 'Cancellation Rate',
      value: summary.cancellationRate,
      format: 'percentage',
    },
    {
      label: 'Conversion Rate',
      value: summary.conversionRate ? summary.conversionRate : null,
      format: 'percentage',
    },
  ]

  // The parent layout (page) already provides the grid with columns.
  // Return the cards directly so each card becomes a grid child of the parent.
  return (
    <>
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className="w-full border border-border/40 hover:shadow-md transition-all duration-200"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-center py-4">
              <div className="text-3xl md:text-4xl font-bold">
                {metric.format === 'number'
                  ? metric.value?.toLocaleString()
                  : metric.format === 'percentage'
                    ? metric.value !== null
                      ? `${metric.value}%`
                      : 'N/A'
                    : metric.value}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
