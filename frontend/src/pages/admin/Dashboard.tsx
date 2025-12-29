import { StatCard } from '../../components/admin/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BookOpen,
  Users,
  DollarSign,
  HelpCircle,
  TrendingUp,
  Route,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as TooltipRecharts,
  ResponsiveContainer,
} from 'recharts'
import '@/styles/admin.css'
import { DashboardLayout } from '@/components/admin/DashboardLayout'
import { useAdminDashboard } from '../../hooks/useAdminDashboard'
import { AdminLoadingSpinner } from '../../components/admin/AdminLoadingSpinner'
import { AdminEmptyState } from '../../components/admin/AdminEmptyState'

export default function Dashboard() {
  const {
    dashboardData,
    bookingsTrend,
    topRoutesData,
    recentBookings,
    loading,
    error,
  } = useAdminDashboard()

  if (loading) {
    return (
      <DashboardLayout>
        <AdminLoadingSpinner message="Loading dashboard data..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Bookings"
            value={dashboardData.totalBookings.toLocaleString()}
            icon={BookOpen}
            iconColor="text-primary"
            hoverTitle={`${dashboardData.totalBookings.toLocaleString()} bookings`}
          />
          <StatCard
            title="Active Users"
            value={dashboardData.activeUsers.toLocaleString()}
            icon={Users}
            iconColor="text-success"
            hoverTitle={`${dashboardData.activeUsers.toLocaleString()} users`}
          />
          <StatCard
            title="Revenue Today"
            value={`${(dashboardData.revenueToday / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            iconColor="text-warning"
            hoverTitle={`${dashboardData.revenueToday.toLocaleString()} VND`}
          />
        </div>

        {/* Bookings Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings Trend (Last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)' }}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)' }}
                  />
                  <TooltipRecharts
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300px flex items-center justify-center">
                <AdminEmptyState
                  icon={TrendingUp}
                  title="No Booking Data"
                  description="The chart will show booking trends once there are bookings in the last 7 days."
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Top Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Routes</CardTitle>
            </CardHeader>
            <CardContent>
              {topRoutesData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRoutesData.map((route, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {route.route}
                        </TableCell>
                        <TableCell className="text-right">
                          {route.bookings}
                        </TableCell>
                        <TableCell className="text-right group">
                          <div className="flex items-center justify-end gap-1">
                            <span>{route.revenue}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{route.rawRevenue.toLocaleString()} VND</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <AdminEmptyState
                  icon={Route}
                  title="No Route Data"
                  description="Top routes by bookings will be displayed here once trip data is available."
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-right">Passengers</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {booking.routeName}
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.passengers}
                        </TableCell>
                        <TableCell className="text-right group">
                          <div className="flex items-center justify-end gap-1">
                            <span>{booking.price}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{booking.rawPrice.toLocaleString()} VND</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <AdminEmptyState
                  icon={BookOpen}
                  title="No Recent Bookings"
                  description="Recent booking transactions will be displayed here once booking data is available."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
