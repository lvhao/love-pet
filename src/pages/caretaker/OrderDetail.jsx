import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PetAvatar from '../../components/PetAvatar'
import StatusBadge from '../../components/StatusBadge'
import { useStore } from '../../data/store'
import { AlertTriangle, MapPin, Clock, CreditCard, Video, FileText, MessageCircle } from 'lucide-react'

export default function CaretakerOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders, pets, updateOrderStatus, cancelOrder, addToast } = useStore()
  const [confirmAction, setConfirmAction] = useState(null) // 'accept' | 'reject' | null

  const order = orders.find((o) => o.id === id)
  if (!order) {
    return (
      <Layout title="订单详情" showBack onBack={() => navigate(-1)}>
        <div className="px-4 py-12 text-center text-text-tertiary text-sm">订单不存在</div>
      </Layout>
    )
  }

  const pet = pets.find((p) => p.id === order.petId) || pets[0]

  const handleAccept = () => setConfirmAction('accept')
  const handleReject = () => setConfirmAction('reject')

  const confirmActionHandler = () => {
    if (confirmAction === 'accept') {
      const ok = updateOrderStatus(order.id, 'accepted')
      if (ok) {
        addToast('已接受订单', 'success')
      } else {
        addToast('接受订单失败', 'error')
      }
    } else if (confirmAction === 'reject') {
      const ok = cancelOrder(order.id)
      if (ok) {
        addToast('已拒绝订单', 'success')
        navigate(-1)
      } else {
        addToast('拒绝订单失败', 'error')
      }
    }
    setConfirmAction(null)
  }

  const cancelConfirm = () => setConfirmAction(null)

  const handleStartService = () => {
    const ok = updateOrderStatus(order.id, 'in_progress')
    if (ok) {
      addToast('已开始服务', 'success')
    } else {
      addToast('操作失败', 'error')
    }
  }

  return (
    <Layout title="订单详情" showBack onBack={() => navigate(-1)}>
      <div className="px-4 py-4 space-y-4">
        {/* Pet Info */}
        <div className="shop-card p-5">
          <div className="flex items-center gap-4 mb-4">
            <PetAvatar type={pet.type} size="lg" />
            <div>
              <div className="font-heading text-[17px]">{pet.name}</div>
              <div className="text-xs text-text-secondary mt-0.5">{pet.breed} · {pet.age} · {pet.weight}</div>
            </div>
          </div>
          <div className="shop-soft-panel p-4 text-xs text-primary">
            <div className="flex items-center gap-1.5 font-semibold mb-1.5">
              <AlertTriangle size={14} className="text-primary" />
              有什么需要嘱咐的？
            </div>
            {pet.notes}
          </div>
        </div>

        {/* Order Info */}
        <div className="shop-card p-5">
          <h3 className="text-sm font-semibold text-text mb-4">服务信息</h3>
          <div className="space-y-3">
            {[
              { Icon: CreditCard, label: '你想让护理师做什么？', value: order.serviceType === 'feeding' ? '上门喂养' : order.serviceType === 'feeding_walk' ? '喂养+遛狗' : '喂养+洗护' },
              { Icon: Clock, label: '什么时候上门？', value: order.scheduledAt },
              { Icon: MapPin, label: '去哪里找毛孩子？', value: order.address },
              { Icon: CreditCard, label: '服务费用', value: `¥${order.price}`, highlight: true },
            ].map(({ Icon, label, value, highlight }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={14} className="text-text-tertiary" />
                <span className="text-xs text-text-secondary w-24">{label}</span>
                <span className={`text-sm flex-1 ${highlight ? 'font-bold text-text' : 'font-medium'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="shop-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">订单状态</h3>
            <StatusBadge status={order.status} />
          </div>

          {order.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 btn-primary font-semibold py-3 rounded-lg text-sm active:opacity-80 transition-opacity cursor-pointer"
              >
                接受订单
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-3 rounded-lg text-sm font-semibold text-danger bg-danger/10 active:opacity-80 transition-opacity cursor-pointer"
              >
                拒绝订单
              </button>
            </div>
          )}

          {order.status === 'accepted' && (
            <div className="space-y-3">
              <button
                onClick={handleStartService}
                className="w-full btn-primary font-semibold py-3 rounded-lg text-sm active:opacity-80 transition-opacity cursor-pointer"
              >
                开始服务
              </button>
              <button
                onClick={() => navigate(`/caretaker/execute/${order.id}`)}
                className="w-full py-3 rounded-lg text-sm font-semibold shop-secondary-action active:opacity-80 transition-opacity cursor-pointer"
              >
                查看服务流程
              </button>
              <button
                onClick={() => navigate(`/caretaker/orders/${order.id}/chat`)}
                className="w-full py-3 rounded-lg text-sm font-semibold border border-primary text-primary flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
              >
                <MessageCircle size={16} />
                联系宠主
              </button>
            </div>
          )}

          {order.status === 'in_progress' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/caretaker/stream/${order.id}`)}
                className="w-full btn-primary font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
              >
                <Video size={16} />
                开始直播
              </button>
              <button
                onClick={() => navigate(`/caretaker/execute/${order.id}`)}
                className="w-full py-3 rounded-lg text-sm font-semibold shop-secondary-action active:opacity-80 transition-opacity cursor-pointer"
              >
                查看服务流程
              </button>
              <button
                onClick={() => navigate(`/caretaker/orders/${order.id}/chat`)}
                className="w-full py-3 rounded-lg text-sm font-semibold border border-primary text-primary flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
              >
                <MessageCircle size={16} />
                联系宠主
              </button>
            </div>
          )}

          {order.status === 'streaming' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/caretaker/stream/${order.id}`)}
                className="w-full btn-primary font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
              >
                <Video size={16} />
                进入直播间
              </button>
              <button
                onClick={() => navigate(`/caretaker/report/${order.id}`)}
                className="w-full py-3 rounded-lg text-sm font-semibold shop-secondary-action flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
              >
                <FileText size={16} />
                提交报告
              </button>
              <button
                onClick={() => navigate(`/caretaker/orders/${order.id}/chat`)}
                className="w-full py-3 rounded-lg text-sm font-semibold border border-primary text-primary flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
              >
                <MessageCircle size={16} />
                联系宠主
              </button>
            </div>
          )}

          {order.status === 'completed' && (
            <div className="text-sm text-text-secondary text-center py-2">订单已完成</div>
          )}

          {order.status === 'cancelled' && (
            <div className="text-sm text-text-secondary text-center py-2">订单已取消</div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={cancelConfirm}>
          <div className="shop-card p-6 mx-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-text mb-2">
              {confirmAction === 'accept' ? '确认接单' : '确认拒绝'}
            </h3>
            <p className="text-sm text-text-secondary mb-5">
              {confirmAction === 'accept'
                ? '确认接受此订单？接受后请按时上门服务。'
                : '确认拒绝此订单？拒绝后订单将返回待接单池。'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelConfirm}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium shop-secondary-action active:opacity-80 transition-opacity cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={confirmActionHandler}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold active:opacity-80 transition-opacity cursor-pointer ${
                  confirmAction === 'reject'
                    ? 'text-danger bg-danger/10'
                    : 'btn-primary'
                }`}
              >
                {confirmAction === 'accept' ? '确认接受' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
