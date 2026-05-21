import { useStore } from '../data/store'

const typeStyles = {
  success: { icon: '✓' },
  error: { icon: '✕' },
  warning: { icon: '⚠' },
  info: { icon: '' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useStore()

  if (toasts.length === 0) return null

  return (
    <div className="toast-stack">
      {toasts.map(toast => {
        const style = typeStyles[toast.type] || typeStyles.info
        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`toast-item toast-${toast.type || 'info'}`}
            role="status"
          >
            {style.icon && <span className="toast-icon">{style.icon}</span>}
            <span className="toast-message">{toast.message}</span>
          </div>
        )
      })}
    </div>
  )
}
