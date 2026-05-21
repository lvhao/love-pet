import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import PetAvatar from '../../components/PetAvatar'
import StatusBadge from '../../components/StatusBadge'
import Skeleton from '../../components/Skeleton'
import { useStore } from '../../data/store'
import { serviceTypes } from '../../data/mock'
import { ChevronRight, Search, X } from 'lucide-react'

const CURRENT_OWNER_ID = 'owner_1'

const STATUS_TABS = [
  { key: 'all', label: '全部', statuses: null },
  { key: 'pending', label: '待接单', statuses: ['pending'] },
  { key: 'in_progress', label: '进行中', statuses: ['accepted', 'in_progress', 'streaming'] },
  { key: 'completed', label: '已完成', statuses: ['completed'] },
  { key: 'cancelled', label: '已取消', statuses: ['cancelled'] },
]

const STATUS_PRIORITY = {
  streaming: 0,
  in_progress: 1,
  accepted: 2,
  pending: 3,
  completed: 4,
  cancelled: 5,
}

function parseOrderTime(value) {
  return new Date(value.replace(' ', 'T')).getTime()
}

export default function OwnerOrders() {
  const navigate = useNavigate()
  const { orders, pets } = useStore()
  const [activeTab, setActiveTab] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef(null)
  const [loading, setLoading] = useState(true)

  // Simulated loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Debounce search input by 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchText])

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

  const getProgressText = (order) => {
    if (order.status === 'pending') return '正在等待护理师接单'
    if (order.status === 'accepted') return `${order.caretakerName || '护理师'}已接单，待上门`
    if (order.status === 'in_progress') return `${order.caretakerName || '护理师'}正在服务`
    if (order.status === 'streaming') return '直播中，可进入查看'
    if (order.status === 'completed') return order.reportId ? '服务已完成，可查看报告' : '服务已完成'
    if (order.status === 'cancelled') return '订单已取消'
    return order.caretakerName ? `护理师: ${order.caretakerName}` : '等待接单'
  }

  // Filter by status tab
  const ownerOrders = orders
    .filter(o => o.ownerId === CURRENT_OWNER_ID)
    .sort((a, b) => {
      const priorityDiff = (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9)
      if (priorityDiff !== 0) return priorityDiff
      return parseOrderTime(b.scheduledAt) - parseOrderTime(a.scheduledAt)
    })
  const tabConfig = STATUS_TABS.find(t => t.key === activeTab)
  const statusFiltered = tabConfig && tabConfig.statuses
    ? ownerOrders.filter(o => tabConfig.statuses.includes(o.status))
    : ownerOrders

  // Filter by search text (service or pet name)
  const filtered = debouncedSearch.trim()
    ? statusFiltered.filter(o =>
        getServiceLabel(o).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        o.petName.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : statusFiltered

  return (
    <>
      <Layout title="我的订单">
        {/* Status filter tabs */}
        <div className="shop-chip-wrap px-4 pt-3 pb-2">
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'shop-chip-active'
                    : 'shop-chip-idle text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search input */}
        <div className="px-4 pb-2">
          <div className="shop-search relative flex items-center">
            <Search size={14} className="absolute left-3 text-text-tertiary" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜索服务或宠物"
              className="w-full pl-8 pr-8 py-2.5 rounded-full bg-transparent text-sm text-text placeholder:text-text-tertiary focus:outline-none"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-2.5 text-text-tertiary active:opacity-60 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Orders list */}
        <div className="px-4 mt-2 pb-6">
          {loading ? (
            <div className="shop-card divide-y divide-border overflow-hidden">
              {[0, 1, 2].map((i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton.Circle size={36} />
                      <div className="space-y-2">
                        <Skeleton.Text width="80px" height="14px" />
                        <Skeleton.Text width="100px" height="11px" />
                      </div>
                    </div>
                    <Skeleton.Text width="56px" height="20px" />
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                    <Skeleton.Text width="90px" height="12px" />
                    <div className="flex items-center gap-2">
                      <Skeleton.Text width="40px" height="14px" />
                      <Skeleton.Text width="14px" height="14px" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filtered.length === 0 && (
                <div className="shop-card py-12 text-center text-sm text-text-tertiary">
                  暂无订单
                </div>
              )}
              {filtered.length > 0 && (
                <div className="space-y-3">
                  {filtered.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => navigate(`/owner/order/${order.id}`)}
                      className="shop-card w-full p-4 text-left active:opacity-80 transition-opacity cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <PetAvatar type={getPetType(order)} photo={getPetPhoto(order)} name={order.petName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-text">{getServiceLabel(order)}</div>
                              <div className="mt-0.5 text-xs text-text-secondary">{order.petName} · {order.scheduledAt}</div>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
                            <div className={`text-xs font-medium ${order.status === 'streaming' ? 'text-danger' : 'text-text-secondary'}`}>
                              {order.status === 'streaming' && (
                                <span className="mr-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-live live-pulse align-middle" />
                              )}
                              {getProgressText(order)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-text">¥{order.price}</span>
                              <ChevronRight size={14} className="text-text-tertiary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
      <TabBar />
    </>
  )
}
