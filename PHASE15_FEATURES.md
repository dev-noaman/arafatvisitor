# Phase 15: Advanced Features & Polish - Feature Specifications

**Date**: 2026-02-04
**Phase**: 15 (Penultimate before deployment)

## Feature Specifications

### 1. Enhanced Dashboard

#### 1.1 Visitor Trend Chart
**Component**: `VisitorTrendChart.tsx`
**Location**: `/admin/src/components/dashboard/VisitorTrendChart.tsx`

**Features**:
- Displays 7-day visitor count trend
- Bar chart visualization
- Color coding: Today (blue) vs Previous (gray)
- Hover tooltips showing daily counts
- Responsive height configuration
- Loading skeleton
- Empty state handling

**Props**:
```typescript
interface VisitorTrendChartProps {
  data: TrendDataPoint[]         // Array of date/count pairs
  isLoading?: boolean
  title?: string                 // Default: "Visitor Trends (7 Days)"
  height?: number                // Chart height in pixels
}
```

**Data Format**:
```typescript
interface TrendDataPoint {
  date: string    // ISO date format
  count: number   // Visitor count for that day
}
```

**Usage**:
```typescript
<VisitorTrendChart
  data={sevenDayTrend}
  isLoading={loading}
  height={300}
/>
```

---

#### 1.2 Delivery Status Widget
**Component**: `DeliveryStatusWidget.tsx`
**Location**: `/admin/src/components/dashboard/DeliveryStatusWidget.tsx`

**Features**:
- Shows total deliveries vs received vs picked up
- Progress bars with percentages
- Color-coded status indicators
- View All action button
- Loading skeleton
- Empty state

**Props**:
```typescript
interface DeliveryStatusWidgetProps {
  stats: {
    total: number
    received: number
    pickedUp: number
  }
  isLoading?: boolean
  onViewAll?: () => void
}
```

**Usage**:
```typescript
<DeliveryStatusWidget
  stats={deliveryStats}
  isLoading={loading}
  onViewAll={() => navigate('/deliveries')}
/>
```

---

#### 1.3 Recent Activity Feed
**Component**: `RecentActivityFeed.tsx`
**Location**: `/admin/src/components/dashboard/RecentActivityFeed.tsx`

**Features**:
- Timeline visualization of activities
- User-friendly relative timestamps (e.g., "2m ago")
- Color-coded action types
- Entity type and name display
- View All button
- Loading skeletons
- Empty state

**Props**:
```typescript
interface RecentActivityFeedProps {
  activities: AuditLogEntry[]
  isLoading?: boolean
  onViewAll?: () => void
}
```

**Usage**:
```typescript
<RecentActivityFeed
  activities={recentActivities}
  isLoading={loading}
  onViewAll={() => navigate('/audit')}
/>
```

---

### 2. Bulk Operations

#### 2.1 Bulk Action Bar
**Component**: `BulkActionBar.tsx`
**Location**: `/admin/src/components/common/BulkActionBar.tsx`

**Features**:
- Sticky header when items selected
- Checkbox to select all with tri-state support
- Clear selection button
- Configurable action buttons
- Shows count of selected items (e.g., "3 of 10 selected")
- Disabled state during operations

**Props**:
```typescript
interface BulkActionBarProps {
  selectedCount: number          // Number of selected items
  totalCount: number             // Total items available
  isLoading?: boolean
  actions: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'primary' | 'danger' | 'secondary'
    disabled?: boolean
  }>
  onSelectAll: () => void        // Called when "Select all" clicked
  onClearSelection: () => void   // Called when "Clear" clicked
  onSelectNone?: () => void      // Alternative to clear
}
```

**Usage**:
```typescript
<BulkActionBar
  selectedCount={selected.length}
  totalCount={visitors.length}
  actions={[
    {
      label: 'Approve',
      onClick: () => setShowApproveModal(true),
      variant: 'primary'
    },
    {
      label: 'Reject',
      onClick: () => setShowRejectModal(true),
      variant: 'danger'
    },
    {
      label: 'Export',
      onClick: () => handleExport(),
      variant: 'secondary'
    }
  ]}
  onSelectAll={handleSelectAll}
  onClearSelection={handleClearSelection}
/>
```

