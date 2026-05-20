import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useStore } from '../../data/store'
import { CheckCircle, XCircle, DoorOpen, Truck, CreditCard, RefreshCw } from 'lucide-react'

const productCategoryColors = {
  cat_food: { from: 'from-feeding-50', to: 'to-primary-50', text: 'text-feeding' },
  dog_food: { from: 'from-walking-50', to: 'to-green-50', text: 'text-walking' },
  cat_toy: { from: 'from-cat-50', to: 'to-amber-50', text: 'text-cat' },
  dog_toy: { from: 'from-dog-50', to: 'to-emerald-50', text: 'text-dog' },
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems: items, deliveryType, totalPrice, deliveryFee, finalPrice, clearCart, addOrder, addToast } = useStore()
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [failed, setFailed] = useState(false)
  const [paidAmount, setPaidAmount] = useState(0)
  const [orderNumber, setOrderNumber] = useState('')
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const handlePay = () => {
    setPaying(true)
    setFailed(false)
    const amount = finalPrice
    setTimeout(() => {
      // 10% chance of simulated failure for demo
      if (Math.random() < 0.1) {
        setPaying(false)
        setFailed(true)
        return
      }
      const newOrder = addOrder({
        ownerId: 'owner_1',
        serviceType: 'product',
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryType,
        price: amount,
        status: 'paid',
        scheduledAt: '',
        address: '',
        petId: null,
        petName: '',
        caretakerId: null,
        caretakerName: null,
      })
      setPaying(false)
      setPaid(true)
      setPaidAmount(amount)
      setOrderNumber(newOrder.id)
      clearCart()
    }, 1500)
  }

  const handleRetry = () => {
    setFailed(false)
    handlePay()
  }

  const handleBack = () => {
    if (paying) {
      setShowBackConfirm(true)
    } else {
      navigate(-1)
    }
  }

  if (paid) {
    return (
      <Layout title="支付结果">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center fade-in">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-5">
            <CheckCircle size={40} className="text-primary" />
          </div>
          <h2 className="font-heading text-xl mb-2">支付成功</h2>
          <p className="text-sm text-text-secondary mb-1">
            {deliveryType === 'door' ? '护理师下次上门时将顺便配送' : '商品将在3-5个工作日内寄出'}
          </p>
          <p className="text-sm text-text-tertiary mb-1">订单号：{orderNumber}</p>
          <p className="text-sm text-text-tertiary mb-6">支付金额：¥{paidAmount}</p>
          <button
            onClick={() => navigate('/owner')}
            className="btn-primary font-semibold px-8 py-3 rounded-lg text-sm active:opacity-80 transition-opacity cursor-pointer"
          >
            返回首页
          </button>
        </div>
      </Layout>
    )
  }

  if (failed) {
    return (
      <Layout title="支付结果">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center fade-in">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <XCircle size={40} className="text-danger" />
          </div>
          <h2 className="font-heading text-xl mb-2">支付失败</h2>
          <p className="text-sm text-text-secondary mb-6">支付过程中出现问题，请重试</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="py-3 px-6 rounded-lg text-sm font-medium border border-border text-text-secondary active:opacity-80 transition-opacity cursor-pointer"
            >
              返回
            </button>
            <button
              onClick={handleRetry}
              className="btn-primary font-semibold px-6 py-3 rounded-lg text-sm flex items-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
            >
              <RefreshCw size={14} />
              重新支付
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="确认订单" showBack onBack={handleBack}>
      <div className="px-4 py-4 space-y-4">
        {/* Items */}
        <div className="bg-surface rounded-xl p-4 border border-border space-y-3">
          <h3 className="text-sm font-semibold text-text">商品清单</h3>
          {items.map((item) => {
            const pc = productCategoryColors[item.category] || productCategoryColors.cat_food
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pc.from} ${pc.to} flex items-center justify-center`}>
                  <span className={`text-xs font-heading font-bold ${pc.text} opacity-30`}>{item.brand[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-text-tertiary">x{item.quantity}</div>
                </div>
                <span className="text-sm font-semibold text-text">¥{item.price * item.quantity}</span>
              </div>
            )
          })}
        </div>

        {/* Delivery */}
        <div className="bg-surface rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-text mb-2">配送方式</h3>
          <div className="flex items-center gap-2 text-sm">
            {deliveryType === 'door' ? (
              <DoorOpen size={16} className="text-primary" />
            ) : (
              <Truck size={16} className="text-primary" />
            )}
            <span className="font-medium">
              {deliveryType === 'door' ? '上门配送（免邮）' : '快递邮寄'}
            </span>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-surface rounded-xl p-4 border border-border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">商品小计</span>
            <span className="text-text">¥{totalPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">运费</span>
            <span className={deliveryFee === 0 ? 'text-primary' : 'text-text'}>
              {deliveryFee === 0 ? '免邮' : `¥${deliveryFee}`}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
            <span>实付金额</span>
            <span className="text-text">¥{finalPrice}</span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full btn-primary font-semibold py-3.5 rounded-lg text-base active:opacity-80 transition-opacity cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <CreditCard size={18} />
          {paying ? '支付中...' : '微信支付 ¥' + finalPrice}
        </button>

        <p className="text-[11px] text-text-tertiary text-center">模拟支付，不会产生真实扣款</p>
      </div>

      {/* Back confirmation dialog during payment */}
      {showBackConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowBackConfirm(false)}>
          <div
            className="w-72 bg-surface rounded-xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading font-semibold text-base text-center">确认离开</h3>
            <p className="text-sm text-text-secondary text-center">支付正在进行中，确定要离开吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBackConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-border text-text-secondary active:opacity-80 transition-opacity cursor-pointer"
              >
                继续支付
              </button>
              <button
                onClick={() => { setShowBackConfirm(false); setPaying(false); navigate(-1) }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-danger text-white active:opacity-80 transition-opacity cursor-pointer"
              >
                确认离开
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
