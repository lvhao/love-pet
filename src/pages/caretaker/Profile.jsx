import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import { useRole } from '../../hooks/useRole'
import { useStore } from '../../data/store'
import { Star, ChevronRight, Briefcase, Wallet, Award, HelpCircle, Info } from 'lucide-react'

export default function CaretakerProfile() {
  const navigate = useNavigate()
  const { user } = useRole()
  const { addToast } = useStore()

  const menuItems = [
    { Icon: Briefcase, label: '服务记录', action: () => navigate('/caretaker/history') },
    { Icon: Wallet, label: '收入明细', action: () => addToast('收入明细功能即将上线', 'info') },
    { Icon: Award, label: '技能认证', action: () => addToast('技能认证功能即将上线', 'info') },
    { Icon: HelpCircle, label: '帮助中心', action: () => addToast('帮助中心即将上线', 'info') },
    { Icon: Info, label: '关于宠管家', action: () => addToast('关于页面即将上线', 'info') },
  ]

  return (
    <>
      <Layout title="我的">
        <div className="px-4 py-4 space-y-4">
          <div className="shop-card p-5">
            <div className="flex items-center gap-4">
              <div className="shop-promo-icon w-16 h-16 flex items-center justify-center text-xl font-heading font-bold">
                {user.name[0]}
              </div>
              <div className="flex-1">
                <div className="font-heading font-semibold text-lg">{user.name}</div>
                <div className="text-xs text-text-secondary mt-0.5">{user.phone}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span className="font-semibold">{user.rating}</span>
                  </div>
                  <div className="text-xs text-text-tertiary">已完成 {user.completedOrders} 单</div>
                </div>
              </div>
            </div>
            {user.bio && (
              <div className="mt-3 pt-3 border-t border-border text-xs text-text-secondary">{user.bio}</div>
            )}
          </div>

          <div className="shop-card divide-y divide-border overflow-hidden">
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
