import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import * as api from '@/services/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const get = useCallback(
    async (endpoint: string, options?: UseApiOptions) => {
      setState({ data: null, loading: true, error: null })
      try {
        const response = await api.get<T>(endpoint)
        setState({ data: response.data || response, loading: false, error: null })
        return response
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred'
        setState({ data: null, loading: false, error: errorMessage })
        if (options?.showErrorToast !== false) {
          toast.error(errorMessage)
        }
        throw err
      }
    },
    []
  )

  const post = useCallback(
    async (endpoint: string, data: unknown, options?: UseApiOptions) => {
      setState({ data: null, loading: true, error: null })
      try {
        const response = await api.post<T>(endpoint, data)
        setState({ data: response.data || response, loading: false, error: null })
        if (options?.showSuccessToast) {
          toast.success(options.successMessage || 'Operation successful')
        }
        return response
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred'
        setState({ data: null, loading: false, error: errorMessage })
        if (options?.showErrorToast !== false) {
          toast.error(errorMessage)
        }
        throw err
      }
    },
    []
  )

  const put = useCallback(
    async (endpoint: string, data: unknown, options?: UseApiOptions) => {
      setState({ data: null, loading: true, error: null })
      try {
        const response = await api.put<T>(endpoint, data)
        setState({ data: response.data || response, loading: false, error: null })
        if (options?.showSuccessToast) {
          toast.success(options.successMessage || 'Operation successful')
        }
        return response
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred'
        setState({ data: null, loading: false, error: errorMessage })
        if (options?.showErrorToast !== false) {
          toast.error(errorMessage)
        }
        throw err
      }
    },
    []
  )

  const del = useCallback(
    async (endpoint: string, options?: UseApiOptions) => {
      setState({ data: null, loading: true, error: null })
      try {
        const response = await api.del<T>(endpoint)
        setState({ data: response.data || response, loading: false, error: null })
        if (options?.showSuccessToast) {
          toast.success(options.successMessage || 'Operation successful')
        }
        return response
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred'
        setState({ data: null, loading: false, error: errorMessage })
        if (options?.showErrorToast !== false) {
          toast.error(errorMessage)
        }
        throw err
      }
    },
    []
  )

  return {
    ...state,
    get,
    post,
    put,
    del,
  }
}
