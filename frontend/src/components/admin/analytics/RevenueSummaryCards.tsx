import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DollarSign, ShoppingCart, BarChart3 } from 'lucide-react'
import type { RevenueAnalyticsResponse } from '@/api/revenueAnalytics'
import { formatCurrency } from '@/api/revenueAnalytics'

// Helper function to format exact values with thousand separators
const formatExactValue = (value: number, currency: string = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(value)
}

interface RevenueSummaryCardsProps {
  data: RevenueAnalyticsResponse
}

interface MetricCardProps {
  title: string
  value: string | number
  rawValue: string | number
  formattedRawValue: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  formattedRawValue,
  icon,
  color,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-sky-50 dark:bg-sky-950/30',
      icon: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300',
      border: 'border-sky-200/50 dark:border-sky-800/30',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/50 dark:border-emerald-800/30',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      icon: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      border: 'border-purple-200/50 dark:border-purple-800/30',
    },
    orange: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/50 dark:border-amber-800/30',
    },
  }

  const colors = colorMap[color]

  return (
    <Card
      className={`w-full border ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-2xl lg:text-3xl font-bold truncate cursor-help">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formattedRawValue}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className={`rounded-lg p-2.5 shrink-0 ${colors.icon}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RevenueSummaryCards({ data }: RevenueSummaryCardsProps) {
  const summary = data?.data?.summary

  // Show loading state if no summary data
  if (!summary) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="..."
            rawValue="..."
            formattedRawValue="..."
            icon={<div className="w-5 h-5 bg-muted rounded" />}
            color="blue"
          />
        ))}
      </>
    )
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue, summary.currency),
      rawValue: summary.totalRevenue,
      formattedRawValue: formatExactValue(
        summary.totalRevenue,
        summary.currency
      ),
      unit: summary.currency,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'blue' as const,
    },
    {
      title: 'Total Bookings',
      value: summary.totalBookings.toLocaleString(),
      rawValue: summary.totalBookings,
      formattedRawValue: summary.totalBookings.toLocaleString(),
      unit: 'bookings',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'orange' as const,
    },
    {
      title: 'Avg Booking Value',
      value: formatCurrency(summary.averageBookingValue, summary.currency),
      rawValue: summary.averageBookingValue,
      formattedRawValue: formatExactValue(
        summary.averageBookingValue,
        summary.currency
      ),
      unit: summary.currency,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'purple' as const,
    },
  ]

  return (
    <>
      {metrics.map((metric, idx) => (
        <MetricCard key={idx} {...metric} />
      ))}
    </>
  )
}
