import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { BookingAnalyticsResponse } from '@/api/bookingAnalytics'

interface BookingTrendsChartProps {
  data: BookingAnalyticsResponse
}

export function BookingTrendsChart({
  data: analyticsData,
}: BookingTrendsChartProps) {
  const chartData = analyticsData?.data?.trends || []

  // Show loading state if no data
  if (!chartData || chartData.length === 0) {
    return (
      <>
        <CardHeader className="border-b border-border/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Booking Trends
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              No data available
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <p className="text-sm">
              No booking data available for the selected period
            </p>
          </div>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader className="border-b border-border/30 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Booking Trends
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {chartData.length} {chartData.length === 1 ? 'day' : 'days'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
              opacity={0.6}
            />
            <XAxis
              dataKey="period"
              stroke="var(--muted-foreground)"
              style={{ fontSize: '0.75rem' }}
              opacity={0.6}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              style={{ fontSize: '0.75rem' }}
              opacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                color: 'var(--foreground)',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Line
              type="monotone"
              dataKey="totalBookings"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Total Bookings"
            />
            <Line
              type="monotone"
              dataKey="confirmedBookings"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Confirmed"
            />
            <Line
              type="monotone"
              dataKey="cancelledBookings"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Cancelled"
            />
            <Line
              type="monotone"
              dataKey="pendingBookings"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Pending"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  )
}
