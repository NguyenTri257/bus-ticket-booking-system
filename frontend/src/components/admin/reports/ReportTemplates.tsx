import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ReportTemplate } from '@/api/customReports'

interface ReportTemplatesProps {
  templates: ReportTemplate[]
  onSelectTemplate: (template: ReportTemplate) => void
}

export function ReportTemplates({
  templates,
  onSelectTemplate,
}: ReportTemplatesProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {template.description}
            </p>
          </CardHeader>
          <CardContent className="grow">
            <div className="mb-4">
              <Badge>{template.type}</Badge>
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <Button
              onClick={() => onSelectTemplate(template)}
              className="w-full"
            >
              Use Template
            </Button>
          </div>
        </Card>
      ))}

      {templates.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No templates available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
