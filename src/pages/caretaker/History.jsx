import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import PetAvatar from '../../components/PetAvatar'
import { useStore } from '../../data/store'
import { serviceTypes } from '../../data/mock'
import { CalendarDays, CheckCircle2, ChevronRight, MapPin, PawPrint, Search, X } from 'lucide-react'

const CURRENT_CARETAKER_ID = 'ct_1'

const TIME_FILTERS = [
  { key: 'all', label: '全部' },
  { key: '7d', label: '近7天' },
  { key: 'month', label: '本月' },
]

function parseOrderTime(value) {
  return new Date(value.replace(' ', 'T')).getTime()
}

function isInTimeRange(order, timeFilter) {
  if (timeFilter === 'all') return true

  const orderTime = parseOrderTime(order.scheduledAt)
  const now = new Date('2026-05-21T12:00:00')

  if (timeFilter === '7d') {
    const start = new Date(now)
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return orderTime >= start.getTime() && orderTime <= now.getTime()
  }

  if (timeFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()
    return orderTime >= start && orderTime < end
  }

  return true
}

export default function CaretakerHistory() {
  const navigate = useNavigate()
  const { orders, pets } = useStore()
  const [query, setQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')

  const getPetType = (order) => {
    const pet = pets.find(p => p.id === order.petId)
    return pet ? pet.type : 'cat'
  }

  const getPetPhoto = (order) => {
    const pet = pets.find(p => p.id === order.petId)
    return pet?.photo || ''
  }

  const getServiceLabel = (order) => {
    return serviceTypes.find(service => service.key === order.serviceType)?.label || '上门护理'
  }

  const completed = useMemo(() => {
    return orders
      .filter((o) => o.caretakerId === CURRENT_CARETAKER_ID && o.status === 'completed')
      .sort((a, b) => parseOrderTime(b.scheduledAt) - parseOrderTime(a.scheduledAt))
  }, [orders])

  const filtered = completed.filter((order) => {
    const keyword = query.trim().toLowerCase()
    const matchesQuery = !keyword ||
      getServiceLabel(order).toLowerCase().includes(keyword) ||
      order.petName.toLowerCase().includes(keyword) ||
      order.address.toLowerCase().includes(keyword)
    const matchesService = serviceFilter === 'all' || order.serviceType === serviceFilter

    return matchesQuery && matchesService && isInTimeRange(order, timeFilter)
  })

  const income = filtered.reduce((sum, order) => sum + order.price, 0)

  return (
    <>
      <Layout title="服务记录" showBack onBack={() => navigate('/caretaker')}>
        <div className="px-4 py-4">
          {completed.length === 0 ? (
            <div className="shop-card text-center text-text-tertiary py-10 text-sm flex flex-col items-center gap-2">
              <PawPrint size={28} className="text-text-tertiary" />
              还没有服务记录，接单后这里会显示
            </div>
          ) : (
            <div className="space-y-3">
              <div className="shop-card p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-text-tertiary">查询结果</div>
                    <div className="mt-1 text-2xl font-heading text-text">{filtered.length}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-tertiary">服务收入</div>
                    <div className="mt-1 text-2xl font-heading text-text">¥{income}</div>
                  </div>
                </div>
                <div className="shop-search relative mt-4 flex items-center">
                  <Search size={14} className="absolute left-3 text-text-tertiary" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜宠物、服务或地址"
                    className="w-full rounded-full bg-transparent py-2.5 pl-8 pr-8 text-sm text-text placeholder:text-text-tertiary focus:outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 cursor-pointer text-text-tertiary active:opacity-60"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="shop-chip-wrap">
                {TIME_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setTimeFilter(filter.key)}
                    className={`shop-chip rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      timeFilter === filter.key ? 'shop-chip-active' : 'shop-chip-idle text-text-secondary'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="shop-chip-wrap">
                <button
                  onClick={() => setServiceFilter('all')}
                  className={`shop-chip rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    serviceFilter === 'all' ? 'shop-chip-active' : 'shop-chip-idle text-text-secondary'
                  }`}
                >
                  全部服务
                </button>
                {serviceTypes.map((service) => (
                  <button
                    key={service.key}
                    onClick={() => setServiceFilter(service.key)}
                    className={`shop-chip rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      serviceFilter === service.key ? 'shop-chip-active' : 'shop-chip-idle text-text-secondary'
                    }`}
                  >
                    {service.label}
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="shop-card py-10 text-center text-sm text-text-tertiary">
                  没有符合条件的服务记录
                </div>
              )}

            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/caretaker/order/${order.id}`)}
                className="shop-card w-full p-4 text-left active:opacity-80 transition-opacity cursor-pointer overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-0.5">
                    <PetAvatar type={getPetType(order)} photo={getPetPhoto(order)} name={order.petName} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold leading-6 text-text">{order.petName}</div>
                        <div className="mt-0.5 text-xs font-medium text-primary">{getServiceLabel(order)}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-lg font-bold leading-6 text-text">+¥{order.price}</div>
                        <div className="text-[11px] leading-4 text-text-tertiary">服务收入</div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-1.5 rounded-xl bg-bg/80 p-3 text-xs text-text-secondary">
                      <div className="flex min-w-0 items-center gap-2">
                        <CalendarDays size={13} className="shrink-0 text-primary" />
                        <span className="truncate">{order.scheduledAt}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <MapPin size={13} className="shrink-0 text-text-tertiary" />
                        <span className="truncate">{order.address}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                        <CheckCircle2 size={13} />
                        报告已生成
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-text-tertiary">
                        查看详情
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
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
