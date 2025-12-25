import React from 'react'

type BadgeStatus = 'success' | 'danger' | 'default' | 'warning'

interface StatusBadgeProps {
  status: BadgeStatus
  label: string
  className?: string
}

const statusColorMap: Record<BadgeStatus, string> = {
  success:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[status]} ${className}`}
    >
      {label}
    </span>
  )
}
