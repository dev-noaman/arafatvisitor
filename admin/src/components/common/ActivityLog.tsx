import React, { useEffect, useState } from 'react'
import { auditService, type AuditLogEntry } from '@/services/audit'
import { useToast } from '@/hooks'

interface ActivityLogProps {
  limit?: number
  onActivityCount?: (count: number) => void
}

export function ActivityLog({ limit = 20, onActivityCount }: ActivityLogProps) {
  const { error: showError } = useToast()
  const [activities, setActivities] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const data = await auditService.getRecentActivities(limit)
      setActivities(data)
      onActivityCount?.(data.length)
    } catch (err) {
      showError((err as Error).message || 'Failed to load activities')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent activities</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900 text-sm">
                  {activity.userName || 'System'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${auditService.getActionColor(activity.action)}`}
                >
                  {activity.action}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {activity.entityType}
                {activity.entityName && `: ${activity.entityName}`}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-500">{formatTime(activity.createdAt)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return timestamp
  }
}

export default ActivityLog
