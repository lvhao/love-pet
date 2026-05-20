import { useStore } from '../data/store'

const typeStyles = {
  success: { background: '#d1fae5', color: '#065f46', icon: '✓' },
  error: { background: '#fee2e2', color: '#991b1b', icon: '✕' },
  warning: { background: '#fef3c7', color: '#92400e', icon: '⚠' },
  info: { background: '#dbeafe', color: '#1e40af', icon: 'ℹ' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useStore()

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, width: '90%', maxWidth: 360,
    }}>
      {toasts.map(toast => {
        const style = typeStyles[toast.type] || typeStyles.info
        return (
          <div key={toast.id} onClick={() => removeToast(toast.id)} style={{
            background: style.background, color: style.color,
            padding: '12px 16px', borderRadius: 8, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer',
            animation: 'slideIn 0.3s ease',
          }}>
            <span style={{ fontSize: 16 }}>{style.icon}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        )
      })}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
