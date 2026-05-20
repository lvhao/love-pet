import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import PetAvatar from '../../components/PetAvatar'
import StatusBadge from '../../components/StatusBadge'
import Skeleton from '../../components/Skeleton'
import { useStore } from '../../data/store'
import { ChevronRight, Search, X } from 'lucide-react'

const STATUS_TABS = [
  { key: 'all', label: '全部', statuses: null },
  { key: 'pending', label: '待接单', statuses: ['pending'] },
  { key: 'in_progress', label: '进行中', statuses: ['accepted', 'in_progress', 'streaming'] },
  { key: 'completed', label: '已完成', statuses: ['completed'] },
  { key: 'cancelled', label: '已取消', statuses: ['cancelled'] },
]

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

  // Filter by status tab
  const tabConfig = STATUS_TABS.find(t => t.key === activeTab)
  const statusFiltered = tabConfig && tabConfig.statuses
    ? orders.filter(o => tabConfig.statuses.includes(o.status))
    : orders

  // Filter by search text (pet name or order ID)
  const filtered = debouncedSearch.trim()
    ? statusFiltered.filter(o =>
        o.petName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        o.id.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : statusFiltered

  return (
    <>
      <Layout title="我的订单">
        {/* Status filter tabs */}
        <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
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
              placeholder="搜索宠物名称或订单号"
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
                <div className="shop-card divide-y divide-border overflow-hidden">
                  {filtered.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => navigate(`/owner/order/${order.id}`)}
                      className="w-full p-4 text-left active:opacity-80 transition-opacity cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <PetAvatar type={getPetType(order)} size="sm" />
                          <div>
                            <span className="font-semibold text-sm">{order.petName}</span>
                            <div className="text-[11px] text-text-tertiary mt-0.5">{order.scheduledAt}</div>
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                        <div className="text-xs text-text-secondary">
                          {order.caretakerName ? `护理师: ${order.caretakerName}` : '等待接单'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text">¥{order.price}</span>
                          <ChevronRight size={14} className="text-text-tertiary" />
                        </div>
                      </div>
                      {order.status === 'streaming' && (
                        <div className="mt-2 flex items-center gap-1.5 text-danger text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-live rounded-full live-pulse" />
                          直播中 - 点击观看
                        </div>
                      )}
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
