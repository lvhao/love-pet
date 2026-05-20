import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import PetAvatar from '../../components/PetAvatar'
import StatusBadge from '../../components/StatusBadge'
import { statusLabels } from '../../data/mock'
import { useStore } from '../../data/store'
import { Video, FileText, MapPin, User, CreditCard, MessageCircle, X } from 'lucide-react'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders, cancelOrder, addToast } = useStore()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <Layout title="订单详情" showBack onBack={() => navigate(-1)}>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center mb-4">
            <FileText size={28} className="text-text-tertiary" />
          </div>
          <h3 className="font-heading text-lg mb-2">订单不存在</h3>
          <p className="text-sm text-text-secondary mb-6">该订单可能已被删除或链接无效</p>
          <button
            onClick={() => navigate('/owner/orders')}
            className="btn-primary font-semibold px-6 py-2.5 rounded-lg text-sm active:opacity-80 transition-opacity cursor-pointer"
          >
            返回订单列表
          </button>
        </div>
      </Layout>
    )
  }

  const statusSteps = ['pending', 'accepted', 'in_progress', 'streaming', 'completed']
  const currentIdx = statusSteps.indexOf(order.status)
  const canCancel = ['pending', 'accepted'].includes(order.status)
  const hasCaretaker = !!order.caretakerName
  const isCompleted = order.status === 'completed'

  const handleCancel = () => {
    const success = cancelOrder(order.id)
    if (success) {
      addToast('订单已取消', 'info')
    } else {
      addToast('无法取消该订单', 'error')
    }
    setShowCancelConfirm(false)
  }

  const handleContactCaretaker = () => {
    navigate(`/owner/orders/${order.id}/chat`)
  }

  return (
    <Layout title="订单详情" showBack onBack={() => navigate(-1)}>
      <div className="px-4 py-4 space-y-4">
        {/* Pet & Status */}
        <div className="shop-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <PetAvatar type={order.petName === '团子' ? 'cat' : 'dog'} />
            <div className="flex-1">
              <div className="font-heading text-[17px]">{order.petName}</div>
              <div className="text-xs text-text-secondary mt-0.5">{order.scheduledAt}</div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Timeline */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-1">
              {statusSteps.map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    i <= currentIdx ? (i === currentIdx ? 'bg-primary' : 'bg-primary/40') : 'bg-border'
                  }`} />
                  <div className={`text-[11px] mt-1.5 ${
                    i === currentIdx ? 'text-primary font-semibold' : i < currentIdx ? 'text-primary/60' : 'text-text-tertiary'
                  }`}>
                    {statusLabels[s]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {order.status === 'streaming' && (
          <button
            onClick={() => navigate(`/owner/monitor/${order.id}`)}
            className="w-full btn-primary font-semibold py-4 rounded-lg text-base flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
          >
            <Video size={18} />
            <span className="w-2 h-2 bg-white rounded-full live-pulse" />
            进入看护
          </button>
        )}

        {isCompleted && order.reportId && (
          <button
            onClick={() => navigate(`/owner/report/${order.reportId}`)}
            className="w-full btn-primary font-semibold py-4 rounded-lg text-base flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
          >
            <FileText size={18} />
            查看报告
          </button>
        )}

        {/* Contact & Cancel Buttons */}
        {(hasCaretaker || canCancel) && (
          <div className="flex gap-3">
            {hasCaretaker && (
              <button
                onClick={handleContactCaretaker}
                className="flex-1 py-3 rounded-lg text-sm font-semibold border border-primary text-primary flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
              >
                <MessageCircle size={16} />
                联系护理师
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 py-3 rounded-lg text-sm font-semibold shop-secondary-action flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
              >
                取消订单
              </button>
            )}
          </div>
        )}

        {/* Order Info */}
        <div className="shop-card p-5">
          <h3 className="text-sm font-semibold text-text mb-4">订单信息</h3>
          <div className="space-y-3">
            {[
              { Icon: CreditCard, label: '你想让护理师做什么？', value: order.serviceType === 'feeding' ? '上门喂养' : order.serviceType === 'feeding_walk' ? '喂养+遛狗' : '喂养+洗护' },
              { Icon: MapPin, label: '去哪里找毛孩子？', value: order.address },
              { Icon: User, label: '护理师', value: order.caretakerName || '等待分配' },
              { Icon: CreditCard, label: '订单金额', value: `¥${order.price}`, highlight: true },
            ].map(({ Icon, label, value, highlight }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={14} className="text-text-tertiary" />
                <span className="text-xs text-text-secondary w-24">{label}</span>
                <span className={`text-sm flex-1 ${highlight ? 'font-bold text-text' : 'font-medium'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCancelConfirm(false)}>
          <div
            className="shop-card w-72 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-base">取消订单</h3>
              <button onClick={() => setShowCancelConfirm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary active:opacity-60 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-text-secondary">确定要取消这个订单吗？取消后护理师将不再上门服务。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium shop-secondary-action active:opacity-80 transition-opacity cursor-pointer"
              >
                再想想
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-danger text-white active:opacity-80 transition-opacity cursor-pointer"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
