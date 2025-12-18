export interface BookingPeriod {
  from: string
  to: string
}

export interface BookingSummary {
  totalBookings: number
  successRate: number
  cancellationRate: number
  conversionRate: number | null
}

export interface BookingTrend {
  period: string
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  pendingBookings: number
}

export interface StatusDistribution {
  status: string
  count: number
  percentage: number
}

export interface TopRoute {
  routeId: string
  route: string
  origin: string
  destination: string
  totalBookings: number
  revenue: number
  uniqueTrips: number
}

export interface CancellationStats {
  cancelledBookings: number
  confirmedBookings: number
  totalBookings: number
  cancellationRate: number
  lostRevenue: number
}

export interface BookingAnalyticsResponse {
  success: boolean
  data: {
    period: BookingPeriod
    summary: BookingSummary
    trends: BookingTrend[]
    statusDistribution: StatusDistribution[]
    topRoutes: TopRoute[]
    cancellationStats: CancellationStats
  }
  message: string
  timestamp: string
}

interface FetchBookingAnalyticsParams {
  fromDate: string
  toDate: string
  groupBy?: 'day' | 'week' | 'month'
}

import { request } from './auth'

export async function fetchBookingAnalytics(
  params: FetchBookingAnalyticsParams
): Promise<BookingAnalyticsResponse> {
  const queryParams = new URLSearchParams({
    fromDate: params.fromDate,
    toDate: params.toDate,
    ...(params.groupBy && { groupBy: params.groupBy }),
  })

  const response = await request(
    `/analytics/bookings?${queryParams.toString()}`,
    {
      method: 'GET',
    }
  )

  return response
}

// Helper function to get date range based on string
export function getDateRangeFromString(
  range: 'week' | 'month' | 'quarter' | 'year'
): { from: string; to: string } {
  const today = new Date()
  const from = new Date()

  switch (range) {
    case 'week':
      from.setDate(today.getDate() - 7)
      break
    case 'month':
      from.setDate(today.getDate() - 30)
      break
    case 'quarter':
      from.setMonth(today.getMonth() - 3)
      break
    case 'year':
      from.setFullYear(today.getFullYear() - 1)
      break
  }

  // Create date objects at the start of the day in UTC
  const fromDate = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  )
  // For the 'to' date, include the full current day by going to the next day at 00:00:00 UTC
  const toDate = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  )

  return {
    from: fromDate.toISOString().split('T')[0],
    to: toDate.toISOString().split('T')[0],
  }
}
