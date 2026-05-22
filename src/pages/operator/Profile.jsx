import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import ThemeToggle from '../../components/ThemeToggle'
import { useStore } from '../../data/store'
import { mockOperator } from '../../data/shop'
import { ChevronRight, Settings, HelpCircle, Info, Bell, ShieldCheck } from 'lucide-react'

export default function OperatorProfile() {
  const { addToast } = useStore()

  const menuItems = [
    { Icon: Bell, label: '消息通知', action: () => addToast('消息通知功能即将上线') },
    { Icon: ShieldCheck, label: '权限与安全', action: () => addToast('权限设置功能即将上线') },
    { Icon: Settings, label: '系统设置', action: () => addToast('系统设置功能即将上线') },
    { Icon: HelpCircle, label: '帮助中心', action: () => addToast('帮助中心即将上线') },
    { Icon: Info, label: '关于宠管家', action: () => addToast('关于页面即将上线') },
  ]

  return (
    <>
      <Layout title="我的">
        <div className="px-4 py-4 space-y-4">
          <div className="shop-card p-5 flex items-center gap-4">
            <div className="shop-promo-icon w-16 h-16 flex items-center justify-center text-xl font-heading font-bold">
              {mockOperator.name[0]}
            </div>
            <div className="flex-1">
              <div className="font-heading font-semibold text-lg">{mockOperator.name}</div>
              <div className="text-xs text-text-secondary mt-0.5">{mockOperator.phone}</div>
              <div className="text-xs text-primary font-medium mt-1">运营管理员</div>
            </div>
          </div>

          <div className="shop-card divide-y divide-border overflow-hidden">
            <ThemeToggle />
            {menuItems.map(({ Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center px-4 py-3.5 text-sm active:opacity-80 transition-opacity cursor-pointer"
              >
                <Icon size={18} className="text-text-tertiary" />
                <span className="flex-1 ml-3 text-left">{label}</span>
                <ChevronRight size={16} className="text-text-tertiary" />
              </button>
            ))}
          </div>
        </div>
      </Layout>
      <TabBar />
    </>
  )
}
