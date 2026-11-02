import { useState, useCallback } from 'react'

type ToastType = 'success' | 'error'

interface Toast {
  message: string
  type: ToastType
  id: number
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { message, type, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return { toasts, showToast }
}
