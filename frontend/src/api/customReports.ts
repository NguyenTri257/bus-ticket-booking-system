const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export interface ReportConfig {
  id?: string
  name: string
  type: 'revenue' | 'bookings' | 'users' | 'operators'
  dateRange: { from: string; to: string }
  filters: Record<string, unknown>
  visualizationType: 'table' | 'chart' | 'mixed'
  exportFormat: 'csv' | 'excel' | 'pdf'
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    emailTo?: string[]
  }
}

export interface Report {
  id: string
  name: string
  type: string
  createdAt: string
  updatedAt: string
  lastRun?: string
  schedule?: {
    frequency: string
    enabled: boolean
  }
}

export interface ReportTemplate {
  id: string
  name: string
  type: string
  description: string
  defaultConfig: ReportConfig
}

export interface GeneratedReport {
  id: string
  name: string
  type: string
  data: Record<string, unknown>
  generatedAt: string
  downloadUrl?: string
}

interface CreateReportParams {
  config: ReportConfig
}

interface ScheduleReportParams {
  reportId: string
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    emailTo?: string[]
  }
}

export async function generateReport(
  params: CreateReportParams
): Promise<GeneratedReport> {
  const response = await fetch(`${API_BASE_URL}/admin/reports/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error(`Failed to generate report: ${response.statusText}`)
  }

  return response.json()
}

export async function listReports(): Promise<Report[]> {
  const response = await fetch(`${API_BASE_URL}/admin/reports`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  const response = await fetch(`${API_BASE_URL}/admin/reports/templates`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch report templates: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function scheduleReport(
  params: ScheduleReportParams
): Promise<Report> {
  const response = await fetch(
    `${API_BASE_URL}/admin/reports/${params.reportId}/schedule`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(params.schedule),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to schedule report: ${response.statusText}`)
  }

  return response.json()
}

export async function exportReport(
  reportId: string,
  format: 'csv' | 'excel' | 'pdf'
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/admin/reports/${reportId}/export?format=${format}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to export report: ${response.statusText}`)
  }

  return response.blob()
}