---

#### 2.2 Bulk Approve Modal
**Component**: `BulkApproveModal.tsx`
**Location**: `/admin/src/components/common/BulkApproveModal.tsx`

**Features**:
- Confirmation dialog
- Shows number of selected items
- Educational info about status transition
- Confirm/Cancel buttons
- Loading state during operation
- Backdrop click to close

**Props**:
```typescript
interface BulkApproveModalProps {
  isOpen: boolean
  selectedCount: number
  isLoading?: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}
```

**Usage**:
```typescript
<BulkApproveModal
  isOpen={showApproveModal}
  selectedCount={selected.length}
  onConfirm={async () => {
    await bulkOperationsService.bulkApproveVisitors(selected)
    handleRefresh()
    setShowApproveModal(false)
  }}
  onCancel={() => setShowApproveModal(false)}
/>
```

---

#### 2.3 Bulk Reject Modal
**Component**: `BulkRejectModal.tsx`
**Location**: `/admin/src/components/common/BulkRejectModal.tsx`

**Features**:
- Confirmation dialog with reason field
- Optional rejection reason
- Shows count of items
- Educational info
- Confirm/Cancel buttons
- Loading state

**Props**:
```typescript
interface BulkRejectModalProps {
  isOpen: boolean
  selectedCount: number
  isLoading?: boolean
  onConfirm: (reason?: string) => Promise<void>
  onCancel: () => void
}
```

**Usage**:
```typescript
<BulkRejectModal
  isOpen={showRejectModal}
  selectedCount={selected.length}
  onConfirm={async (reason) => {
    await bulkOperationsService.bulkRejectVisitors(selected, reason)
    handleRefresh()
    setShowRejectModal(false)
  }}
  onCancel={() => setShowRejectModal(false)}
/>
```

---

### 3. Import/Export System

#### 3.1 File Dropzone
**Component**: `FileDropzone.tsx`
**Location**: `/admin/src/components/common/FileDropzone.tsx`

**Features**:
- Drag-and-drop area
- Click to browse file picker
- File size validation
- File type filtering
- Visual feedback (drag active state)
- Error display
- Maximum size indicator

**Props**:
```typescript
interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  accept?: string           // Default: ".csv,.xlsx"
  maxSize?: number          // Default: 10MB
  isLoading?: boolean
  label?: string            // Default: "Drop file here..."
  description?: string      // Default: "Supported formats..."
}
```

**Usage**:
```typescript
<FileDropzone
  onFileSelect={(file) => handleFileSelected(file)}
  accept=".csv,.xlsx"
  maxSize={5 * 1024 * 1024}
  label="Drop CSV or Excel file"
/>
```

---

#### 3.2 Import Modal
**Component**: `ImportModal.tsx`
**Location**: `/admin/src/components/common/ImportModal.tsx`

**Features**:
- Three-step wizard: Upload → Preview → Confirm
- File validation with error reporting
- Row-by-row validation display
- Valid/invalid count summary
- Confirmation before import
- Loading states throughout

**Props**:
```typescript
interface ImportModalProps {
  isOpen: boolean
  title?: string
  description?: string
  isLoading?: boolean
  onFileSelected: (file: File) => Promise<ImportPreviewRow[]>
  onConfirm: (validRows: any[]) => Promise<void>
  onCancel: () => void
}
```

**Usage**:
```typescript
<ImportModal
  isOpen={showImportModal}
  title="Import Hosts"
  onFileSelected={async (file) => {
    const data = await importExportService.importFromCSV(file)
    const { valid, invalid } = importExportService.validateImportData(
      data,
      hostSchema
    )
    return [
      ...valid.map(v => ({ valid: true, data: v })),
      ...invalid.map(i => ({ valid: false, rowNumber: i.row, error: i.error }))
    ]
  }}
  onConfirm={async (validRows) => {
    for (const row of validRows) {
      await hostsService.createHost(row)
    }
    handleRefresh()
  }}
  onCancel={() => setShowImportModal(false)}
/>
```

---

#### 3.3 Export Modal
**Component**: `ExportModal.tsx`
**Location**: `/admin/src/components/common/ExportModal.tsx`

