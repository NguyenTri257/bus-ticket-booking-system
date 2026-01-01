import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'
import type { RevenueAnalyticsResponse } from '@/api/revenueAnalytics'
import type { BookingAnalyticsResponse } from '@/api/bookingAnalytics'

interface ExportOptions {
  dateRange: string
  fromDate: string
  toDate: string
  groupBy: string
  operator?: string
  activeTab: 'revenue' | 'booking'
}

export async function exportToPDF(
  data: RevenueAnalyticsResponse | BookingAnalyticsResponse | null,
  options: ExportOptions
) {
  if (!data) return

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  let yPosition = margin

  // Helper to add new page if needed
  const checkAddPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Header
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text(
    `${options.activeTab === 'revenue' ? 'Revenue' : 'Booking'} Analytics Report`,
    margin,
    yPosition
  )
  yPosition += 10

  // Report metadata
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100)
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
  yPosition += 5
  pdf.text(
    `Period: ${options.fromDate} to ${options.toDate}`,
    margin,
    yPosition
  )
  yPosition += 5
  pdf.text(`Grouping: ${options.groupBy}`, margin, yPosition)
  if (options.operator && options.operator !== 'all') {
    yPosition += 5
    pdf.text(`Operator: ${options.operator}`, margin, yPosition)
  }
  yPosition += 10

  pdf.setTextColor(0)

  // Summary Section
  checkAddPage(40)
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Summary', margin, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')

  if (options.activeTab === 'revenue') {
    const revenueData = data as RevenueAnalyticsResponse
    const summary = revenueData.data.summary

    const summaryData = [
      [
        'Total Revenue',
        `${summary.totalRevenue.toLocaleString()} ${summary.currency}`,
      ],
      ['Total Bookings', summary.totalBookings.toLocaleString()],
      [
        'Average Booking Value',
        `${summary.averageBookingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${summary.currency}`,
      ],
    ]

    summaryData.forEach(([label, value]) => {
      pdf.text(`${label}:`, margin, yPosition)
      pdf.setFont('helvetica', 'bold')
      pdf.text(value, margin + 60, yPosition)
      pdf.setFont('helvetica', 'normal')
      yPosition += 6
    })
  } else {
    const bookingData = data as BookingAnalyticsResponse
    const summary = bookingData.data.summary

    const summaryData = [
      ['Total Bookings', summary.totalBookings.toLocaleString()],
      ['Success Rate', `${summary.successRate.toFixed(1)}%`],
      ['Cancellation Rate', `${summary.cancellationRate.toFixed(1)}%`],
      [
        'Conversion Rate',
        summary.conversionRate
          ? `${summary.conversionRate.toFixed(1)}%`
          : 'N/A',
      ],
    ]

    summaryData.forEach(([label, value]) => {
      pdf.text(`${label}:`, margin, yPosition)
      pdf.setFont('helvetica', 'bold')
      pdf.text(value, margin + 60, yPosition)
      pdf.setFont('helvetica', 'normal')
      yPosition += 6
    })
  }

  yPosition += 10

  // Capture charts
  try {
    // Wait a bit for charts to fully render
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Try multiple selectors to find chart containers
    let chartContainers = document.querySelectorAll(
      '.recharts-responsive-container'
    )

    // If not found, try alternative selectors
    if (chartContainers.length === 0) {
      chartContainers = document.querySelectorAll('.recharts-wrapper')
    }

    if (chartContainers.length === 0) {
      chartContainers = document.querySelectorAll('[class*="recharts"]')
    }

    // Filter to only visible charts (not in hidden tabs)
    const visibleCharts = Array.from(chartContainers).filter((el) => {
      const element = el as HTMLElement
      return (
        element.offsetParent !== null &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      )
    })

    if (visibleCharts.length === 0) {
      throw new Error('No visible charts found on page')
    }

    for (let i = 0; i < visibleCharts.length; i++) {
      const chartContainer = visibleCharts[i] as HTMLElement

      // Find the parent card for context
      const cardElement = chartContainer.closest('[class*="border"]')
      const cardTitle =
        cardElement
          ?.querySelector('h3, [class*="font-semibold"], .font-semibold')
          ?.textContent?.trim() || `Chart ${i + 1}`

      checkAddPage(80)

      // Add chart title
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(cardTitle, margin, yPosition)
      yPosition += 8

      // Capture chart as canvas with html2canvas-pro (supports oklch)
      const canvas = await html2canvas(chartContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: chartContainer.offsetWidth,
        height: chartContainer.offsetHeight,
      })

      // Calculate dimensions to fit page width
      const imgWidth = pageWidth - margin * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Check if we need a new page for the chart
      if (checkAddPage(imgHeight + 10)) {
        // Re-add title on new page
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(cardTitle, margin, yPosition)
        yPosition += 8
      }

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 10
    }
  } catch (error) {
    console.error('Error capturing charts:', error)
    pdf.setFontSize(10)
    pdf.setTextColor(255, 0, 0)
    pdf.text(
      `Error: Could not capture charts - ${error instanceof Error ? error.message : 'Unknown error'}`,
      margin,
      yPosition
    )
    pdf.setTextColor(0)
    yPosition += 10
  }

  // Add data tables
  checkAddPage(40)
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Detailed Data', margin, yPosition)
  yPosition += 10

  pdf.setFontSize(9)

  if (options.activeTab === 'revenue') {
    const revenueData = data as RevenueAnalyticsResponse
    const trends = revenueData.data.trends // Show all rows

    // Table header
    pdf.setFont('helvetica', 'bold')
    pdf.text('Period', margin, yPosition)
    pdf.text('Revenue', margin + 40, yPosition)
    pdf.text('Bookings', margin + 80, yPosition)
    pdf.text('Avg. Price', margin + 120, yPosition)
    yPosition += 6
    pdf.setFont('helvetica', 'normal')

    // Table rows
    trends.forEach((row) => {
      checkAddPage(6)
      const avgPrice =
        row.bookings > 0
          ? (row.revenue / row.bookings).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '0.00'
      pdf.text(row.period, margin, yPosition)
      pdf.text(row.revenue.toLocaleString(), margin + 40, yPosition)
      pdf.text(row.bookings.toString(), margin + 80, yPosition)
      pdf.text(avgPrice, margin + 120, yPosition)
      yPosition += 5
    })
  } else {
    const bookingData = data as BookingAnalyticsResponse
    const trends = bookingData.data.trends // Show all rows

    // Table header
    pdf.setFont('helvetica', 'bold')
    pdf.text('Period', margin, yPosition)
    pdf.text('Total', margin + 40, yPosition)
    pdf.text('Confirmed', margin + 70, yPosition)
    pdf.text('Cancelled', margin + 105, yPosition)
    pdf.text('Pending', margin + 145, yPosition)
    yPosition += 6
    pdf.setFont('helvetica', 'normal')

    // Table rows
    trends.forEach((row) => {
      checkAddPage(6)
      pdf.text(row.period, margin, yPosition)
      pdf.text(row.totalBookings.toString(), margin + 40, yPosition)
      pdf.text(row.confirmedBookings.toString(), margin + 70, yPosition)
      pdf.text(row.cancelledBookings.toString(), margin + 105, yPosition)
      pdf.text(row.pendingBookings.toString(), margin + 145, yPosition)
      yPosition += 5
    })
  }

  // Footer
  yPosition = pageHeight - 10
  pdf.setFontSize(8)
  pdf.setTextColor(100)
  pdf.text('Bus Ticket Booking System', margin, pageHeight - 10)

  // Save PDF
  const filename = `${options.activeTab}-analytics-${options.dateRange}-${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
}
