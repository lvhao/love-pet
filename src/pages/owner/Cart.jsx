import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import ProductArt from '../../components/ProductArt'
import { useCart } from '../../hooks/useCart'
import { deliveryTypes, getDeliveryDesc, getDeliveryFee } from '../../data/shop'
import { Trash2, Minus, Plus, DoorOpen, Truck, ShoppingBag } from 'lucide-react'

const productCategoryColors = {
  cat_food: { from: 'from-feeding-50', to: 'to-primary-50', text: 'text-feeding' },
  dog_food: { from: 'from-walking-50', to: 'to-green-50', text: 'text-walking' },
  cat_toy: { from: 'from-cat-50', to: 'to-amber-50', text: 'text-cat' },
  dog_toy: { from: 'from-dog-50', to: 'to-emerald-50', text: 'text-dog' },
}

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, deliveryType, setDeliveryType, totalPrice, deliveryFee, finalPrice } = useCart()
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleDelete = (itemId) => {
    removeItem(itemId)
    setDeleteConfirm(null)
  }

  const deliveryLabel = deliveryType === 'door' ? '上门配送' : '快递邮寄'

  return (
    <Layout title="购物车" showBack onBack={() => navigate(-1)}>
      <div className="pb-36">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="text-text-tertiary mx-auto mb-3" strokeWidth={1.2} />
            <div className="text-sm text-text-tertiary">购物车是空的</div>
            <button
              onClick={() => navigate('/owner/shop')}
              className="mt-4 btn-primary px-6 py-2.5 rounded-lg text-sm font-medium active:opacity-80 transition-opacity cursor-pointer"
            >
              去逛逛
            </button>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {items.map((item) => {
              const pc = productCategoryColors[item.category] || productCategoryColors.cat_food
              return (
                <div key={item.id} className="bg-surface rounded-xl p-4 border border-border flex gap-3">
                  <div className={`w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br ${pc.from} ${pc.to} flex items-center justify-center flex-shrink-0`}>
                    {item.image ? (
                      <ProductArt product={item} size="thumb" />
                    ) : (
                      <span className={`text-lg font-heading font-bold ${pc.text} opacity-30`}>{item.brand?.[0] || item.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight line-clamp-2">{item.name}</div>
                    <div className="text-xs text-text-tertiary mt-1">{item.brand}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-text">¥{item.price}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 min-h-[28px] min-w-[28px] rounded-md border border-border flex items-center justify-center cursor-pointer active:opacity-60 transition-opacity"
                          aria-label="减少数量"
                        >
                          <span className="sr-only">-</span>
                          <Minus size={12} className="text-text-secondary" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 min-h-[28px] min-w-[28px] rounded-md border border-border flex items-center justify-center cursor-pointer active:opacity-60 transition-opacity"
                          aria-label="增加数量"
                        >
                          <span className="sr-only">+</span>
                          <Plus size={12} className="text-text-secondary" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="w-7 h-7 min-h-[28px] min-w-[28px] rounded-md flex items-center justify-center cursor-pointer active:opacity-60 transition-opacity"
                          aria-label="删除商品"
                        >
                          <Trash2 size={12} className="text-danger" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Delivery */}
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-text mb-3">配送方式</h3>
              <div className="space-y-2">
                {deliveryTypes.map((d) => {
                  const optionFee = getDeliveryFee(d.key, totalPrice)
                  const isSelected = deliveryType === d.key
                  return (
                    <button
                      key={d.key}
                      onClick={() => setDeliveryType(d.key)}
                      aria-label={`选择${d.label}`}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-opacity active:opacity-80 cursor-pointer ${
                        isSelected ? 'border-primary bg-primary-50' : 'border-border bg-surface'
                      }`}
                    >
                      {d.key === 'door' ? (
                        <DoorOpen size={18} className={isSelected ? 'text-primary' : 'text-text-tertiary'} />
                      ) : (
                        <Truck size={18} className={isSelected ? 'text-primary' : 'text-text-tertiary'} />
                      )}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{d.label}</div>
                        <div className="text-xs text-text-tertiary">{getDeliveryDesc(d.key, totalPrice)}</div>
                      </div>
                      <span className={`text-xs font-semibold ${optionFee === 0 ? 'text-primary' : 'text-text-secondary'}`}>
                        {optionFee === 0 ? '免邮' : `¥${optionFee}`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-surface rounded-xl p-4 border border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">商品小计</span>
                <span className="font-medium text-text" data-testid="cart-subtotal">¥{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">运费</span>
                <span className={`font-medium ${deliveryFee === 0 ? 'text-primary' : 'text-text'}`} data-testid="cart-delivery-fee">
                  {deliveryFee === 0 ? '免邮' : `¥${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-semibold text-base">
                <span>合计</span>
                <span className="text-text" data-testid="cart-summary-total">¥{finalPrice}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      {items.length > 0 && (
        <div className="cart-submit-bar fixed bottom-0 left-1/2 z-50 -translate-x-1/2 border-t border-border/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-text-tertiary truncate">
                小计 ¥{totalPrice} · {deliveryLabel}{deliveryFee === 0 ? '免邮' : `运费 ¥${deliveryFee}`}
              </div>
              <div className="mt-0.5">
                <span className="text-xs text-text-secondary">合计 </span>
                <span className="text-xl font-heading text-text" data-testid="cart-bottom-total">¥{finalPrice}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/owner/checkout')}
              className="btn-primary font-semibold px-8 py-3 rounded-lg text-sm active:opacity-80 transition-opacity cursor-pointer"
            >
              去结算
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-surface rounded-2xl p-5 w-72 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-base font-semibold text-center">确认删除</div>
            <div className="text-sm text-text-secondary text-center">确认要从购物车中移除该商品吗？</div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-border text-text-secondary active:opacity-80 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-danger text-white active:opacity-80 cursor-pointer"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
