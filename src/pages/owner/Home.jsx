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
import { UtensilsCrossed, Dog, ShowerHead, ChevronRight, ShieldCheck, ClipboardCheck, Video } from 'lucide-react'

const serviceIcons = { feeding: UtensilsCrossed, feeding_walk: Dog, feeding_grooming: ShowerHead }

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

  const getPetPhoto = (order) => {
    const pet = pets.find(p => p.id === order.petId)
    return pet?.photo || ''
  }

  return (
    <>
      <Layout title="宠管家">
        <RoleSwitcher />

        {/* Brand Promise */}
        <div className="px-4 mt-4">
          <section className="shop-promo">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-primary">宠管家上门护理</div>
                <h2 className="mt-1 text-[19px] font-semibold leading-snug text-text">
                  上门放心，过程看得见
                </h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-text-secondary">
                  护理师身份核验，按流程服务，完成后留下图文记录。
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <ShieldCheck size={21} className="text-primary" strokeWidth={1.8} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
              {[
                { Icon: ShieldCheck, label: '身份核验' },
                { Icon: Video, label: '过程追踪' },
                { Icon: ClipboardCheck, label: '图文记录' },
              ].map(({ Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                  <Icon size={13} className="text-primary" strokeWidth={1.9} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Service Types */}
        <div className="px-4 mt-6">
          <section className="order-section p-4">
            <div>
              <h3 className="text-base font-semibold text-text">选择上门服务</h3>
              <p className="mt-0.5 text-xs text-text-tertiary">先选服务，下一步确认宠物、地址和上门时间</p>
            </div>
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
                  return (
                    <button
                      key={s.key}
                      onClick={() => navigate('/owner/order/new', { state: { serviceType: s.key } })}
                      className={`order-option w-full rounded-2xl p-3.5 flex items-center gap-3.5 active:opacity-80 transition-all cursor-pointer stagger-${i + 1}`}
                    >
                      <div className="order-icon-soft w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-primary" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-semibold text-text">{s.label}</div>
                        <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">{s.desc}</div>
                      </div>
                      <div className="text-base font-bold shop-price">¥{s.price}</div>
                      <ChevronRight size={14} className="text-text-tertiary shrink-0" />
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Active Orders */}
        <div className="px-4 mt-8 mb-6">
          <h3 className="text-[17px] font-semibold">订单进度</h3>
          {loading ? (
            <div className="mt-3 divide-y divide-border">
              <Skeleton.OrderRow />
              <Skeleton.OrderRow />
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-8 mt-3">
              <div className="text-[13px] text-text-tertiary">暂无进行中的预约</div>
            </div>
          ) : (
            <div className="shop-card mt-3 divide-y divide-border overflow-hidden">
              {activeOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/owner/order/${order.id}`)}
                  className="w-full py-3 px-4 text-left flex items-center gap-3 active:opacity-60 transition-opacity cursor-pointer first:rounded-t-xl last:rounded-b-xl"
                >
                  <PetAvatar type={getPetType(order)} photo={getPetPhoto(order)} name={order.petName} size="sm" />
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