**Features**:
- Format selection (CSV, Excel, JSON)
- Custom filename input
- Format descriptions
- File extension auto-completion
- Error handling

**Props**:
```typescript
interface ExportModalProps {
  isOpen: boolean
  title?: string
  description?: string
  isLoading?: boolean
  formats?: ExportFormat[]   // 'csv' | 'excel' | 'json'
  defaultFormat?: ExportFormat
  onConfirm: (format: ExportFormat, filename: string) => Promise<void>
  onCancel: () => void
}
```

**Usage**:
```typescript
<ExportModal
  isOpen={showExportModal}
  title="Export Visitors"
  defaultFormat="csv"
  onConfirm={async (format, filename) => {
    const formattedData = importExportService.formatVisitorsForExport(visitors)
    if (format === 'csv') {
      importExportService.exportToCSV(formattedData, filename)
    } else if (format === 'excel') {
      await importExportService.exportToExcel(formattedData, filename)
    }
  }}
  onCancel={() => setShowExportModal(false)}
/>
```

---

### 4. Advanced Filtering

#### 4.1 Advanced Filter Panel
**Component**: `AdvancedFilterPanel.tsx`
**Location**: `/admin/src/components/common/AdvancedFilterPanel.tsx`

**Features**:
- Slide-out side panel
- Multiple filter types (text, select, date, daterange)
- Active filter count badge
- Apply/Clear buttons
- Backdrop click to close

**Props**:
```typescript
interface FilterField {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'daterange'
  options?: FilterOption[]
  placeholder?: string
}

interface AdvancedFilterPanelProps {
  isOpen: boolean
  fields: FilterField[]
  activeFilters: FilterConfig
  isLoading?: boolean
  onApply: (filters: FilterConfig) => void
  onClear: () => void
  onClose: () => void
}
```

**Usage**:
```typescript
const filterFields: FilterField[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { id: 'pending', label: 'Pending', value: 'PENDING' },
      { id: 'approved', label: 'Approved', value: 'APPROVED' },
    ]
  },
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'daterange'
  }
]

<AdvancedFilterPanel
  isOpen={showFilters}
  fields={filterFields}
  activeFilters={filters}
  onApply={(newFilters) => {
    setFilters(newFilters)
    fetchVisitors(1, '', newFilters)
  }}
  onClear={() => {
    setFilters({})
    fetchVisitors(1, '', {})
  }}
  onClose={() => setShowFilters(false)}
/>
```

---

### 5. Audit & Activity

#### 5.1 Activity Log Component
**Component**: `ActivityLog.tsx`
**Location**: `/admin/src/components/common/ActivityLog.tsx`

**Features**:
- Displays recent activities
- User-friendly timestamps
- Color-coded action badges
- Loading skeleton
- Empty state
- Auto-fetch on mount

**Props**:
```typescript
interface ActivityLogProps {
  limit?: number              // Default: 20
  onActivityCount?: (count: number) => void
}
```

**Usage**:
```typescript
<ActivityLog
  limit={10}
  onActivityCount={(count) => setActivityCount(count)}
/>
```

---

#### 5.2 Audit Service Functions
**Service**: `audit.ts`
**Location**: `/admin/src/services/audit.ts`

**Available Functions**:

1. **getActivityLog(filters)**
   - Get paginated activity log
   - Parameters: page, limit, action, entityType, startDate, endDate, userId
   - Returns: PaginatedResponse<AuditLogEntry[]>

2. **getAuditTrail(entityType, entityId, limit)**
   - Get audit history for specific entity
   - Returns: AuditLogEntry[]

3. **getRecentActivities(limit)**
   - Get most recent activities
   - Default limit: 10
   - Returns: AuditLogEntry[]

4. **getActivityStats(days)**
   - Get activity statistics
   - Returns: { totalActions, actionsByType, actionsByEntity }

5. **logActivity(action, entityType, entityId, details)**
   - Log custom activity
   - Non-blocking (warnings on fail)

6. **formatAuditEntry(entry)**
   - Format entry for display
   - Returns: formatted string

7. **getActionColor(action)**
   - Get color for action type
   - Returns: color class string

---

### 6. UI/UX Polish

