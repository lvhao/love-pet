import { statusLabels, statusColors } from '../data/mock'
import PropTypes from 'prop-types'

const statusClassNames = {
  pending: 'bg-gray-100 status-pending',
  accepted: 'bg-blue-100 status-accepted',
  in_progress: 'bg-yellow-100 status-progress',
  streaming: 'bg-red-100 status-streaming',
  completed: 'bg-green-100 status-completed',
  cancelled: 'bg-red-100 status-cancelled',
}

export default function StatusBadge({ status }) {
  const label = statusLabels[status] || status
  const color = statusColors[status] || statusColors.pending
  return (
    <span
      className={`status-badge px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusClassNames[status] || 'status-pending'}`}
      style={{ color, background: `${color}1a` }}
    >
      {label}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
}
