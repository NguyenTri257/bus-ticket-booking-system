import { useState, useEffect } from 'react'
import { request } from '../api/auth'

interface TopRoute {
  route: string
  bookings: number
  revenue: string
  rawRevenue: number
}

interface TrendData {
  day: string
  bookings: number
}

interface RecentBooking {
  id: string
  routeName: string
  passengers: number
  price: string
  rawPrice: number
  status: string
  createdAt: string
}

interface TrendItem {
  period: string
  totalBookings: number
}

interface RouteItem {
  revenue: number
  route?: string
  origin?: string
  destination?: string
  totalBookings: number
}

interface BookingItem {
  booking_id: string
  booking_reference?: string
  trip?: {
    route?: {
      origin: string
      destination: string
    }
  }
  origin?: string
  destination?: string
  passengers?: unknown[]
  total_price?: number
  status?: string
  created_at?: string
}

export function useAdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    activeUsers: 0,
    revenueToday: 0,
  })
  const [bookingsTrend, setBookingsTrend] = useState<TrendData[]>([])
  const [topRoutesData, setTopRoutesData] = useState<TopRoute[]>([])
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Date ranges
        const today = new Date()

        // For summary: last 30 days
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 30)

        // For trend: last 7 days
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 7)

        // For top routes & recent bookings: all-time data (use very old date)
        const allTimeDate = new Date('2020-01-01')

        const formatDate = (date: Date) => date.toISOString().split('T')[0]

        const fromDate30 = formatDate(thirtyDaysAgo)
        const fromDate7 = formatDate(sevenDaysAgo)
        const fromDateAllTime = formatDate(allTimeDate)
        const toDate = formatDate(today)

        // Fetch dashboard summary (last 30 days)
        const dashboardResult = await request(
          `/analytics/dashboard?fromDate=${fromDate30}&toDate=${toDate}`,
          { method: 'GET' }
        )

        if (dashboardResult.success) {
          setDashboardData({
            totalBookings: dashboardResult.data.bookings?.total || 0,
            activeUsers: dashboardResult.data.activeUsers || 0,
            revenueToday: dashboardResult.data.revenue?.total || 0,
          })
        }

        // Fetch bookings trend (last 7 days only for the trend chart)
        const trendResult = await request(
          `/analytics/bookings?fromDate=${fromDate7}&toDate=${toDate}&groupBy=day`,
          { method: 'GET' }
        )

        console.log('Trend result:', trendResult)

        if (trendResult.success && trendResult.data.trends) {
          const trendData = trendResult.data.trends.map((item: TrendItem) => ({
            day: new Date(item.period).toLocaleDateString('en-US', {
              weekday: 'short',
            }),
            bookings: item.totalBookings || 0,
          }))
          setBookingsTrend(trendData)
        }

        // Fetch top routes and recent bookings (all-time data to show whenever bookings exist)
        const allTimeResult = await request(
          `/analytics/bookings?fromDate=${fromDateAllTime}&toDate=${toDate}&groupBy=month`,
          { method: 'GET' }
        )

        console.log('All-time bookings result:', allTimeResult)

        if (allTimeResult.success && allTimeResult.data.topRoutes) {
          console.log('Top routes data:', allTimeResult.data.topRoutes)
          const topRoutes = allTimeResult.data.topRoutes
            .slice(0, 4)
            .map((route: RouteItem) => {
              const rawRevenue = route.revenue || 0
              return {
                route: route.route || `${route.origin} → ${route.destination}`,
                bookings: route.totalBookings || 0,
                revenue: `${(rawRevenue / 1000000).toFixed(1)}M`,
                rawRevenue: rawRevenue,
              }
            })
          setTopRoutesData(topRoutes)
        } else {
          console.log('No top routes found in all-time data')
        }

        // Fetch recent bookings from the booking admin endpoint
        try {
          const recentBookingsResult = await request(
            '/bookings/admin?limit=5&sortBy=created_at&sortOrder=DESC',
            {
              method: 'GET',
            }
          )

          console.log('Recent bookings result:', recentBookingsResult)

          if (
            recentBookingsResult.success &&
            Array.isArray(recentBookingsResult.data)
          ) {
            // Log the first booking to see the structure
            if (recentBookingsResult.data.length > 0) {
              const firstBooking = recentBookingsResult.data[0]
              console.log('First booking structure:', firstBooking)
              console.log('Booking keys:', Object.keys(firstBooking))
              console.log(
                'Full first booking data:',
                JSON.stringify(firstBooking, null, 2)
              )
            }

            const bookings = recentBookingsResult.data
              .slice(0, 5)
              .map((booking: BookingItem) => {
                console.log('Processing booking:', booking.booking_id, {
                  hasTrip: !!booking.trip,
                  tripKeys: booking.trip ? Object.keys(booking.trip) : [],
                  hasRoute: !!booking.trip?.route,
                  origin: booking.trip?.route?.origin,
                  destination: booking.trip?.route?.destination,
                  passengers: booking.passengers?.length,
                  totalPrice: booking.total_price,
                })

                const route = booking.trip?.route
                const origin = route?.origin || booking.origin || 'Unknown'
                const destination =
                  route?.destination || booking.destination || 'Unknown'
                const passengerCount = booking.passengers?.length || 0
                const totalPrice = booking.total_price || 0

                return {
                  id: booking.booking_id || booking.booking_reference,
                  routeName: `${origin} → ${destination}`,
                  passengers: passengerCount,
                  price: `${(totalPrice / 1000000).toFixed(1)}M`,
                  rawPrice: totalPrice,
                  status: booking.status,
                  createdAt: booking.created_at,
                }
              })
            console.log('Mapped recent bookings:', bookings)
            setRecentBookings(bookings)
          } else {
            console.warn('Recent bookings response:', recentBookingsResult)
          }
        } catch (recentErr) {
          console.warn('Could not fetch recent bookings:', recentErr)
          // Don't fail the whole dashboard if recent bookings fail
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        if (err instanceof Error) {
          console.error('Error message:', err.message)
          console.error('Error stack:', err.stack)
        }
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return {
    dashboardData,
    bookingsTrend,
    topRoutesData,
    recentBookings,
    loading,
    error,
  }
}