#### 6.1 Search Highlight
**Component**: `SearchHighlight.tsx`
**Location**: `/admin/src/components/common/SearchHighlight.tsx`

**Features**:
- Highlights search query in text
- Case-insensitive matching
- Customizable highlight class
- Regex-safe handling

**Props**:
```typescript
interface SearchHighlightProps {
  text: string
  query?: string
  className?: string
  highlightClassName?: string  // Default: "bg-yellow-200 font-semibold"
}
```

**Usage**:
```typescript
<SearchHighlight
  text={visitorName}
  query={searchQuery}
  highlightClassName="bg-yellow-300 font-bold"
/>
```

---

#### 6.2 Keyboard Shortcuts
**Component**: `KeyboardShortcuts.tsx`
**Location**: `/admin/src/components/common/KeyboardShortcuts.tsx`

**Features**:
- Help dialog showing all shortcuts
- Grouped by category
- Automatic shortcut binding
- Escape key to close
- Visual keyboard representation

**Available Shortcuts** (configurable):
```
Ctrl+A: Select All
Ctrl+E: Export
Ctrl+I: Import
Ctrl+F: Filter
Ctrl+?: Show Help
Shift+D: Delete
Ctrl+Shift+A: Approve All
Ctrl+Shift+R: Reject All
```

**Props**:
```typescript
interface KeyboardShortcutsProps {
  isOpen: boolean
  shortcuts: KeyboardShortcut[]
  onClose: () => void
}
```

**Usage**:
```typescript
const [showShortcuts, setShowShortcuts] = useState(false)

const shortcuts = [
  {
    keys: ['Ctrl', 'E'],
    description: 'Export current data',
    action: () => setShowExportModal(true)
  },
  {
    keys: ['Ctrl', 'I'],
    description: 'Import data',
    action: () => setShowImportModal(true)
  }
]

<KeyboardShortcuts
  isOpen={showShortcuts}
  shortcuts={shortcuts}
  onClose={() => setShowShortcuts(false)}
/>
```

---

#### 6.3 Loading Skeletons
**Module**: `LoadingSkeletons.tsx`
**Location**: `/admin/src/components/common/LoadingSkeletons.tsx`

**Available Skeletons**:

1. **TableRowSkeleton**: Single animated table row
2. **TableSkeleton**: Complete table with multiple rows
3. **CardSkeleton**: Card with title and content lines
4. **ListSkeleton**: List items with icon placeholders
5. **TextSkeleton**: Variable-width text lines
6. **GridSkeleton**: Grid of skeleton cards
7. **FormSkeleton**: Form with fields and button
8. **DashboardSkeleton**: Dashboard with KPIs and chart

**Usage**:
```typescript
{isLoading ? (
  <TableSkeleton rows={10} columns={5} />
) : (
  <table>...</table>
)}

{isLoading ? (
  <DashboardSkeleton kpiCount={3} withChart withList />
) : (
  <Dashboard />
)}
```

---

### 7. Bulk Operations Service

**Service**: `bulk-operations.ts`
**Location**: `/admin/src/services/bulk-operations.ts`

**Available Functions**:

1. **bulkApproveVisitors(visitorIds)**
   - Approve multiple visitors at once
   - Throws error if no IDs provided

2. **bulkRejectVisitors(visitorIds, reason)**
   - Reject multiple visitors with optional reason
   - Throws error if no IDs provided

3. **bulkDeleteHosts(hostIds)**
   - Delete multiple hosts
   - Throws error if no IDs provided

4. **bulkCheckoutVisitors(visitorIds)**
   - Check out multiple visitors
   - Throws error if no IDs provided

5. **getBulkOperationStatus(operationId)**
   - Track bulk operation progress
   - Returns: operation status object

6. **cancelBulkOperation(operationId)**
   - Cancel in-progress bulk operation
   - Non-blocking on error

---

### 8. Import/Export Service

**Service**: `import-export.ts`
**Location**: `/admin/src/services/import-export.ts`

**Export Functions**:

1. **exportToCSV(data, filename)**
   - Format data as CSV
   - Download file
   - Handles quotes and commas

2. **exportToExcel(data, filename)**
   - Format as Excel (.xlsx)
   - Fallback to CSV if library unavailable

