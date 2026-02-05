import { toast as sonnerToast } from 'sonner'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export interface ToastOptions {
  duration?: number
  description?: string
}

export function useToast() {
  const success = (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration,
      description: options?.description,
    })
  }

  const error = (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration,
      description: options?.description,
    })
  }

  const info = (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration,
      description: options?.description,
    })
  }

  const warning = (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration,
      description: options?.description,
    })
  }

  const loading = (message: string) => {
    return sonnerToast.loading(message)
  }

  const dismiss = (id?: string | number) => {
    sonnerToast.dismiss(id)
  }

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      ...messages,
      duration: options?.duration,
    })
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    promise,
  }
}
