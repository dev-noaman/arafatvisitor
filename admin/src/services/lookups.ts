import { get } from './api'

export interface LookupItem {
  id: number
  code: string
  label: string
  active: boolean
  sortOrder: number
}

/**
 * Fetch purpose lookups from the API
 */
export async function getPurposeLookups(): Promise<LookupItem[]> {
  return get<LookupItem[]>('/admin/api/lookups/purposes')
}

/**
 * Fetch delivery type lookups from the API
 */
export async function getDeliveryTypeLookups(): Promise<LookupItem[]> {
  return get<LookupItem[]>('/admin/api/lookups/delivery-types')
}

/**
 * Fetch courier lookups from the API
 */
export async function getCourierLookups(): Promise<LookupItem[]> {
  return get<LookupItem[]>('/admin/api/lookups/couriers')
}

/**
 * Fetch location lookups from the API
 */
export async function getLocationLookups(): Promise<LookupItem[]> {
  return get<LookupItem[]>('/admin/api/lookups/locations')
}
