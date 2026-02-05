
interface TableRowSkeletonProps {
  columns?: number
}

export function TableRowSkeleton({ columns = 5 }: TableRowSkeletonProps) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, idx) => (
          <TableRowSkeleton key={idx} columns={columns} />
        ))}
      </tbody>
    </table>
  )
}

interface CardSkeletonProps {
  title?: boolean
  lines?: number
}

export function CardSkeleton({ title = true, lines = 3 }: CardSkeletonProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-4"></div>}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

interface ListSkeletonProps {
  items?: number
}

export function ListSkeleton({ items = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface TextSkeletonProps {
  lines?: number
  width?: string
}

export function TextSkeleton({ lines = 1, width = '100%' }: TextSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: idx === lines - 1 ? width : '100%' }}
        ></div>
      ))}
    </div>
  )
}

interface GridSkeletonProps {
  columns?: number
  items?: number
}

export function GridSkeleton({ columns = 3, items = 6 }: GridSkeletonProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1.5rem' }}>
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, lineIdx) => (
              <div
                key={lineIdx}
                className="h-4 bg-gray-200 rounded animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface FormSkeletonProps {
  fields?: number
}

export function FormSkeleton({ fields = 3 }: FormSkeletonProps) {
  return (
    <form className="space-y-4">
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx}>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
      ))}
      <div className="h-10 bg-gray-200 rounded animate-pulse w-1/4"></div>
    </form>
  )
}

interface DashboardSkeletonProps {
  kpiCount?: number
  withChart?: boolean
  withList?: boolean
}

export function DashboardSkeleton({
  kpiCount = 3,
  withChart = true,
  withList = true,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: kpiCount }).map((_, idx) => (
          <CardSkeleton key={idx} title={false} lines={2} />
        ))}
      </div>

      {withChart && (
        <div className="bg-white rounded-lg shadow p-6 h-72 animate-pulse bg-gray-100"></div>
      )}

      {withList && (
        <div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <ListSkeleton items={5} />
        </div>
      )}
    </div>
  )
}

export default {
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  TextSkeleton,
  GridSkeleton,
  FormSkeleton,
  DashboardSkeleton,
}
