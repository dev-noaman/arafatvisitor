import { useState } from 'react'
import type { TicketComment } from '@/types'

interface CommentTimelineProps {
  comments: TicketComment[]
  onAddComment: (message: string, isInternal: boolean) => Promise<void>
  isAdmin: boolean
  isLoading?: boolean
}

export default function CommentTimeline({ comments, onAddComment, isAdmin, isLoading }: CommentTimelineProps) {
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)
    try {
      await onAddComment(message.trim(), isAdmin ? isInternal : false)
      setMessage('')
      setIsInternal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const getRoleBadge = (role?: string) => {
    if (!role) return null
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      RECEPTION: 'bg-blue-100 text-blue-700',
      HOST: 'bg-green-100 text-green-700',
      STAFF: 'bg-purple-100 text-purple-700',
    }
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
        {role}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Comments ({comments.length})</h3>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No comments yet.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg text-sm ${
                comment.isInternal
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{comment.user.name}</span>
                {getRoleBadge(comment.user.role)}
                {comment.isInternal && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                    Internal Note
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-auto">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      {!isLoading && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a comment..."
          />
          <div className="flex items-center justify-between">
            <div>
              {isAdmin && (
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Internal note (hidden from ticket creator)
                </label>
              )}
            </div>
            <button
              type="submit"
              disabled={!message.trim() || submitting}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
