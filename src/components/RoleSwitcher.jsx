import { useNavigate } from 'react-router-dom'
import { useRole } from '../hooks/useRole'

export default function RoleSwitcher() {
  const { role, setRole } = useRole()
  const navigate = useNavigate()

  const roles = [
    { key: 'owner', label: '宠主' },
    { key: 'caretaker', label: '护理师' },
    { key: 'operator', label: '运营' },
  ]

  const handleTabClick = (key) => {
    if (key === role) return
    setRole(key)
    navigate(`/${key}`)
  }

  return (
    <div className="role-switcher mx-4 my-3 p-1 rounded-full flex gap-1">
      {roles.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleTabClick(key)}
          className={`flex-1 py-1.5 text-xs rounded-full transition-all cursor-pointer ${
            role === key
              ? 'shop-chip-active'
              : 'shop-chip-idle text-text-secondary'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
