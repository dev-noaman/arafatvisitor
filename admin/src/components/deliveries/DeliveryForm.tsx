import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Host } from '@/types'
import { getDeliveryTypeLookups, getCourierLookups, type LookupItem } from '@/services/lookups'
import { getHosts } from '@/services/hosts'
import HostLookup from '@/components/common/HostLookup'
import SearchableSelect from '@/components/common/SearchableSelect'

const deliverySchema = z.object({
  deliveryType: z.string().min(1, 'Please select delivery type'),
  hostId: z.string().min(1, 'Please select a host'),
  courier: z.string().min(1, 'Please select a courier'),
})

type DeliveryFormData = z.infer<typeof deliverySchema>

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => Promise<void>
  isLoading?: boolean
}

export default function DeliveryForm({ onSubmit, isLoading }: DeliveryFormProps) {
  const [deliveryTypes, setDeliveryTypes] = useState<LookupItem[]>([])
  const [couriers, setCouriers] = useState<LookupItem[]>([])
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoadingLookups, setIsLoadingLookups] = useState(true)

  useEffect(() => {
    Promise.all([
      getDeliveryTypeLookups(),
      getCourierLookups(),
      getHosts({ page: 1, limit: 1000 }),
    ])
      .then(([types, courierList, hostsResponse]) => {
        setDeliveryTypes(types)
        setCouriers(courierList)
        setHosts(hostsResponse.data || [])
      })
      .catch(() => {
        setDeliveryTypes([])
        setCouriers([])
        setHosts([])
      })
      .finally(() => setIsLoadingLookups(false))
  }, [])

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      deliveryType: '',
      hostId: '',
      courier: '',
    },
  })

  const selectedDeliveryType = watch('deliveryType')

  const filteredCouriers = useMemo(
    () =>
      couriers.filter((c) => {
        if (selectedDeliveryType === 'Food' || selectedDeliveryType === 'Gift') {
          return c.category === 'FOOD'
        }
        return c.category === 'PARCEL' || !c.category
      }),
    [couriers, selectedDeliveryType]
  )

  const deliveryTypeOptions = deliveryTypes.map((t) => ({ value: t.label, label: t.label }))
  const courierOptions = filteredCouriers.map((c) => ({ value: c.label, label: c.label }))

  // Reset courier when delivery type changes and current selection is invalid
  useEffect(() => {
    const currentCourier = watch('courier')
    const valid = filteredCouriers.some((c) => c.label === currentCourier)
    if (currentCourier && !valid) {
      setValue('courier', '')
    }
  }, [selectedDeliveryType])

  const handleFormSubmit = async (data: DeliveryFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Type of Delivery */}
      <div>
        <label htmlFor="deliveryType" className="block text-sm font-medium text-gray-700 mb-1">
          Type of Delivery *
        </label>
        <SearchableSelect
          options={deliveryTypeOptions}
          value={watch('deliveryType') || ''}
          onChange={(v) => setValue('deliveryType', v, { shouldValidate: true })}
          placeholder={isLoadingLookups ? 'Loading...' : 'Type to search delivery type...'}
          disabled={isLoading || isLoadingLookups}
          isLoading={isLoadingLookups}
          error={errors.deliveryType?.message}
          emptyMessage="No delivery type found"
        />
        {errors.deliveryType && (
          <p className="text-sm text-red-600 mt-1">{errors.deliveryType.message}</p>
        )}
      </div>

      {/* Host */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Host *
        </label>
        <HostLookup
          hosts={hosts}
          value={watch('hostId') || ''}
          onChange={(id) => setValue('hostId', id, { shouldValidate: true })}
          disabled={isLoading}
          isLoading={isLoadingLookups}
          error={errors.hostId?.message}
        />
        {errors.hostId && (
          <p className="text-sm text-red-600 mt-1">{errors.hostId.message}</p>
        )}
      </div>

      {/* Courier */}
      <div>
        <label htmlFor="courier" className="block text-sm font-medium text-gray-700 mb-1">
          Courier *
        </label>
        <SearchableSelect
          options={courierOptions}
          value={watch('courier') || ''}
          onChange={(v) => setValue('courier', v, { shouldValidate: true })}
          placeholder={
            isLoadingLookups
              ? 'Loading...'
              : !selectedDeliveryType
                ? 'Select delivery type first'
                : 'Type to search courier...'
          }
          disabled={isLoading || isLoadingLookups || !selectedDeliveryType}
          error={errors.courier?.message}
          emptyMessage="No courier found"
        />
        {errors.courier && (
          <p className="text-sm text-red-600 mt-1">{errors.courier.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isLoadingLookups}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isLoading ? 'Saving...' : 'Record Delivery'}
      </button>
    </form>
  )
}
