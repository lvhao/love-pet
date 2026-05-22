import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import RoleSwitcher from '../../components/RoleSwitcher'
import PetAvatar from '../../components/PetAvatar'
import StatusBadge from '../../components/StatusBadge'
import { useStore } from '../../data/store'
import { mockUsers, serviceTypes } from '../../data/mock'
import { ClipboardList, TrendingUp, CheckCircle, ChevronRight, PawPrint, Clock, MapPin, Navigation } from 'lucide-react'

const CURRENT_CARETAKER_ID = 'ct_1'
const CURRENT_CARETAKER_NAME = '李姐'
const ACTIVE_STATUSES = ['accepted', 'in_progress', 'streaming']
const ACTIVE_STATUS_PRIORITY = { streaming: 0, in_progress: 1, accepted: 2 }
const DEFAULT_LOCATION = mockUsers.caretaker.currentLocation

function getDistanceKm(from, to) {
  if (!from || !to) return null
  const latKm = (to.lat - from.lat) * 111
  const lngKm = (to.lng - from.lng) * 111 * Math.cos(((from.lat + to.lat) / 2) * Math.PI / 180)
  return Math.sqrt(latKm * latKm + lngKm * lngKm)
}

function formatDistance(km) {
  if (km == null) return '距离待定位'
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

function getEta(distanceKm) {
  if (distanceKm == null) return '预计时间待定位'
  return `约${Math.max(5, Math.round(distanceKm / 0.35) * 5)}分钟`
}

export default function CaretakerDashboard() {
  const navigate = useNavigate()
  const { orders, pets, updateOrderStatus, addToast } = useStore()
  const [confirmOrderId, setConfirmOrderId] = useState(null)
  const [activeTaskType, setActiveTaskType] = useState('current')

  const active = orders
    .filter((o) => o.caretakerId === CURRENT_CARETAKER_ID && ACTIVE_STATUSES.includes(o.status))
    .sort((a, b) => ACTIVE_STATUS_PRIORITY[a.status] - ACTIVE_STATUS_PRIORITY[b.status])
  const currentOrder = active[0]
  const completed = orders.filter((o) => o.caretakerId === CURRENT_CARETAKER_ID && o.status === 'completed')
  const canAcceptNewOrder = !currentOrder
  const distanceOrigin = currentOrder?.location || DEFAULT_LOCATION
  const distanceMode = currentOrder ? 'after-current' : 'current'
  const availablePending = orders
    .filter((o) => o.status === 'pending' && !o.caretakerId)
    .map((order) => {
      const distanceKm = getDistanceKm(distanceOrigin, order.location)
      return { ...order, distanceKm, eta: getEta(distanceKm) }
    })
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
  const taskGroups = [
    { key: 'current', label: '当前服务', count: currentOrder ? 1 : 0, Icon: TrendingUp, detailPath: '/caretaker/stats/current' },
    { key: 'available', label: '可接任务', count: availablePending.length, Icon: ClipboardList, detailPath: '/caretaker/stats/available' },
    { key: 'completed', label: '已完成', count: completed.length, Icon: CheckCircle, detailPath: '/caretaker/stats/completed' },
  ]
  const activeTask = taskGroups.find((item) => item.key === activeTaskType) || taskGroups[0]

  const getServiceLabel = (order) => {
    return serviceTypes.find((service) => service.key === order.serviceType)?.label || '上门护理'
  }

  const getPet = (order) => {
    return pets.find((pet) => pet.id === order.petId)
  }

  const handleAccept = (orderId) => {
    if (!canAcceptNewOrder) {
      addToast('请先完成当前服务，再接新任务', 'info')
      return
    }
    setConfirmOrderId(orderId)
  }

  const confirmAccept = (orderId) => {
    const ok = updateOrderStatus(orderId, 'accepted', {
      caretakerId: CURRENT_CARETAKER_ID,
      caretakerName: CURRENT_CARETAKER_NAME,
    })
    if (ok) {
      addToast('已接受订单', 'success')
    } else {
      addToast('接受订单失败', 'error')
    }
    setConfirmOrderId(null)
  }

  const cancelConfirm = () => {
    setConfirmOrderId(null)
  }

  return (
    <>
      <Layout title="宠管家 · 护理师">
        <RoleSwitcher />

        <div className="px-4 mt-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">任务</h3>
            <button
              onClick={() => navigate(activeTask.detailPath)}
              className="text-[11px] font-medium text-primary active:opacity-80 cursor-pointer"
            >
              数据详情
            </button>
          </div>
          <div className="shop-card p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {taskGroups.map(({ key, label, count, Icon }) => {
                const active = activeTaskType === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTaskType(key)}
                    className={`min-w-0 rounded-xl border px-2 py-2 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-primary bg-primary-50 text-primary shadow-sm'
                        : 'border-transparent bg-bg text-text-secondary'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className={`text-2xl font-heading font-bold leading-none ${active ? 'text-primary' : 'text-text'}`}>{count}</div>
                      <Icon size={14} className={`mt-0.5 ${active ? 'text-primary' : 'text-text-tertiary'}`} />
                    </div>
                    <div className="mt-1 truncate text-[11px] font-medium">{label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 mb-6">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text">{activeTask.label}</div>
                <div className="mt-0.5 truncate text-[11px] text-text-tertiary">
                  {activeTaskType === 'current'
                    ? '正在履约的服务，优先处理'
                    : activeTaskType === 'available'
                      ? distanceMode === 'current' ? `按${DEFAULT_LOCATION.label}距离排序` : '按当前服务点估算顺路距离'
                      : '已完成服务记录'}
                </div>
              </div>
              <div className="shrink-0 text-[11px] text-text-tertiary">
                {activeTask.count} 项
              </div>
            </div>

            {activeTaskType === 'current' && (!currentOrder ? (
              <div className="text-center py-12">
                <PawPrint size={32} className="text-text-tertiary mx-auto mb-2" />
                <div className="text-sm text-text-tertiary">当前没有进行中的服务</div>
              </div>
            ) : (
              <button
                onClick={() => navigate(`/caretaker/execute/${currentOrder.id}`)}
                className="shop-card w-full p-4 text-left active:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <PetAvatar
                    type={getPet(currentOrder)?.type || 'cat'}
                    photo={getPet(currentOrder)?.photo || ''}
                    name={currentOrder.petName}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold leading-6 text-text">{getServiceLabel(currentOrder)}</div>
                        <div className="mt-0.5 text-xs text-text-secondary">{currentOrder.petName}</div>
                      </div>
                      <StatusBadge status={currentOrder.status} />
                    </div>
                    <div className="mt-3 grid gap-1.5 rounded-xl bg-bg/80 p-3 text-xs text-text-secondary">
                      <div className="flex min-w-0 items-center gap-2">
                        <Clock size={13} className="shrink-0 text-primary" />
                        <span className="truncate">{currentOrder.scheduledAt}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <MapPin size={13} className="shrink-0 text-text-tertiary" />
                        <span className="truncate">{currentOrder.address}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-medium text-primary">
                      <span>{currentOrder.status === 'streaming' ? '正在直播，进入继续服务' : '进入当前服务流程'}</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {activeTaskType === 'available' && (availablePending.length === 0 ? (
              <div className="text-center py-12">
                <PawPrint size={32} className="text-text-tertiary mx-auto mb-2" />
                <div className="text-sm text-text-tertiary">暂时没有新任务，休息一下吧</div>
              </div>
            ) : (
              <div className="space-y-3">
                {availablePending.map((order) => (
                  <div key={order.id} className="shop-card p-4 overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <PetAvatar
                        type={getPet(order)?.type || 'cat'}
                        photo={getPet(order)?.photo || ''}
                        name={order.petName}
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold leading-6 text-text">{getServiceLabel(order)}</div>
                          <div className="text-xs text-text-secondary">{order.petName}</div>
                        </div>
                        <div className="flex-shrink-0">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      <div className="mt-2 text-xs leading-5 text-text-secondary">
                        <div className="font-medium text-text-secondary">{order.scheduledAt}</div>
                        <div className="truncate text-text-tertiary">{order.address}</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary">
                          {distanceMode === 'current' ? '距你' : '服务后距你'} {formatDistance(order.distanceKm)}
                        </span>
                        <span className="rounded-full bg-bg px-2 py-1 text-[11px] text-text-secondary">
                          {order.eta}
                        </span>
                        {order.distanceKm != null && order.distanceKm <= 3 && (
                          <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-walking">顺路优先</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <button
                      onClick={() => handleAccept(order.id)}
                      disabled={!canAcceptNewOrder}
                      className={`h-10 rounded-lg text-sm font-semibold transition-opacity ${
                        canAcceptNewOrder
                          ? 'btn-primary active:opacity-80 cursor-pointer'
                          : 'cursor-not-allowed bg-border text-text-tertiary'
                      }`}
                    >
                      {canAcceptNewOrder ? '接单' : '服务中'}
                    </button>
                    <button
                      onClick={() => navigate(`/caretaker/order/${order.id}`)}
                      className="btn-default h-10 rounded-lg px-5 text-sm font-medium active:opacity-80 transition-opacity cursor-pointer"
                    >
                      详情
                    </button>
                  </div>
                  </div>
                ))}
              </div>
            ))}

            {activeTaskType === 'completed' && (completed.length === 0 ? (
              <div className="text-center py-12">
                <PawPrint size={32} className="text-text-tertiary mx-auto mb-2" />
                <div className="text-sm text-text-tertiary">还没有已完成服务</div>
              </div>
            ) : (
              <div className="shop-card divide-y divide-border overflow-hidden">
                {completed.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/caretaker/order/${order.id}`)}
                    className="block w-full px-4 py-3 text-left active:bg-bg cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text">{getServiceLabel(order)}</div>
                        <div className="mt-1 text-xs text-text-secondary">{order.petName} · {order.scheduledAt}</div>
                        <div className="mt-1 truncate text-[11px] text-text-tertiary">{order.address}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold text-text">¥{order.price}</div>
                        <div className="mt-1 text-[11px] text-primary">详情</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Layout>
      <TabBar />

      {/* Confirmation Dialog */}
      {confirmOrderId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={cancelConfirm}>
          <div className="shop-card p-6 mx-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-text mb-2">确认接单</h3>
            <p className="text-sm text-text-secondary mb-5">确认接受此订单？接受后请按时上门服务。</p>
            <div className="flex gap-3">
              <button
                onClick={cancelConfirm}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium btn-default active:opacity-80 transition-opacity cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => confirmAccept(confirmOrderId)}
                className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-semibold active:opacity-80 transition-opacity cursor-pointer"
              >
                确认接受
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
