import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/admin/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReportBuilder } from '@/components/admin/reports/ReportBuilder'
import { ReportsList } from '@/components/admin/reports/ReportsList'
import { ReportTemplates } from '@/components/admin/reports/ReportTemplates'
import {
  listReports,
  getReportTemplates,
  type Report,
  type ReportTemplate,
} from '@/api/customReports'
import '@/styles/admin.css'

export default function CustomReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'builder' | 'templates'>(
    'list'
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [reportsData, templatesData] = await Promise.all([
          listReports(),
          getReportTemplates(),
        ])

        setReports(reportsData)
        setTemplates(templatesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports')
        console.error('Error fetching reports:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Custom Reports</h1>
            <p className="text-muted-foreground">
              Create and manage custom analytics reports
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Select
            value={viewMode}
            onValueChange={(val: 'list' | 'builder' | 'templates') =>
              setViewMode(val)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">My Reports</SelectItem>
              <SelectItem value="builder">New Report</SelectItem>
              <SelectItem value="templates">Templates</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Loading reports...
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'list' && <ReportsList reports={reports} />}
            {viewMode === 'builder' && <ReportBuilder />}
            {viewMode === 'templates' && (
              <ReportTemplates
                templates={templates}
                onSelectTemplate={() => {
                  setViewMode('builder')
                }}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
