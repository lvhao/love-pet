import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import { useStore } from '../../data/store'
import { useRole } from '../../hooks/useRole'
import { ChevronRight, ClipboardList, PawPrint, Gift, MapPin, HelpCircle, Info, LogOut, Edit3, X } from 'lucide-react'

export default function OwnerProfile() {
  const navigate = useNavigate()
  const { user, setRole } = useRole()
  const { addToast } = useStore()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showEditNickname, setShowEditNickname] = useState(false)
  const [nickname, setNickname] = useState(user.name)

  const menuItems = [
    { Icon: ClipboardList, label: '我的订单', path: '/owner/orders' },
    { Icon: PawPrint, label: '我的宠物', path: '/owner/pets' },
    { Icon: Gift, label: '优惠券', action: () => addToast('优惠券功能即将上线') },
    { Icon: MapPin, label: '地址管理', path: '/owner/addresses' },
    { Icon: HelpCircle, label: '帮助中心', action: () => addToast('帮助中心即将上线') },
    { Icon: Info, label: '关于宠上门', action: () => addToast('关于页面即将上线') },
  ]

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    setRole('owner')
    navigate('/')
  }

  const handleSaveNickname = () => {
    if (!nickname.trim()) {
      addToast('昵称不能为空', 'error')
      return
    }
    setShowEditNickname(false)
    addToast('昵称已更新（演示）', 'success')
  }

  return (
    <>
      <Layout title="我的">
        <div className="px-4 py-4 space-y-4">
          <div className="shop-card p-5 flex items-center gap-4">
            <div className="shop-promo-icon w-16 h-16 flex items-center justify-center text-xl font-heading font-bold">
              {user.name[0]}
            </div>
            <div className="flex-1">
              <div className="font-heading font-semibold text-lg">{user.name}</div>
              <div className="text-xs text-text-secondary mt-0.5">{user.phone}</div>
            </div>
            <button
              onClick={() => { setNickname(user.name); setShowEditNickname(true) }}
              className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer"
            >
              <Edit3 size={14} className="text-text-secondary" />
            </button>
          </div>

          <div className="shop-card divide-y divide-border overflow-hidden">
            {menuItems.map(({ Icon, label, path, action }) => (
              <button
                key={label}
                onClick={() => {
                  if (path) navigate(path)
                  else if (action) action()
                }}
                className="w-full flex items-center px-4 py-3.5 text-sm active:opacity-80 transition-opacity cursor-pointer"
              >
                <Icon size={18} className="text-text-tertiary" />
                <span className="flex-1 ml-3 text-left">{label}</span>
                <ChevronRight size={16} className="text-text-tertiary" />
              </button>
            ))}
          </div>

          {/* Logout button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="shop-card w-full px-4 py-3.5 text-sm text-danger font-medium flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
          >
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      </Layout>
      <TabBar />

      {/* Edit Nickname Modal */}
      {showEditNickname && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowEditNickname(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-surface rounded-2xl p-5 w-72 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">编辑昵称</div>
              <button onClick={() => setShowEditNickname(false)} className="w-8 h-8 flex items-center justify-center cursor-pointer">
                <X size={16} className="text-text-tertiary" />
              </button>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditNickname(false)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium shop-secondary-action active:opacity-80 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveNickname}
                className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium active:opacity-80 cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowLogoutConfirm(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-surface rounded-2xl p-5 w-72 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-base font-semibold text-center">确认退出</div>
            <div className="text-sm text-text-secondary text-center">确认要退出登录吗？</div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium shop-secondary-action active:opacity-80 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-danger text-white active:opacity-80 cursor-pointer"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