**Import Functions**:

3. **importFromCSV(file)**
   - Parse CSV file
   - Returns array of objects
   - Handles quoted values

4. **importFromExcel(file)**
   - Parse Excel file
   - Fallback to CSV

5. **validateImportData(data, schema)**
   - Validate against Zod schema
   - Returns: { valid, invalid }

**Format Functions**:

6. **formatVisitorsForExport(visitors)**
   - Clean visitor data for export
   - English column names
   - Formatted dates/times

7. **formatHostsForExport(hosts)**
   - Clean host data for export

8. **formatDeliveriesForExport(deliveries)**
   - Clean delivery data for export

**Template Functions**:

9. **getHostsImportTemplate()**
   - Return JSON template for import

10. **getVisitorsImportTemplate()**
    - Return JSON template for import

---

## Integration Examples

### Example 1: Add Bulk Operations to Visitors Page

```typescript
// In Visitors.tsx
import {
  BulkActionBar,
  BulkApproveModal,
  BulkRejectModal,
} from '@/components/common'
import { bulkOperationsService } from '@/services'

export default function Visitors() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const handleBulkApprove = async () => {
    try {
      await bulkOperationsService.bulkApproveVisitors(selectedIds)
      success('Visitors approved successfully')
      fetchVisitors()
      setSelectedIds([])
    } catch (err) {
      error((err as Error).message)
    }
  }

  return (
    <>
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={visitors.length}
        actions={[
          { label: 'Approve', onClick: () => setShowApproveModal(true) },
          { label: 'Reject', onClick: () => setShowRejectModal(true) },
        ]}
        onSelectAll={() => setSelectedIds(visitors.map(v => v.id))}
        onClearSelection={() => setSelectedIds([])}
      />

      <BulkApproveModal
        isOpen={showApproveModal}
        selectedCount={selectedIds.length}
        onConfirm={handleBulkApprove}
        onCancel={() => setShowApproveModal(false)}
      />

      <BulkRejectModal
        isOpen={showRejectModal}
        selectedCount={selectedIds.length}
        onConfirm={async (reason) => {
          await bulkOperationsService.bulkRejectVisitors(selectedIds, reason)
          success('Visitors rejected')
          fetchVisitors()
          setSelectedIds([])
        }}
        onCancel={() => setShowRejectModal(false)}
      />
    </>
  )
}
```

### Example 2: Add Import/Export to Hosts Page

```typescript
// In Hosts.tsx
import {
  ImportModal,
  ExportModal,
} from '@/components/common'
import { importExportService } from '@/services'

export default function Hosts() {
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const handleImportFile = async (file: File) => {
    const data = await importExportService.importFromCSV(file)
    // Validate and return preview
  }

  const handleExport = async (format: ExportFormat) => {
    const formattedData = importExportService.formatHostsForExport(hosts)
    if (format === 'csv') {
      importExportService.exportToCSV(formattedData, 'hosts.csv')
    }
  }

  return (
    <>
      <button onClick={() => setShowImportModal(true)}>Import</button>
      <button onClick={() => setShowExportModal(true)}>Export</button>

      <ImportModal
        isOpen={showImportModal}
        onFileSelected={handleImportFile}
        onConfirm={async (validRows) => {
          for (const row of validRows) {
            await hostsService.createHost(row)
          }
          success('Import completed')
          fetchHosts()
        }}
        onCancel={() => setShowImportModal(false)}
      />

      <ExportModal
        isOpen={showExportModal}
        onConfirm={handleExport}
        onCancel={() => setShowExportModal(false)}
      />
    </>
  )
}
```

---

## Performance Considerations

- **Import/Export**: Large files processed client-side, can handle up to 10MB
- **Bulk Operations**: UI remains responsive with async operations
- **Activity Feed**: Caches recent activities, configurable refresh rate
- **Advanced Filters**: Debounced filter application
- **Skeletons**: Minimal animation performance impact

---

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all modals
- **ARIA Labels**: Proper labeling for screen readers
- **Color Contrast**: WCAG AA compliant colors
- **Touch Targets**: 44px minimum for mobile
- **Shortcuts Help**: Accessible via keyboard and mouse

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers
