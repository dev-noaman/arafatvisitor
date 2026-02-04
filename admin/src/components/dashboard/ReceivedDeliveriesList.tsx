import { ReceivedDelivery } from '@/services/dashboard'
import { formatDate } from '@/utils'

interface ReceivedDeliveriesListProps {
  deliveries: ReceivedDelivery[]
  isLoading?: boolean
}

export function ReceivedDeliveriesList({
  deliveries,
  isLoading = false,
}: ReceivedDeliveriesListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Received Deliveries</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Received Deliveries</h3>
      </div>

      {deliveries.length === 0 ? (
        <div className="p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 10v10l8 4m0-10L4 17"
            />
          </svg>
          <p className="mt-4 text-gray-600">No received deliveries</p>
        </div>
      ) : (
        <div className="divide-y">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {delivery.courier}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 mt-2">{delivery.recipient}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    For: <span className="font-medium">{delivery.hostName}</span> at{' '}
                    <span className="font-medium">{delivery.hostCompany}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Received: {formatDate(delivery.receivedAt, 'MMM DD, YYYY HH:mm')}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Awaiting Pickup
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReceivedDeliveriesList
