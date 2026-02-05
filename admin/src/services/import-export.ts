import { z } from 'zod'
import type { Visit, Host, Delivery } from '@/types'

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Handle special characters and quotes
          if (value === null || value === undefined) return ''
          const stringValue = String(value)
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue
        })
        .join(',')
    ),
  ].join('\n')

  downloadFile(csv, filename, 'text/csv')
}

/**
 * Export data to Excel format (simplified CSV-compatible)
 */
export const exportToExcel = async (data: any[], filename: string): Promise<void> => {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  try {
    // Try to use xlsx if available, otherwise fall back to CSV
    const SheetJS = (window as any).XLSX
    if (SheetJS) {
      const worksheet = SheetJS.utils.json_to_sheet(data)
      const workbook = SheetJS.utils.book_new()
      SheetJS.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      SheetJS.writeFile(workbook, filename)
    } else {
      // Fallback to CSV
      exportToCSV(data, filename.replace('.xlsx', '.csv'))
    }
  } catch {
    // Fallback to CSV if xlsx not available
    exportToCSV(data, filename.replace('.xlsx', '.csv'))
  }
}

/**
 * Import data from CSV file
 */
export const importFromCSV = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split('\n').filter((line) => line.trim())

        if (lines.length < 2) {
          reject(new Error('CSV file must contain headers and at least one data row'))
          return
        }

        const headers = lines[0].split(',').map((h) => h.trim())
        const data = lines.slice(1).map((line) => {
          const values = parseCSVLine(line)
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim() || ''
          })
          return obj
        })

        resolve(data)
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${(error as Error).message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Import data from Excel file
 */
export const importFromExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const SheetJS = (window as any).XLSX

    if (!SheetJS) {
      // Fallback to CSV parsing
      importFromCSV(file).then(resolve).catch(reject)
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const workbook = SheetJS.read(event.target?.result, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = SheetJS.utils.sheet_to_json(worksheet)
        resolve(data)
      } catch (error) {
        reject(new Error(`Failed to parse Excel: ${(error as Error).message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * Validate import data against schema
 */
export const validateImportData = <T extends z.ZodSchema>(
  data: any[],
  schema: T
): { valid: any[]; invalid: { row: number; error: string }[] } => {
  const valid: any[] = []
  const invalid: { row: number; error: string }[] = []

  data.forEach((row, index) => {
    try {
      const result = schema.parse(row)
      valid.push(result)
    } catch (error) {
      if (error instanceof z.ZodError) {
        invalid.push({
          row: index + 1,
          error: error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('; '),
        })
      }
    }
  })

  return { valid, invalid }
}

/**
 * Helper function to parse CSV lines respecting quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

/**
 * Download file as blob
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Format visitors data for export
 */
export const formatVisitorsForExport = (visitors: Visit[]): any[] => {
  return visitors.map((v) => ({
    'Visitor Name': v.visitorName,
    'Visitor Email': v.visitorEmail || '',
    'Visitor Phone': v.visitorPhone || '',
    Host: v.host?.name || '',
    'Visit Date': new Date(v.visitDate).toLocaleDateString(),
    'Check-in Time': v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : '',
    'Check-out Time': v.checkOutTime ? new Date(v.checkOutTime).toLocaleTimeString() : '',
    Status: v.status,
    Purpose: v.purpose || '',
    Notes: v.notes || '',
    'Created At': new Date(v.createdAt).toLocaleString(),
  }))
}

/**
 * Format hosts data for export
 */
export const formatHostsForExport = (hosts: Host[]): any[] => {
  return hosts.map((h) => ({
    Name: h.name,
    Email: h.email,
    Phone: h.phone || '',
    Department: h.department || '',
    'Created At': new Date(h.createdAt).toLocaleString(),
  }))
}

/**
 * Format deliveries data for export
 */
export const formatDeliveriesForExport = (deliveries: Delivery[]): any[] => {
  return deliveries.map((d) => ({
    'Recipient': d.recipient || '',
    'Host Name': d.host?.name || '',
    'Host Company': d.host?.company || '',
    'Courier': d.courier || '',
    Status: d.status,
    'Received Date': d.receivedAt ? new Date(d.receivedAt).toLocaleString() : '',
    'Picked Up Date': d.pickedUpAt ? new Date(d.pickedUpAt).toLocaleString() : '',
    Notes: d.notes || '',
    'Created At': new Date(d.createdAt).toLocaleString(),
  }))
}

/**
 * Get import template for hosts
 */
export const getHostsImportTemplate = (): string => {
  const template = [
    { Name: 'John Doe', Email: 'john@example.com', Phone: '+1234567890', Department: 'Sales' },
  ]
  return JSON.stringify(template, null, 2)
}

/**
 * Get import template for visitors
 */
export const getVisitorsImportTemplate = (): string => {
  const template = [
    {
      'Visitor Name': 'Jane Smith',
      'Visitor Email': 'jane@example.com',
      'Visitor Phone': '+1234567890',
      'Host ID': 'host-uuid',
      'Visit Date': '2026-02-04',
      Purpose: 'Meeting',
      Notes: '',
    },
  ]
  return JSON.stringify(template, null, 2)
}
