import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  KpiCard,
  PendingApprovalsList,
  ReceivedDeliveriesList,
  CurrentVisitorsList,
} from '@/components/dashboard'
import ErrorState from '@/components/common/ErrorState'
import { useToast } from '@/hooks/useToast'
import {
  getKpis,
  getPendingApprovals,
  getReceivedDeliveries,
  getCurrentVisitors,
} from '@/services/dashboard'
import {
  DashboardKpis,
  PendingApproval,
  ReceivedDelivery,
  CurrentVisitor,
} from '@/services/dashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const { error: showError } = useToast()

  // State for KPIs
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [kpisLoading, setKpisLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // State for pending approvals
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [approvalsLoading, setApprovalsLoading] = useState(true)

  // State for deliveries
  const [deliveries, setDeliveries] = useState<ReceivedDelivery[]>([])
  const [deliveriesLoading, setDeliveriesLoading] = useState(true)

  // State for current visitors
  const [visitors, setVisitors] = useState<CurrentVisitor[]>([])
  const [visitorsLoading, setVisitorsLoading] = useState(true)

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoadError(null)
    setKpisLoading(true)
    setApprovalsLoading(true)
    setDeliveriesLoading(true)
    setVisitorsLoading(true)
    try {
      const [kpisData, approvalsData, deliveriesData, visitorsData] = await Promise.all([
        getKpis(),
        getPendingApprovals(),
        getReceivedDeliveries(),
        getCurrentVisitors(),
      ])

      setKpis(kpisData)
      setApprovals(approvalsData)
      setDeliveries(deliveriesData)
      setVisitors(visitorsData)
    } catch (error: unknown) {
      setLoadError('Failed to load dashboard data. Please check your connection and try again.')
      showError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setKpisLoading(false)
      setApprovalsLoading(false)
      setDeliveriesLoading(false)
      setVisitorsLoading(false)
    }
  }, [showError])

  // Load data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name || user?.email}
        </p>
      </div>

      {/* Error State */}
      {loadError && !kpisLoading && (
        <ErrorState
          title="Failed to load dashboard"
          message={loadError}
          onRetry={fetchDashboardData}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          label="Total Hosts"
          value={kpis?.totalHosts ?? 0}
          isLoading={kpisLoading}
          bgColor="bg-white"
          iconBgColor="bg-blue-100"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />
        <KpiCard
          label="Visits Today"
          value={kpis?.visitsToday ?? 0}
          isLoading={kpisLoading}
          bgColor="bg-white"
          iconBgColor="bg-green-100"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KpiCard
          label="Deliveries Today"
          value={kpis?.deliveriesToday ?? 0}
          isLoading={kpisLoading}
          bgColor="bg-white"
          iconBgColor="bg-orange-100"
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <PendingApprovalsList
          approvals={approvals}
          isLoading={approvalsLoading}
          onApprovalAction={fetchDashboardData}
        />

        {/* Current Visitors */}
        <CurrentVisitorsList
          visitors={visitors}
          isLoading={visitorsLoading}
          onCheckoutAction={fetchDashboardData}
        />
      </div>

      {/* Received Deliveries - Full Width */}
      <ReceivedDeliveriesList deliveries={deliveries} isLoading={deliveriesLoading} />

      {/* Refresh Data Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
}
