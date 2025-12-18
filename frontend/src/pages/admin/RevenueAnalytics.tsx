import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/admin/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RevenueSummaryCards } from '@/components/admin/analytics/RevenueSummaryCards'
import { RevenueTrendChart } from '@/components/admin/analytics/RevenueTrendChart'
import { RoutePerformanceChart } from '@/components/admin/analytics/RoutePerformanceChart'
import { OperatorComparisonChart } from '@/components/admin/analytics/OperatorComparisonChart'
import { BookingStatusTable } from '@/components/admin/analytics/BookingStatusChart'
import { RevenueBreakdownTable } from '@/components/admin/analytics/RevenueBreakdownTable'
import { DateRangeFilter } from '@/components/admin/analytics/DateRangeFilter'
import { GrowthRateIndicators } from '@/components/admin/analytics/GrowthRateIndicators'
import type { RevenueAnalyticsResponse } from '@/api/revenueAnalytics'
import {
  fetchRevenueAnalytics,
  getDateRangeFromString,
  fetchOperators,
  type Operator,
} from '@/api/revenueAnalytics'
import '@/styles/admin.css'

type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'custom'

export default function RevenueAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [selectedOperator, setSelectedOperator] = useState<string>('all')
  const [selectedGroupBy, setSelectedGroupBy] = useState<
    'day' | 'week' | 'month'
  >('day')
  const [customDateRange, setCustomDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [hasCustomDatesBeenSet, setHasCustomDatesBeenSet] = useState(false)
  const [data, setData] = useState<RevenueAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [operators, setOperators] = useState<Operator[]>([])
  const [operatorsLoading, setOperatorsLoading] = useState(true)

  // Fetch data when filters change
  useEffect(() => {
    // Don't fetch if user just selected 'custom' but hasn't set dates yet
    if (dateRange === 'custom' && !hasCustomDatesBeenSet) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        let fromDate: string
        let toDate: string

        if (dateRange === 'custom') {
          // Convert to UTC date strings to ensure consistent timezone handling
          console.log(
            'Today is considered:',
            new Date().toISOString().split('T')[0],
            'in UTC for custom range'
          )
          const fromDateUTC = new Date(
            Date.UTC(
              customDateRange.from.getFullYear(),
              customDateRange.from.getMonth(),
              customDateRange.from.getDate()
            )
          )
          const toDateUTC = new Date(
            Date.UTC(
              customDateRange.to.getFullYear(),
              customDateRange.to.getMonth(),
              customDateRange.to.getDate() + 1
            )
          )

          fromDate = fromDateUTC.toISOString().split('T')[0]
          toDate = toDateUTC.toISOString().split('T')[0]
        } else {
          const range = getDateRangeFromString(dateRange)
          console.log(
            'Today is considered:',
            new Date().toISOString().split('T')[0],
            'in local timezone'
          )
          console.log('Date range:', {
            from: range.from,
            to: range.to,
            dateRange,
          })
          fromDate = range.from
          toDate = range.to
        }

        const response = await fetchRevenueAnalytics({
          fromDate,
          toDate,
          groupBy: selectedGroupBy,
          operatorId: selectedOperator !== 'all' ? selectedOperator : undefined,
        })

        setData(response)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch revenue data'
        )
        console.error('Error fetching revenue analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [
    dateRange,
    selectedOperator,
    selectedGroupBy,
    hasCustomDatesBeenSet,
    customDateRange.from,
    customDateRange.to,
  ])

  // Fetch operators for filter dropdown
  useEffect(() => {
    const fetchOperatorsData = async () => {
      try {
        setOperatorsLoading(true)
        const response = await fetchOperators('approved') // Only fetch approved operators
        setOperators(response.data)
      } catch (err) {
        console.error('Error fetching operators:', err)
        // Fallback to empty array, filter will show "All Operators" only
        setOperators([])
      } finally {
        setOperatorsLoading(false)
      }
    }

    fetchOperatorsData()
  }, [])

  const handleExport = () => {
    if (!data) return

    const { summary, trends, byRoute, byOperator, byStatus } = data.data
    const csvLines: string[] = []

    // Calculate the actual date range used
    let exportFromDate: string
    let exportToDate: string

    if (dateRange === 'custom') {
      exportFromDate = customDateRange.from.toISOString().split('T')[0]
      exportToDate = customDateRange.to.toISOString().split('T')[0]
    } else {
      const range = getDateRangeFromString(dateRange)
      exportFromDate = range.from
      exportToDate = range.to
    }

    // Add filter settings section
    csvLines.push('FILTERS')
    csvLines.push('setting,value')
    csvLines.push(`From Date,${exportFromDate}`)
    csvLines.push(`To Date,${exportToDate}`)
    csvLines.push(`Operator,${selectedOperator}`)
    csvLines.push(`Group By,${selectedGroupBy}`)
    csvLines.push(`Export Date,${new Date().toISOString().split('T')[0]}`)
    csvLines.push('')

    // Add summary section (filtered totals)
    csvLines.push('SUMMARY')
    csvLines.push('metric,value')
    csvLines.push(`Total Revenue,${summary.totalRevenue}`)
    csvLines.push(`Total Bookings,${summary.totalBookings}`)
    csvLines.push(`Average Booking Value,${summary.averageBookingValue}`)
    csvLines.push(`Currency,${summary.currency}`)
    csvLines.push('')

    // Add revenue breakdown section (filtered data)
    csvLines.push('REVENUE_BREAKDOWN')
    csvLines.push('date,revenue,bookings,avg_price')
    trends.forEach((row) => {
      const avgPrice =
        row.bookings > 0 ? (row.revenue / row.bookings).toFixed(2) : '0.00'
      csvLines.push(`${row.period},${row.revenue},${row.bookings},${avgPrice}`)
    })
    csvLines.push('')

    // Add top routes section (filtered data)
    csvLines.push('TOP_ROUTES')
    csvLines.push('route,revenue,bookings,average_price')
    byRoute.forEach((route) => {
      csvLines.push(
        `${route.route},${route.revenue},${route.bookings},${route.averagePrice}`
      )
    })
    csvLines.push('')

    // Add top operators section (filtered data)
    csvLines.push('TOP_OPERATORS')
    csvLines.push('operator_id,name,revenue,bookings')
    byOperator.forEach((operator) => {
      csvLines.push(
        `${operator.operatorId || ''},${operator.operatorName},${operator.revenue},${operator.bookings}`
      )
    })
    csvLines.push('')

    // Add booking status breakdown section (filtered data)
    csvLines.push('BOOKING_STATUS_BREAKDOWN')
    csvLines.push('status,revenue,bookings,average_value')
    byStatus.forEach((status) => {
      csvLines.push(
        `${status.status},${status.revenue},${status.bookings},${status.averageValue}`
      )
    })

    const csv = csvLines.join('\n')

    const element = document.createElement('a')
    element.setAttribute(
      'href',
      `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    )
    element.setAttribute(
      'download',
      `revenue-analytics-${dateRange}-${selectedOperator}-${selectedGroupBy}-${new Date().toISOString().split('T')[0]}.csv`
    )
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Revenue Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Track your financial performance and booking metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-primary animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading analytics...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200/50 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50">
            <CardContent className="pt-6">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {error}
              </p>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* Growth Indicators */}
            <GrowthRateIndicators data={data} />

            {/* Filters Card */}
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Date Range
                    </label>
                    <Select
                      value={dateRange}
                      onValueChange={(value) =>
                        setDateRange(value as DateRange)
                      }
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {dateRange === 'custom' && (
                    <DateRangeFilter
                      dateRange={dateRange}
                      customDateRange={customDateRange}
                      onDateRangeChange={setDateRange}
                      onCustomDateRangeChange={(range) => {
                        setCustomDateRange(range)
                        setHasCustomDatesBeenSet(true)
                      }}
                    />
                  )}

                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Group By
                    </label>
                    <Select
                      value={selectedGroupBy}
                      onValueChange={(value) =>
                        setSelectedGroupBy(value as 'day' | 'week' | 'month')
                      }
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Daily</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                      Operator
                    </label>
                    <Select
                      value={selectedOperator}
                      onValueChange={setSelectedOperator}
                      disabled={operatorsLoading}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue
                          placeholder={
                            operatorsLoading ? 'Loading...' : 'All Operators'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Operators</SelectItem>
                        {operators.map((operator) => (
                          <SelectItem
                            key={operator.operatorId}
                            value={operator.operatorId}
                          >
                            {operator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Summary
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Key financial metrics and booking statistics
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <RevenueSummaryCards data={data} />
              </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Over Time */}
              <Card className="border-border/50 lg:col-span-2">
                <RevenueTrendChart data={data} />
              </Card>

              {/* Route Performance */}
              <Card className="border-border/50">
                <RoutePerformanceChart data={data} />
              </Card>

              {/* Operator Comparison */}
              <Card className="border-border/50">
                <OperatorComparisonChart data={data} />
              </Card>

              {/* Booking Status Breakdown */}
              <Card className="border-border/50 lg:col-span-2">
                <BookingStatusTable data={data} />
              </Card>
            </div>

            {/* Revenue Breakdown Table */}
            <RevenueBreakdownTable data={data} />
          </>
        ) : (
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available for the selected period.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
