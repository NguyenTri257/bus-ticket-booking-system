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
import type { RevenueAnalyticsResponse } from '@/api/revenueAnalytics'
import { formatCurrency } from '@/api/revenueAnalytics'

interface RevenueTrendChartProps {
  data: RevenueAnalyticsResponse
}

export function RevenueTrendChart({
  data: analyticsData,
}: RevenueTrendChartProps) {
  const chartData = analyticsData?.data?.trends || []

  // Show loading state if no data
  if (!chartData || chartData.length === 0) {
    return (
      <>
        <CardHeader className="border-b border-border/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Revenue Over Time
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              No data available
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <p className="text-sm">
              No revenue data available for the selected period
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
            Revenue Over Time
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {chartData.length} days
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
              formatter={(value) => {
                if (typeof value === 'number') {
                  return [formatCurrency(value), 'Revenue']
                }
                return [value, 'Revenue']
              }}
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
              dataKey="revenue"
              stroke="var(--foreground)"
              strokeWidth={2.5}
              dot={{
                r: 3,
                stroke: 'var(--foreground)',
                strokeWidth: 1,
                fill: 'var(--foreground)',
              }}
              activeDot={{
                r: 6,
                stroke: 'var(--foreground)',
                strokeWidth: 2,
                fill: 'var(--foreground)',
              }}
              name="Total Revenue"
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  )
}
