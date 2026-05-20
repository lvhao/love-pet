import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import RoleSwitcher from '../../components/RoleSwitcher'
import PetAvatar from '../../components/PetAvatar'
import StatusBadge from '../../components/StatusBadge'
import Skeleton from '../../components/Skeleton'
import { useStore } from '../../data/store'
import { serviceTypes } from '../../data/mock'
import { UtensilsCrossed, Dog, ShowerHead, Video, ChevronRight, ShieldCheck } from 'lucide-react'
import Logo from '../../components/Logo'

const serviceIcons = { feeding: UtensilsCrossed, feeding_walk: Dog, feeding_grooming: ShowerHead }
const serviceColors = {
  feeding: { bg: 'bg-feeding', light: 'bg-feeding-50' },
  feeding_walk: { bg: 'bg-walking', light: 'bg-walking-50' },
  feeding_grooming: { bg: 'bg-grooming', light: 'bg-grooming-50' },
}

export default function OwnerHome() {
  const navigate = useNavigate()
  const { orders, pets } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled')

  const getPetType = (order) => {
    const pet = pets.find(p => p.id === order.petId)
    return pet ? pet.type : 'cat'
  }

  return (
    <>
      <Layout title="宠管家">
        <RoleSwitcher />

        {/* Hero */}
        <div className="shop-promo mx-4 mt-3 relative overflow-hidden">
          <div className="shop-art-orbit shop-art-orbit-one" />
          <div className="shop-art-orbit shop-art-orbit-two" />
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[22px] font-semibold shop-price">宠管家</span>
          </div>
          <p className="text-[13px] text-text-secondary mt-1">让你看见爱在发生</p>
          <button
            onClick={() => navigate('/owner/order/new')}
            className="mt-4 btn-primary font-medium px-5 py-2 rounded-lg text-[14px] active:opacity-80 transition-opacity cursor-pointer card-shadow-sm"
          >
            立即下单
          </button>
        </div>

        {/* Trust */}
        <div className="mx-4 mt-4 flex items-center gap-3 text-[12px] text-text-secondary">
          <div className="shop-chip-idle flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <Video size={13} className="text-primary" />
            <span>实时看护</span>
          </div>
          <div className="shop-chip-idle flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <ShieldCheck size={13} className="text-primary" />
            <span>专业SOP服务</span>
          </div>
        </div>

        {/* Service Types */}
        <div className="px-4 mt-6">
          <h3 className="text-[17px] font-semibold">今天需要什么帮助？</h3>
          {loading ? (
            <div className="mt-3 space-y-2">
              <Skeleton.Card />
              <Skeleton.Card />
              <Skeleton.Card />
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {serviceTypes.map((s, i) => {
                const Icon = serviceIcons[s.key]
                const colors = serviceColors[s.key]
                return (
                  <button
                    key={s.key}
                    onClick={() => navigate('/owner/order/new', { state: { serviceType: s.key } })}
                    className={`shop-card w-full p-3.5 flex items-center gap-3.5 active:opacity-85 transition-opacity cursor-pointer stagger-${i + 1}`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <Icon size={18} className="text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[14px] font-medium">{s.label}</div>
                      <div className="text-[12px] text-text-secondary">{s.desc}</div>
                    </div>
                    <div className="text-[14px] font-semibold text-text">¥{s.price}<span className="text-[10px] text-text-tertiary">/次</span></div>
                    <ChevronRight size={14} className="text-text-tertiary" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Active Orders */}
        <div className="px-4 mt-8 mb-6">
          <h3 className="text-[17px] font-semibold">正在照顾中</h3>
          {loading ? (
            <div className="mt-3 divide-y divide-border">
              <Skeleton.OrderRow />
              <Skeleton.OrderRow />
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-8 mt-3">
              <div className="text-[13px] text-text-tertiary">毛孩子们都在乖乖等着呢</div>
            </div>
          ) : (
            <div className="shop-card mt-3 divide-y divide-border overflow-hidden">
              {activeOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/owner/order/${order.id}`)}
                  className="w-full py-3 px-4 text-left flex items-center gap-3 active:opacity-60 transition-opacity cursor-pointer first:rounded-t-xl last:rounded-b-xl"
                >
                  <PetAvatar type={getPetType(order)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium">{order.petName}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-[12px] text-text-tertiary mt-0.5 truncate">
                      {order.scheduledAt} · {order.address.slice(0, 12)}...
                    </div>
                    {order.status === 'streaming' && (
                      <div className="mt-1 flex items-center gap-1.5 text-primary text-[12px] font-medium">
                        <span className="w-1.5 h-1.5 bg-live rounded-full live-pulse" />
                        直播中 — 点击观看
                      </div>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-text-tertiary" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Layout>
      <TabBar />
    </>
  )
}
