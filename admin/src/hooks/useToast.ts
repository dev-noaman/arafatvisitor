import { useCallback, useMemo } from 'react'
import { toast as sonnerToast } from 'sonner'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export interface ToastOptions {
  duration?: number
  description?: string
}

export function useToast() {
  const success = useCallback((message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration,
      description: options?.description,
    })
  }, [])

  const error = useCallback((message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration,
      description: options?.description,
    })
  }, [])

  const info = useCallback((message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration,
      description: options?.description,
    })
  }, [])

  const warning = useCallback((message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration,
      description: options?.description,
    })
  }, [])

  const loading = useCallback((message: string) => {
    return sonnerToast.loading(message)
  }, [])

  const dismiss = useCallback((id?: string | number) => {
    sonnerToast.dismiss(id)
  }, [])

  const promise = useCallback(<T,>(
    promiseArg: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promiseArg, {
      ...messages,
      duration: options?.duration,
    })
  }, [])

  return useMemo(() => ({
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    promise,
  }), [success, error, info, warning, loading, dismiss, promise])
}
