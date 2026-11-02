import { CheckCircle, XCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
}

export function Toast({ message, type }: ToastProps) {
  return (
    <div className={type === 'success' ? 'toast-success' : 'toast-error'}>
      {type === 'success' ? (
        <CheckCircle size={16} />
      ) : (
        <XCircle size={16} />
      )}
      {message}
    </div>
  )
}
