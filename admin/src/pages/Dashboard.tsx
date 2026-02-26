import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardSocket } from '@/hooks/useDashboardSocket'
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
import { getTicketStats } from '@/services/tickets'
import type { TicketStats } from '@/types'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
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

  // State for ticket stats (ADMIN only)
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null)
  const [ticketStatsLoading, setTicketStatsLoading] = useState(false)

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoadError(null)
    setKpisLoading(true)
    setApprovalsLoading(true)
    setDeliveriesLoading(true)
    setVisitorsLoading(true)
    if (isAdmin) setTicketStatsLoading(true)
    try {
      const promises: Promise<any>[] = [
        getKpis(),
        getPendingApprovals(),
        getReceivedDeliveries(),
        getCurrentVisitors(),
      ]
      if (isAdmin) {
        promises.push(getTicketStats().catch(() => null))
      }

      const [kpisData, approvalsData, deliveriesData, visitorsData, ticketStatsData] = await Promise.all(promises)

      setKpis(kpisData)
      setApprovals(approvalsData)
      setDeliveries(deliveriesData)
      setVisitors(visitorsData)
      if (isAdmin && ticketStatsData) setTicketStats(ticketStatsData)
    } catch (error: unknown) {
      setLoadError('Failed to load dashboard data. Please check your connection and try again.')
      showError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setKpisLoading(false)
      setApprovalsLoading(false)
      setDeliveriesLoading(false)
      setVisitorsLoading(false)
      if (isAdmin) setTicketStatsLoading(false)
    }
  }, [showError, isAdmin])

  // Set up WebSocket connection and event listeners
  const handleDashboardEvent = useCallback(
    (event: any) => {
      // On dashboard refresh event, refetch the KPIs and lists
      if (event.type === 'dashboard:refresh') {
        // Refetch KPIs, approvals, visitors, deliveries
        fetchDashboardData()
      }
    },
    [fetchDashboardData],
  )

  useDashboardSocket(handleDashboardEvent)

  // Load data on mount and set up WebSocket listeners
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

      {/* Ticket Overview (ADMIN only) */}
      {isAdmin && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Ticket Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard
              label="Unassigned"
              value={ticketStats?.unassignedComplaints ?? 0}
              isLoading={ticketStatsLoading}
              bgColor="bg-white"
              iconBgColor="bg-amber-100"
              icon={
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <KpiCard
              label="Open Complaints"
              value={ticketStats?.openComplaints ?? 0}
              isLoading={ticketStatsLoading}
              bgColor="bg-white"
              iconBgColor="bg-yellow-100"
              icon={
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
            <KpiCard
              label="In Progress"
              value={ticketStats?.inProgressComplaints ?? 0}
              isLoading={ticketStatsLoading}
              bgColor="bg-white"
              iconBgColor="bg-indigo-100"
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard
              label="Pending Suggestions"
              value={ticketStats?.pendingSuggestions ?? 0}
              isLoading={ticketStatsLoading}
              bgColor="bg-white"
              iconBgColor="bg-purple-100"
              icon={
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />
            <KpiCard
              label="Resolved This Week"
              value={ticketStats?.resolvedThisWeek ?? 0}
              isLoading={ticketStatsLoading}
              bgColor="bg-white"
              iconBgColor="bg-green-100"
              icon={
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <KpiCard
              label="Avg Resolution Time"
              value={ticketStats ? `${ticketStats.averageResolutionHours}h` : '—'}
              isLoading={ticketStatsLoading}
              bgColor="bg-white"
              iconBgColor="bg-blue-100"
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </div>
      )}

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
