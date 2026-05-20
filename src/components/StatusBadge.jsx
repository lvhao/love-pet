import { statusLabels, statusColors } from '../data/mock'
import PropTypes from 'prop-types'

const statusClassNames = {
  pending: 'bg-gray-100',
  accepted: 'bg-blue-100',
  in_progress: 'bg-yellow-100',
  completed: 'bg-green-100',
  cancelled: 'bg-red-100',
}

export default function StatusBadge({ status }) {
  const label = statusLabels[status] || status
  const color = statusColors[status] || statusColors.pending
  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusClassNames[status] || 'bg-gray-100'}`}
      style={{ color, background: `${color}1a` }}
    >
      {label}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
}
