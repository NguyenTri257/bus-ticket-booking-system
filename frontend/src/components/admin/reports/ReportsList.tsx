import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Trash2 } from 'lucide-react'
import type { Report } from '@/api/customReports'

interface ReportsListProps {
  reports: Report[]
}

export function ReportsList({ reports }: ReportsListProps) {
  return (
    <div className="grid gap-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{report.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Type: <Badge variant="secondary">{report.type}</Badge>
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Updated</p>
                <p className="font-medium">
                  {new Date(report.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Run</p>
                <p className="font-medium">
                  {report.lastRun
                    ? new Date(report.lastRun).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {reports.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No reports created yet. Create your first report!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
