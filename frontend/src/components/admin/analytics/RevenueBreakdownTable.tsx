import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState } from 'react'
import type { RevenueAnalyticsResponse } from '@/api/revenueAnalytics'
import { formatCurrency } from '@/api/revenueAnalytics'

interface RevenueBreakdownTableProps {
  data: RevenueAnalyticsResponse
}

export function RevenueBreakdownTable({ data }: RevenueBreakdownTableProps) {
  const [sortBy, setSortBy] = useState<'period' | 'revenue' | 'bookings'>(
    'period'
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const breakdownData = data?.data?.trends || []

  // Show empty state if no data
  if (!breakdownData || breakdownData.length === 0) {
    return (
      <CardHeader className="border-b border-border/30 pb-4">
        <CardTitle className="text-lg font-semibold">
          Revenue Breakdown
        </CardTitle>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <p className="text-sm">No revenue breakdown data available</p>
          </div>
        </CardContent>
      </CardHeader>
    )
  }

  const sortedData = [...breakdownData].sort((a, b) => {
    let aValue: string | number = a[sortBy]
    let bValue: string | number = b[sortBy]

    if (sortBy === 'period') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  const handleSort = (column: 'period' | 'revenue' | 'bookings') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (column: 'period' | 'revenue' | 'bookings') => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="border-b border-border/30 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Revenue Breakdown
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('period')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {getSortIcon('period')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none text-right"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Revenue
                    {getSortIcon('revenue')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none text-right"
                  onClick={() => handleSort('bookings')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Bookings
                    {getSortIcon('bookings')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Avg. Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => {
                const avgValue =
                  item.bookings > 0 ? item.revenue / item.bookings : 0
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {new Date(item.period).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {formatCurrency(item.revenue)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.revenue.toLocaleString()} ₫</p>
                        </TooltipContent>
                      </UITooltip>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.bookings.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {formatCurrency(avgValue)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{avgValue.toLocaleString()} ₫</p>
                        </TooltipContent>
                      </UITooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TooltipProvider>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)}{' '}
              of {sortedData.length} days
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    )
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {totalPages <= 1 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing all {breakdownData.length} days of revenue data
          </div>
        )}
      </CardContent>
    </Card>
  )
}
