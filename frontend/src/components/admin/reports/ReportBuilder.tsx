import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DateRangeFilter } from '@/components/admin/analytics/DateRangeFilter'
import { generateReport, type ReportConfig } from '@/api/customReports'

export function ReportBuilder() {
  const [reportName, setReportName] = useState('')
  const [reportType, setReportType] = useState<
    'revenue' | 'bookings' | 'users' | 'operators'
  >('revenue')
  const [visualizationType, setVisualizationType] = useState<
    'table' | 'chart' | 'mixed'
  >('mixed')
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>(
    'csv'
  )
  const [dateRange, setDateRange] = useState<
    'week' | 'month' | 'quarter' | 'year' | 'custom'
  >('month')
  const [customDateRange, setCustomDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async () => {
    if (!reportName.trim()) {
      alert('Please enter a report name')
      return
    }

    try {
      setLoading(true)

      let fromDate: string
      let toDate: string

      if (dateRange === 'custom') {
        fromDate = customDateRange.from.toISOString().split('T')[0]
        toDate = customDateRange.to.toISOString().split('T')[0]
      } else {
        const today = new Date()
        const from = new Date()

        switch (dateRange) {
          case 'week':
            from.setDate(today.getDate() - 7)
            break
          case 'month':
            from.setMonth(today.getMonth() - 1)
            break
          case 'quarter':
            from.setMonth(today.getMonth() - 3)
            break
          case 'year':
            from.setFullYear(today.getFullYear() - 1)
            break
        }

        fromDate = from.toISOString().split('T')[0]
        toDate = today.toISOString().split('T')[0]
      }

      const config: ReportConfig = {
        name: reportName,
        type: reportType,
        dateRange: { from: fromDate, to: toDate },
        filters: {},
        visualizationType,
        exportFormat,
      }

      const result = await generateReport({ config })
      console.log('Report generated:', result)

      // Download the report
      if (result.downloadUrl) {
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = `${reportName}.${exportFormat}`
        link.click()
      }

      // Reset form
      setReportName('')
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Q4 Revenue Report"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={reportType}
                  onValueChange={(val) =>
                    setReportType(
                      val as 'revenue' | 'bookings' | 'users' | 'operators'
                    )
                  }
                >
                  <SelectTrigger id="report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="bookings">Bookings</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="operators">Operators</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="viz-type">Visualization Type</Label>
                <Select
                  value={visualizationType}
                  onValueChange={(val) =>
                    setVisualizationType(val as 'table' | 'chart' | 'mixed')
                  }
                >
                  <SelectTrigger id="viz-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Date Range</Label>
              <DateRangeFilter
                dateRange={dateRange}
                customDateRange={customDateRange}
                onDateRangeChange={setDateRange}
                onCustomDateRangeChange={setCustomDateRange}
              />
            </div>

            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={exportFormat}
                onValueChange={(val) =>
                  setExportFormat(val as 'csv' | 'excel' | 'pdf')
                }
              >
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
