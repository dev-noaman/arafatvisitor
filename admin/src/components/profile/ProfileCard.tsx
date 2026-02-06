import type { User, UserRole } from '@/types'

interface ProfileCardProps {
  user: User
  isLoading?: boolean
}

const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    RECEPTION: 'Reception Staff',
    HOST: 'Host',
  }
  return labels[role] || role
}

const getRoleBadgeColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    RECEPTION: 'bg-blue-100 text-blue-800',
    HOST: 'bg-green-100 text-green-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

const getStatusBadgeColor = (status?: string): string => {
  if (!status || status === 'ACTIVE') return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-800'
}

export default function ProfileCard({ user, isLoading }: ProfileCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full" />
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-300 rounded w-48" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name || 'N/A'}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(user.status)}`}>
                {!user.status || user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Member Since</p>
              <p className="text-gray-900 font-medium">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="text-gray-900 font-medium">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
