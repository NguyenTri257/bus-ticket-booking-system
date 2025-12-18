import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/api/revenueAnalytics'
import type { BookingAnalyticsResponse } from '@/api/bookingAnalytics'

interface CancellationStatsProps {
  data: BookingAnalyticsResponse
}

export function CancellationStats({ data }: CancellationStatsProps) {
  const { cancellationStats } = data.data

  return (
    <Card className="border-border/50 lg:col-span-2">
      <CardHeader>
        <CardTitle>Cancellation Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-1">
              {cancellationStats.cancelledBookings}
            </div>
            <div className="text-sm text-muted-foreground">Cancelled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-2">
              {cancellationStats.confirmedBookings}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-3">
              {cancellationStats.totalBookings}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {cancellationStats.cancellationRate}%
            </div>
            <div className="text-sm text-muted-foreground">
              Cancellation Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-4">
              {formatCurrency(cancellationStats.lostRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">Lost Revenue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
