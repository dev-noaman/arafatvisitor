import { useCallback, useState, useEffect } from 'react'
import {
  DateRangePicker,
  SummaryCard,
  ReportTable,
  BarChart,
} from '@/components/reports'
import ErrorState from '@/components/common/ErrorState'
import { getReports, exportVisitReport, exportDeliveryReport, downloadReport } from '@/services/reports'
import { useToast } from '@/hooks'
import type { VisitReport, DeliveryReport, HostReport } from '@/types'

interface ReportsData {
  summary: {
    totalVisits: number
    approvedVisits: number
    checkedInVisits: number
    totalDeliveries: number
    deliveriesPickedUp: number
    activeHosts: number
  }
  visitReports: VisitReport[]
  deliveryReports: DeliveryReport[]
  hostReports: HostReport[]
}

export default function Reports() {
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [data, setData] = useState<ReportsData>({
    summary: {
      totalVisits: 0,
      approvedVisits: 0,
      checkedInVisits: 0,
      totalDeliveries: 0,
      deliveriesPickedUp: 0,
      activeHosts: 0,
    },
    visitReports: [],
    deliveryReports: [],
    hostReports: [],
  })

  // Set initial date range (last 30 days)
  const [dateRange, setDateRange] = useState<{
    startDate: string
    endDate: string
  }>(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  })

  // Fetch reports
  const fetchReports = useCallback(async (startDate: string, endDate: string) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const result = await getReports({
        startDate,
        endDate,
      })
      setData(result)
    } catch (err) {
      setLoadError('Failed to load reports. Please check your connection and try again.')
      error('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    fetchReports(dateRange.startDate, dateRange.endDate)
  }, [fetchReports, dateRange.startDate, dateRange.endDate])

  // Handle date range change
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate })
    fetchReports(startDate, endDate)
  }

  // Handle export
  const handleExportVisits = async () => {
    try {
      const blob = await exportVisitReport(dateRange, 'csv')
      downloadReport(
        blob,
        `visit-report-${dateRange.startDate}-${dateRange.endDate}.csv`
      )
      success('Visit report exported successfully')
    } catch {
      error('Failed to export visit report')
    }
  }

  const handleExportDeliveries = async () => {
    try {
      const blob = await exportDeliveryReport(dateRange, 'csv')
      downloadReport(
        blob,
        `delivery-report-${dateRange.startDate}-${dateRange.endDate}.csv`
      )
      success('Delivery report exported successfully')
    } catch {
      error('Failed to export delivery report')
    }
  }

  const visitChartData = data.visitReports.map((report) => ({
    label: new Date(report.date).toLocaleDateString(),
    value: report.totalVisits,
    color: 'bg-blue-500',
  }))

  const deliveryChartData = data.deliveryReports.map((report) => ({
    label: new Date(report.date).toLocaleDateString(),
    value: report.totalDeliveries,
    color: 'bg-green-500',
  }))

  const hostChartData = data.hostReports
    .slice(0, 10)
    .map((report) => ({
      label: report.hostName,
      value: report.totalVisits,
    }))

  const visitReportColumns = [
    {
      key: 'date',
      label: 'Date',
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
    { key: 'totalVisits', label: 'Total Visits' },
    { key: 'approved', label: 'Approved' },
    { key: 'pending', label: 'Pending' },
    { key: 'checkedIn', label: 'Checked In' },
    { key: 'checkedOut', label: 'Checked Out' },
    { key: 'rejected', label: 'Rejected' },
  ]

  const deliveryReportColumns = [
    {
      key: 'date',
      label: 'Date',
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
    { key: 'totalDeliveries', label: 'Total Deliveries' },
    { key: 'pickedUp', label: 'Picked Up' },
    { key: 'pending', label: 'Awaiting Pickup' },
  ]

  const hostReportColumns = [
    { key: 'hostName', label: 'Host Name' },
    { key: 'totalVisits', label: 'Total Visits' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive analytics and reporting dashboard</p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker onDateRangeChange={handleDateRangeChange} isLoading={isLoading} />

      {/* Error State */}
      {loadError && !isLoading && (
        <ErrorState
          title="Failed to load reports"
          message={loadError}
          onRetry={() => fetchReports(dateRange.startDate, dateRange.endDate)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Visits"
          value={data.summary.totalVisits}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          color="blue"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Approved Visits"
          value={data.summary.approvedVisits}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="green"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Checked In"
          value={data.summary.checkedInVisits}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2m14-4V7a2 2 0 00-2-2h-6.343M11 20h1m-6-4h.01M5 11h.01"
              />
            </svg>
          }
          color="orange"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Deliveries"
          value={data.summary.totalDeliveries}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 015.646 5.646 9.003 9.003 0 0012 2c4.971 0 9.185 3.364 9.88 7.848.05.366.037.735-.009 1.102a5.002 5.002 0 01-3.782 3.75A5 5 0 1112 2z"
              />
            </svg>
          }
          color="purple"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Picked Up"
          value={data.summary.deliveriesPickedUp}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="green"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Active Hosts"
          value={data.summary.activeHosts}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a6 6 0 0112 0v2H6v-2z"
              />
            </svg>
          }
          color="red"
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Chart */}
        <BarChart
          title="Daily Visit Trends"
          data={visitChartData}
          isLoading={isLoading}
        />

        {/* Deliveries Chart */}
        <BarChart
          title="Daily Delivery Trends"
          data={deliveryChartData}
          isLoading={isLoading}
        />
      </div>

      {/* Top Hosts Chart */}
      <div className="grid grid-cols-1 gap-6">
        <BarChart
          title="Top 10 Hosts by Visit Count"
          data={hostChartData}
          isLoading={isLoading}
        />
      </div>

      {/* Detailed Reports Tables */}
      <div className="space-y-6">
        {/* Visit Report Table */}
        <ReportTable
          title="Visit Report Details"
          columns={visitReportColumns}
          data={data.visitReports}
          isLoading={isLoading}
          onExport={handleExportVisits}
        />

        {/* Delivery Report Table */}
        <ReportTable
          title="Delivery Report Details"
          columns={deliveryReportColumns}
          data={data.deliveryReports}
          isLoading={isLoading}
          onExport={handleExportDeliveries}
        />

        {/* Host Report Table */}
        <ReportTable
          title="Host Activity Report"
          columns={hostReportColumns}
          data={data.hostReports}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
