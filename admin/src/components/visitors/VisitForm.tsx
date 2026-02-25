import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Visit, VisitFormData, Host } from '@/types'
import { getPurposeLookups, type LookupItem } from '@/services/lookups'
import SearchableSelect from '@/components/common/SearchableSelect'

function getCurrentDateTimeLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const visitSchema = z.object({
  visitorName: z.string().min(2, 'Visitor name must be at least 2 characters'),
  visitorEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  visitorPhone: z.string().optional(),
  hostId: z.string().min(1, 'Please select a host'),
  visitDate: z.string().min(1, 'Visit date is required'),
  purpose: z.string().optional(),
  notes: z.string().optional(),
})

interface VisitFormProps {
  onSubmit: (data: VisitFormData) => Promise<void>
  initialData?: Visit
  hosts: Host[]
  isLoading?: boolean
  isLoadingHosts?: boolean
}

/** Unique companies from hosts, sorted */
function getCompanies(hosts: Host[]): string[] {
  const set = new Set(hosts.map((h) => h.company).filter(Boolean))
  return Array.from(set).sort()
}

export default function VisitForm({
  onSubmit,
  initialData,
  hosts,
  isLoading,
  isLoadingHosts,
}: VisitFormProps) {
  const [purposes, setPurposes] = useState<LookupItem[]>([])
  const [isLoadingPurposes, setIsLoadingPurposes] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string>('')

  const companies = useMemo(() => {
    const list = getCompanies(hosts)
    // When editing, include initial host's company if not in fetched hosts
    if (initialData?.host?.company && !list.includes(initialData.host.company)) {
      return [...list, initialData.host.company].sort()
    }
    return list
  }, [hosts, initialData?.host?.company])
  const teamMembers = useMemo(() => {
    if (!selectedCompany) return []
    const members = hosts.filter((h) => h.company === selectedCompany)
    // When editing, ensure initial host is in the list even if not in fetched hosts
    if (initialData?.host && initialData.host.company === selectedCompany) {
      const exists = members.some((h) => String(h.id) === String(initialData!.host!.id))
      if (!exists) return [initialData.host, ...members]
    }
    return members
  }, [hosts, selectedCompany, initialData?.host])

  useEffect(() => {
    setIsLoadingPurposes(true)
    getPurposeLookups()
      .then(setPurposes)
      .catch(() => setPurposes([]))
      .finally(() => setIsLoadingPurposes(false))
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: initialData || {
      visitorName: '',
      visitorEmail: '',
      visitorPhone: '',
      hostId: '',
      visitDate: getCurrentDateTimeLocal(),
      purpose: '',
      notes: '',
    },
  })

  const hostId = watch('hostId')

  // Sync selectedCompany when editing with initialData or when hostId changes
  useEffect(() => {
    if (hostId) {
      const host = hosts.find((h) => String(h.id) === String(hostId)) ?? initialData?.host
      if (host?.company) {
        setSelectedCompany(host.company)
      }
    } else {
      setSelectedCompany('')
    }
  }, [hostId, hosts, initialData?.host])

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company)
    setValue('hostId', '', { shouldValidate: true })
  }

  const handleFormSubmit = async (data: VisitFormData) => {
    await onSubmit(data)
    reset()
    setSelectedCompany('')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Visitor Name */}
      <div>
        <label htmlFor="visitorName" className="block text-sm font-medium text-gray-700 mb-1">
          Visitor Name *
        </label>
        <input
          {...register('visitorName')}
          type="text"
          id="visitorName"
          placeholder="Enter visitor name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.visitorName && (
          <p className="text-sm text-red-600 mt-1">{errors.visitorName.message}</p>
        )}
      </div>

      {/* Visitor Email */}
      <div>
        <label htmlFor="visitorEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          {...register('visitorEmail')}
          type="email"
          id="visitorEmail"
          placeholder="Enter email address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.visitorEmail && (
          <p className="text-sm text-red-600 mt-1">{errors.visitorEmail.message}</p>
        )}
      </div>

      {/* Visitor Phone */}
      <div>
        <label htmlFor="visitorPhone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          {...register('visitorPhone')}
          type="tel"
          id="visitorPhone"
          placeholder="Enter phone number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.visitorPhone && (
          <p className="text-sm text-red-600 mt-1">{errors.visitorPhone.message}</p>
        )}
      </div>

      {/* Host Selection: Company then Team Member (searchable) */}
      <div>
        <label htmlFor="hostCompany" className="block text-sm font-medium text-gray-700 mb-1">
          Company *
        </label>
        <SearchableSelect
          options={companies.map((c) => ({ value: c, label: c }))}
          value={selectedCompany}
          onChange={handleCompanyChange}
          placeholder={isLoadingHosts ? 'Loading companies...' : companies.length === 0 ? 'No companies' : 'Type to search company...'}
          disabled={isLoading || isLoadingHosts || companies.length === 0}
          isLoading={isLoadingHosts}
          error={!selectedCompany && errors.hostId?.message}
          emptyMessage='No company found'
        />
      </div>

      <div>
        <label htmlFor="hostId" className="block text-sm font-medium text-gray-700 mb-1">
          Host / Contact Person *
        </label>
        <SearchableSelect
          options={teamMembers.map((h) => ({
            value: String(h.id),
            label: h.email ? `${h.name} (${h.email})` : h.name,
          }))}
          value={hostId || ''}
          onChange={(id) => setValue('hostId', id, { shouldValidate: true })}
          placeholder={
            !selectedCompany
              ? 'Select company first'
              : teamMembers.length === 0
                ? 'No team members'
                : 'Type to search host / contact...'
          }
          disabled={isLoading || isLoadingHosts || !selectedCompany || teamMembers.length === 0}
          error={errors.hostId?.message}
          emptyMessage='No host found'
        />
        {errors.hostId && <p className="text-sm text-red-600 mt-1">{errors.hostId.message}</p>}
      </div>

      {/* Visit Date */}
      <div>
        <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">
          Visit Date *
        </label>
        <input
          {...register('visitDate')}
          type="datetime-local"
          id="visitDate"
          min={getCurrentDateTimeLocal()}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.visitDate && (
          <p className="text-sm text-red-600 mt-1">{errors.visitDate.message}</p>
        )}
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
          Purpose of Visit
        </label>
        <SearchableSelect
          options={[{ value: '', label: '— None —' }, ...purposes.map((p) => ({ value: p.label, label: p.label }))]}
          value={watch('purpose') || ''}
          onChange={(v) => setValue('purpose', v, { shouldValidate: true })}
          placeholder={isLoadingPurposes ? 'Loading purposes...' : 'Type to search purpose...'}
          disabled={isLoading || isLoadingPurposes}
          emptyMessage='No purpose found'
        />
        {errors.purpose && <p className="text-sm text-red-600 mt-1">{errors.purpose.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          placeholder="Any additional notes"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        ></textarea>
        {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Visit' : 'Create Visit'}
      </button>
    </form>
  )
}
