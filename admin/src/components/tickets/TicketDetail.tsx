import { useState } from 'react'
import type { Ticket, TicketStatus } from '@/types'
import {
  getStatusBadgeColor,
  getStatusLabel,
  downloadAttachment,
} from '@/services/tickets'
import CommentTimeline from './CommentTimeline'

interface TicketDetailProps {
  ticket: Ticket
  isAdmin: boolean
  currentUserId: number
  onUpdate: (data: Record<string, unknown>) => Promise<void>
  onAddComment: (message: string, isInternal: boolean) => Promise<void>
  onReopen: (comment: string) => Promise<void>
  onBack: () => void
}

// Valid next statuses for admin actions
const COMPLAINT_NEXT: Record<string, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED: ['CLOSED'],
}
const SUGGESTION_NEXT: Record<string, TicketStatus[]> = {
  SUBMITTED: ['REVIEWED', 'DISMISSED'],
}

export default function TicketDetail({
  ticket,
  isAdmin,
  currentUserId,
  onUpdate,
  onAddComment,
  onReopen,
  onBack,
}: TicketDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [resolution, setResolution] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showReopen, setShowReopen] = useState(false)
  const [reopenComment, setReopenComment] = useState('')

  const isComplaint = ticket.type === 'COMPLAINT'
  const isCreator = ticket.createdBy.id === currentUserId
  const canReopen = isCreator && isComplaint && ticket.status === 'RESOLVED'

  const validNextStatuses = isComplaint
    ? COMPLAINT_NEXT[ticket.status] || []
    : SUGGESTION_NEXT[ticket.status] || []

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (newStatus === 'RESOLVED' && !resolution.trim()) {
      alert('Resolution text is required')
      return
    }
    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      alert('Rejection reason is required')
      return
    }

    setIsUpdating(true)
    try {
      const data: Record<string, unknown> = {
        status: newStatus,
        updatedAt: ticket.updatedAt,
      }
      if (newStatus === 'RESOLVED') data.resolution = resolution
      if (newStatus === 'REJECTED') data.rejectionReason = rejectionReason
      await onUpdate(data)
      setResolution('')
      setRejectionReason('')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReopen = async () => {
    if (!reopenComment.trim()) return
    setIsUpdating(true)
    try {
      await onReopen(reopenComment)
      setReopenComment('')
      setShowReopen(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDownload = async (attachId: number, fileName: string) => {
    try {
      const blob = await downloadAttachment(ticket.id, attachId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download attachment')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-blue-600 hover:text-blue-800 mb-2">
            &larr; Back to list
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{ticket.ticketNumber}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              isComplaint ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {isComplaint ? 'Complaint' : 'Suggestion'}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusBadgeColor(ticket.status)}`}>
              {getStatusLabel(ticket.status)}
            </span>
            {isComplaint && ticket.host && (
              <span className="text-xs text-gray-600">
                {ticket.host.name} ({ticket.host.company})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject & Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Resolution (if resolved/closed) */}
          {ticket.resolution && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-5">
              <h4 className="text-sm font-semibold text-green-800 mb-1">Resolution</h4>
              <p className="text-sm text-green-700 whitespace-pre-wrap">{ticket.resolution}</p>
              {ticket.resolvedAt && (
                <p className="text-xs text-green-600 mt-2">
                  Resolved on {formatDate(ticket.resolvedAt)}
                </p>
              )}
            </div>
          )}

          {/* Rejection reason */}
          {ticket.rejectionReason && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-5">
              <h4 className="text-sm font-semibold text-red-800 mb-1">Rejection Reason</h4>
              <p className="text-sm text-red-700 whitespace-pre-wrap">{ticket.rejectionReason}</p>
            </div>
          )}

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Attachments ({ticket.attachments.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ticket.attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => handleDownload(att.id, att.fileName)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded text-blue-600 text-xs font-bold">
                      {att.mimeType.includes('pdf') ? 'PDF' : 'IMG'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{att.fileName}</p>
                      <p className="text-xs text-gray-500">{(att.fileSize / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <CommentTimeline
              comments={ticket.comments || []}
              onAddComment={onAddComment}
              isAdmin={isAdmin}
            />
          </div>

          {/* Reopen button for creator */}
          {canReopen && !showReopen && (
            <button
              onClick={() => setShowReopen(true)}
              className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700"
            >
              Reopen Ticket
            </button>
          )}

          {showReopen && (
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-5 space-y-3">
              <h4 className="text-sm font-semibold text-yellow-800">Reopen this complaint</h4>
              <textarea
                value={reopenComment}
                onChange={(e) => setReopenComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Explain why you want to reopen this ticket..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReopen}
                  disabled={!reopenComment.trim() || isUpdating}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Reopening...' : 'Confirm Reopen'}
                </button>
                <button
                  onClick={() => { setShowReopen(false); setReopenComment('') }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Created By</p>
              <p className="text-sm text-gray-900">{ticket.createdBy.name}</p>
              <p className="text-xs text-gray-500">{ticket.createdBy.role}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Created</p>
              <p className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</p>
            </div>
            {isComplaint && (
              <>
                {ticket.host && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Host / Company</p>
                    <p className="text-sm text-gray-900">{ticket.host.name} ({ticket.host.company})</p>
                  </div>
                )}
              </>
            )}
            {ticket.closedAt && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Closed</p>
                <p className="text-sm text-gray-900">{formatDate(ticket.closedAt)}</p>
              </div>
            )}
          </div>

          {/* Admin Actions */}
          {isAdmin && validNextStatuses.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Admin Actions</h4>

              {/* Resolution text */}
              {validNextStatuses.includes('RESOLVED' as TicketStatus) && (
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Resolution *</label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Describe how this was resolved..."
                  />
                </div>
              )}

              {/* Rejection reason */}
              {validNextStatuses.includes('REJECTED' as TicketStatus) && (
                <div>
                  <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Reason for rejection..."
                  />
                </div>
              )}

              {/* Status actions */}
              <div className="flex flex-wrap gap-2">
                {validNextStatuses.map((status) => {
                  const colors: Record<string, string> = {
                    IN_PROGRESS: 'bg-indigo-600 hover:bg-indigo-700',
                    RESOLVED: 'bg-green-600 hover:bg-green-700',
                    CLOSED: 'bg-gray-600 hover:bg-gray-700',
                    REJECTED: 'bg-red-600 hover:bg-red-700',
                    REVIEWED: 'bg-green-600 hover:bg-green-700',
                    DISMISSED: 'bg-gray-600 hover:bg-gray-700',
                  }
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={isUpdating}
                      className={`px-3 py-1.5 text-white text-sm font-medium rounded-md disabled:opacity-50 ${colors[status] || 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {isUpdating ? '...' : getStatusLabel(status)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
