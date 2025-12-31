import React from 'react'
import { Loader } from 'lucide-react'

interface AdminLoadingSpinnerProps {
  fullScreen?: boolean
  message?: string
}

export const AdminLoadingSpinner: React.FC<AdminLoadingSpinnerProps> = ({
  fullScreen = false,
  message = 'Loading...',
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 bg-card rounded-lg p-8 shadow-lg">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}
