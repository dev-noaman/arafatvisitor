import { useState, useEffect, useCallback } from 'react'
import { getMyTeam, createTeamMember, updateTeamMember, toggleTeamMemberStatus } from '@/services/myTeam'
import { useToast } from '@/hooks'
import type { Host, HostLocationType } from '@/types'
import TeamMemberForm from './TeamMemberForm'

interface TeamMembersModalProps {
  isOpen: boolean
  onClose: () => void
  hostId: string
  hostName: string
  hostCompany: string
  hostLocation: HostLocationType
}

export default function TeamMembersModal({
  isOpen,
  onClose,
  hostId,
  hostName,
  hostCompany,
  hostLocation,
}: TeamMembersModalProps) {
  const { success, error } = useToast()
  const [teamMembers, setTeamMembers] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Host | undefined>()

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    if (!isOpen || !hostId) return
    
    setIsLoading(true)
    try {
      const response = await getMyTeam({ hostId, limit: 100 })
      setTeamMembers(response.data || [])
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to load team members')
    } finally {
      setIsLoading(false)
    }
  }, [hostId, isOpen, error])

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers()
      setShowForm(false)
      setSelectedMember(undefined)
    }
  }, [isOpen, fetchTeamMembers])

  // Handle form submit (create or update)
  const handleFormSubmit = async (data: { name: string; email: string; phone?: string }) => {
    setIsSubmitting(true)
    try {
      const submitData = { ...data, hostId }
      
      if (selectedMember) {
        await updateTeamMember(String(selectedMember.id), submitData)
        success('Team member updated successfully')
      } else {
        await createTeamMember(submitData)
        success('Team member created successfully')
      }
      setShowForm(false)
      setSelectedMember(undefined)
      fetchTeamMembers()
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to save team member')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (member: Host) => {
    setSelectedMember(member)
    setShowForm(true)
  }

  // Handle toggle status
  const handleToggleStatus = async (member: Host) => {
    const newStatus = member.status === 1 ? 0 : 1
    const action = newStatus === 0 ? 'deactivate' : 'reactivate'

    if (!confirm(`Are you sure you want to ${action} ${member.name}?`)) return

    try {
      await toggleTeamMemberStatus(String(member.id), newStatus as 0 | 1)
      success(`Team member ${action}d successfully`)
      fetchTeamMembers()
    } catch (err) {
      error(err instanceof Error ? err.message : `Failed to ${action} team member`)
    }
  }

  // Handle add new
  const handleAddNew = () => {
    setSelectedMember(undefined)
    setShowForm(true)
  }

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false)
    setSelectedMember(undefined)
  }

  if (!isOpen) return null

  const locationLabel = hostLocation ? String(hostLocation).replace(/_/g, ' ') : 'Not set'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Team Members - {hostCompany}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Host: {hostName} | Location: {locationLabel}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 max-h-[60vh] overflow-y-auto">
            {showForm ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">
                    {selectedMember ? 'Edit Team Member' : 'Add New Team Member'}
                  </h4>
                  <button
                    onClick={handleCancelForm}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to list
                  </button>
                </div>
                <TeamMemberForm
                  onSubmit={handleFormSubmit}
                  initialData={selectedMember}
                  isLoading={isSubmitting}
                  hostLocation={hostLocation}
                />
              </div>
            ) : (
              <div>
                {/* Add button */}
                <div className="mb-4">
                  <button
                    onClick={handleAddNew}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Team Member
                  </button>
                </div>

                {/* Team members list */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>No team members yet</p>
                    <p className="text-sm mt-1">Add your first team member to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{member.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{member.phone || '—'}</td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => handleToggleStatus(member)}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition ${
                                  member.status === 1
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title={member.status === 1 ? 'Click to deactivate' : 'Click to reactivate'}
                              >
                                {member.status === 1 ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => handleEdit(member)}
                                className="inline-flex items-center p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
