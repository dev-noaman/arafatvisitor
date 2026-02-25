import { useCallback, useState, useEffect } from 'react'
import { HostsList, HostModal } from '@/components/hosts'
import ErrorState from '@/components/common/ErrorState'
import HostLookup from '@/components/common/HostLookup'
import { getMyTeam, createTeamMember, updateTeamMember, toggleTeamMemberStatus } from '@/services/myTeam'
import { getHosts } from '@/services/hosts'
import { useAuth } from '@/hooks'
import { useToast } from '@/hooks'
import type { Host } from '@/types'

export default function MyTeam() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const isHost = user?.role === 'HOST'
  const isReceptionOrAdmin = user?.role === 'RECEPTION' || user?.role === 'ADMIN'
  
  const [teamMembers, setTeamMembers] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Host | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [searchQuery, setSearchQuery] = useState('')
  
  // Host selector state for RECEPTION/ADMIN users
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoadingHosts, setIsLoadingHosts] = useState(false)

  // Fetch hosts for the selector (RECEPTION/ADMIN only)
  useEffect(() => {
    if (isReceptionOrAdmin) {
      setIsLoadingHosts(true)
      getHosts({ limit: 500 })
        .then(res => {
          // Filter to only active hosts (status 1) and not deleted
          const activeHosts = (res.data || []).filter(h => h.status === 1)
          setHosts(activeHosts)
        })
        .catch(() => error('Failed to load hosts'))
        .finally(() => setIsLoadingHosts(false))
    }
  }, [isReceptionOrAdmin, error])

  // For RECEPTION/ADMIN: require host selection before showing team
  const canShowTeam = isHost || selectedHostId

  // Fetch team members
  const fetchTeamMembers = useCallback(async (page = 1, search = '') => {
    // For RECEPTION/ADMIN: don't fetch without host selection
    if (isReceptionOrAdmin && !selectedHostId) {
      setTeamMembers([])
      return
    }
    
    setIsLoading(true)
    setLoadError(null)
    try {
      const params: {
        page: number
        limit: number
        search: string
        hostId?: string
      } = {
        page,
        limit: pagination.limit,
        search,
      }
      
      // Pass hostId for RECEPTION/ADMIN users
      if (isReceptionOrAdmin && selectedHostId) {
        params.hostId = selectedHostId
      }
      
      const response = await getMyTeam(params)
      setTeamMembers(response.data || [])
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      })
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load team members')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, isReceptionOrAdmin, selectedHostId])

  // Initial fetch (HOST users only - RECEPTION/ADMIN need to select host first)
  useEffect(() => {
    if (isHost) {
      fetchTeamMembers(1, '')
    }
  }, [isHost, fetchTeamMembers])

  // Reset and fetch when host selection changes (for RECEPTION/ADMIN)
  useEffect(() => {
    if (isReceptionOrAdmin && selectedHostId) {
      setPagination(prev => ({ ...prev, page: 1 }))
      setSearchQuery('')
      fetchTeamMembers(1, '')
    }
  }, [selectedHostId, isReceptionOrAdmin, fetchTeamMembers])

  // Handle form submit
  const handleFormSubmit = async (data: { name: string; email: string; phone?: string }) => {
    // For RECEPTION/ADMIN: require host selection
    if (isReceptionOrAdmin && !selectedHostId) {
      error('Please select a host company first')
      return
    }
    
    setIsSubmitting(true)
    try {
      const submitData = { ...data }
      
      // Add hostId for RECEPTION/ADMIN users
      if (isReceptionOrAdmin && selectedHostId) {
        (submitData as any).hostId = selectedHostId
      }
      
      if (selectedMember) {
        await updateTeamMember(String(selectedMember.id), submitData)
        success('Team member updated successfully')
      } else {
        await createTeamMember(submitData)
        success('Team member created successfully')
      }
      setIsModalOpen(false)
      setSelectedMember(undefined)
      // Refresh the list
      fetchTeamMembers(pagination.page, searchQuery)
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to save team member')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (member: Host) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  // Handle toggle status (deactivate/reactivate)
  const handleToggleStatus = async (member: Host) => {
    const newStatus = member.status === 1 ? 0 : 1
    const action = newStatus === 0 ? 'deactivate' : 'reactivate'

    if (!confirm(`Are you sure you want to ${action} ${member.name}?`)) return

    try {
      await toggleTeamMemberStatus(String(member.id), newStatus as 0 | 1)
      success(`Team member ${action}d successfully`)
      fetchTeamMembers(pagination.page, searchQuery)
    } catch (err) {
      error(err instanceof Error ? err.message : `Failed to ${action} team member`)
    }
  }

  // Handle search
  const handleSearch = (searchValue: string) => {
    setSearchQuery(searchValue)
    fetchTeamMembers(1, searchValue)
  }
  // Handle page change
  const handlePageChange = (page: number) => {
    fetchTeamMembers(page, searchQuery)
  }
  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMember(undefined)
  }

  // Handle host selection change
  const handleHostChange = (hostId: string) => {
    const selected = hosts.find(h => String(h.id) === hostId)
    setSelectedHostId(hostId || null)
    setSelectedCompany(selected?.company || '')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Page Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isHost 
                ? 'Manage your company\'s team members'
                : selectedCompany 
                  ? `Managing team on behalf of: ${selectedCompany}`
                  : 'Select a host company to manage their team members'
              }
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isReceptionOrAdmin && !selectedHostId}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Team Member
          </button>
        </div>
      </div>

      {/* Host Selector for RECEPTION/ADMIN */}
      {isReceptionOrAdmin && (
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Host Company *
          </label>
          <HostLookup
            hosts={hosts}
            value={selectedHostId || ''}
            onChange={handleHostChange}
            isLoading={isLoadingHosts}
          />
        </div>
      )}

      {/* Content */}
      {isLoading && teamMembers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => fetchTeamMembers(1, searchQuery)} />
      ) : !canShowTeam ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No Host Company Selected</p>
          <p className="text-gray-400 text-sm mt-1">
            Please select a host company above to manage their team members
          </p>
        </div>
      ) : (
        <HostsList
          hosts={teamMembers}
          isLoading={false}
          pagination={pagination}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={() => {}}
          onToggleStatus={handleToggleStatus}
          entityLabel="team member"
          hideCompany
          showActions
        />
      )}

      {/* Modal */}
      <HostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        hostData={selectedMember}
        isLoading={isSubmitting}
        entityLabel="team member"
        hideCompany
      />
    </div>
  )
}
