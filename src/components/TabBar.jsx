import { useNavigate, useLocation } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import { Home, ClipboardList, ShoppingBag, User, Briefcase, BarChart3, Settings } from 'lucide-react'

const ownerTabs = [
  { path: '/owner', label: '首页', Icon: Home },
  { path: '/owner/shop', label: '商城', Icon: ShoppingBag },
  { path: '/owner/orders', label: '订单', Icon: ClipboardList },
  { path: '/owner/profile', label: '我的', Icon: User },
]

const caretakerTabs = [
  { path: '/caretaker', label: '工作台', Icon: Briefcase },
  { path: '/caretaker/history', label: '记录', Icon: BarChart3 },
  { path: '/caretaker/profile', label: '我的', Icon: User },
]

const operatorTabs = [
  { path: '/operator', label: '管理', Icon: Settings },
  { path: '/operator/profile', label: '我的', Icon: User },
]

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useRole()
  const tabs = role === 'owner' ? ownerTabs : role === 'caretaker' ? caretakerTabs : operatorTabs

  return (
    <nav className="app-tabbar sticky bottom-0 z-50 bg-surface border-t border-border flex pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ path, label, Icon }, index) => {
        const active = index === 0
          ? location.pathname === path
          : location.pathname.startsWith(path)
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center py-1.5 cursor-pointer ${
              active ? 'app-tab-active' : 'text-text-tertiary'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.4} />
            <span className={`text-[10px] mt-0.5 ${active ? 'font-medium' : ''}`}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
