import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const Icon = isDark ? Moon : Sun

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-full flex items-center px-4 py-3.5 text-sm active:opacity-80 transition-opacity cursor-pointer"
      aria-pressed={isDark}
    >
      <Icon size={18} className="text-text-tertiary" />
      <span className="flex-1 ml-3 text-left">夜间模式</span>
      <span className={`theme-switch ${isDark ? 'theme-switch-on' : ''}`} aria-hidden="true">
        <span />
      </span>
    </button>
  )
}
