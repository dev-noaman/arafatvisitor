import { useCallback, useState, useEffect } from 'react'
import { HostsList, HostModal } from '@/components/hosts'
import ErrorState from '@/components/common/ErrorState'
import { getMyTeam, createTeamMember, updateTeamMember } from '@/services/myTeam'
import { useToast } from '@/hooks'
import type { Host } from '@/types'

export default function MyTeam() {
  const { success, error } = useToast()
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

  // Fetch team members
  const fetchTeamMembers = useCallback(async (page = 1, search = '') => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await getMyTeam({
        page,
        limit: pagination.limit,
        search,
      })
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
  }, [pagination.limit])

  // Initial fetch
  useEffect(() => {
    fetchTeamMembers(1, '')
  }, [])

  // Handle form submit
  const handleFormSubmit = async (data: { name: string; email: string; phone?: string }) => {
    setIsSubmitting(true)
    try {
      if (selectedMember) {
        await updateTeamMember(String(selectedMember.id), data)
        success('Team member updated successfully')
      } else {
        await createTeamMember(data)
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Page Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your company's team members
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8-4-4 4 4 4 4 4-4m6 6 6-6 6z" />
            </svg>
            Add Team Member
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => fetchTeamMembers(1, searchQuery)} />
      ) : (
        <HostsList
          hosts={teamMembers}
          isLoading={false}
          pagination={pagination}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={() => {}} // No delete for HOST users
          entityLabel="team member"
          hideCompany
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
