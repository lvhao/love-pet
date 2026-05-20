import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import RoleSwitcher from '../../components/RoleSwitcher'
import PetAvatar from '../../components/PetAvatar'
import StatusBadge from '../../components/StatusBadge'
import { useStore } from '../../data/store'
import { ClipboardList, TrendingUp, CheckCircle, ChevronRight, PawPrint } from 'lucide-react'

export default function CaretakerDashboard() {
  const navigate = useNavigate()
  const { orders, updateOrderStatus, addToast } = useStore()
  const [confirmOrderId, setConfirmOrderId] = useState(null)

  const pending = orders.filter((o) => o.status === 'pending')
  const active = orders.filter((o) => ['accepted', 'in_progress', 'streaming'].includes(o.status))
  const completed = orders.filter((o) => o.status === 'completed')

  const handleAccept = (orderId) => {
    setConfirmOrderId(orderId)
  }

  const confirmAccept = (orderId) => {
    const ok = updateOrderStatus(orderId, 'accepted')
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

        {/* Stats */}
        <div className="mx-4 mt-2 grid grid-cols-3 gap-2">
          <div className="shop-card p-3 text-center">
            <ClipboardList size={18} className="text-primary mx-auto mb-1.5" />
            <div className="text-2xl font-heading text-text">{pending.length}</div>
            <div className="text-[11px] text-text-secondary mt-0.5">新任务来了</div>
          </div>
          <div className="shop-card p-3 text-center">
            <TrendingUp size={18} className="text-primary mx-auto mb-1.5" />
            <div className="text-2xl font-heading text-text">{active.length}</div>
            <div className="text-[11px] text-text-secondary mt-0.5">你正在照顾</div>
          </div>
          <div className="shop-card p-3 text-center">
            <CheckCircle size={18} className="text-primary mx-auto mb-1.5" />
            <div className="text-2xl font-heading text-text">{completed.length}</div>
            <div className="text-[11px] text-text-secondary mt-0.5">已完成</div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="px-4 mt-6">
          <h3 className="text-sm font-semibold text-text mb-3">新任务来了</h3>
          {pending.length === 0 ? (
            <div className="text-center py-12">
              <PawPrint size={32} className="text-text-tertiary mx-auto mb-2" />
              <div className="text-sm text-text-tertiary">暂时没有新任务，休息一下吧</div>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((order) => (
                <div key={order.id} className="shop-card p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <PetAvatar type={order.petName === '团子' ? 'cat' : 'dog'} size="sm" />
                      <span className="font-semibold text-sm">{order.petName}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-xs text-text-secondary mb-3">
                    {order.scheduledAt} · {order.address.slice(0, 15)}...
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(order.id)}
                      className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-semibold active:opacity-80 transition-opacity cursor-pointer"
                    >
                      接单
                    </button>
                    <button
                      onClick={() => navigate(`/caretaker/order/${order.id}`)}
                      className="px-5 py-2.5 btn-default rounded-lg text-sm active:opacity-80 transition-opacity cursor-pointer"
                    >
                      详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Orders */}
        <div className="px-4 mt-6 mb-6">
          <h3 className="text-sm font-semibold text-text mb-3">你正在照顾</h3>
          {active.length === 0 ? (
            <div className="text-center py-12">
              <PawPrint size={32} className="text-text-tertiary mx-auto mb-2" />
              <div className="text-sm text-text-tertiary">还没有正在进行的任务</div>
            </div>
          ) : (
            <div className="shop-card divide-y divide-border overflow-hidden">
              {active.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/caretaker/execute/${order.id}`)}
                  className="w-full py-4 px-4 text-left flex items-center gap-3 active:opacity-80 transition-opacity cursor-pointer first:rounded-t-xl last:rounded-b-xl"
                >
                  <PetAvatar type={order.petName === '团子' ? 'cat' : 'dog'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{order.petName}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5">{order.scheduledAt}</div>
                    {order.status === 'streaming' && (
                      <div className="mt-1 flex items-center gap-1.5 text-danger text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-live rounded-full live-pulse" />
                        直播中
                      </div>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-text-tertiary flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
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
