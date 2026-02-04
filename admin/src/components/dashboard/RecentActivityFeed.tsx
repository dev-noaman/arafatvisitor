import React from 'react'
import { getActionColor } from '@/services/audit'
import type { AuditLogEntry } from '@/services/audit'

interface RecentActivityFeedProps {
  activities: AuditLogEntry[]
  isLoading?: boolean
  onViewAll?: () => void
}

export function RecentActivityFeed({
  activities,
  isLoading = false,
  onViewAll,
}: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-3 h-3 bg-gray-300 rounded-full flex-shrink-0 mt-2"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activities</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={`${activity.id}-${idx}`} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
            {/* Timeline dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-3 h-3 rounded-full ${
                  idx === 0 ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              ></div>
              {idx < activities.length - 1 && <div className="w-0.5 h-12 bg-gray-200 my-1"></div>}
            </div>

            {/* Activity content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{activity.userName || 'System'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getActionColor(activity.action)}`}>
                      {activity.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.entityType}
                    {activity.entityName && `: ${activity.entityName}`}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formatTime(activity.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
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

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timestamp
  }
}

export default RecentActivityFeed
