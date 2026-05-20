import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import ProductArt from '../../components/ProductArt'
import { useStore } from '../../data/store'
import { deliveryTypes } from '../../data/shop'
import { useCart } from '../../hooks/useCart'
import { Star, ShoppingCart, Truck, DoorOpen, Minus, Plus } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products } = useStore()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryTypes[0]?.key || 'door')
  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <Layout title="商品详情" showBack onBack={() => navigate(-1)}>
        <div className="px-4 py-20 text-center">
          <div className="text-text-tertiary text-sm">商品不存在</div>
          <button
            onClick={() => navigate('/owner/shop')}
            className="mt-4 btn-primary px-6 py-2.5 rounded-lg text-sm font-medium active:opacity-80 transition-opacity cursor-pointer"
          >
            返回商城
          </button>
        </div>
      </Layout>
    )
  }

  const isOutOfStock = product.stock <= 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, quantity)
    navigate('/owner/cart')
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return
    addItem(product, quantity)
    navigate('/owner/checkout')
  }

  return (
    <Layout title="商品详情" showBack onBack={() => navigate(-1)}>
      <div className="shop-page pb-24">
        {/* Product Image */}
        <div className="px-4 pt-4">
          <ProductArt product={product} size="detail" />
        </div>

        {/* Product Info */}
        <div className="px-4 mt-4 space-y-4">
          <div>
            <div className="text-[20px] font-semibold leading-snug text-text">{product.name}</div>
            <div className="text-xs text-text-secondary mt-1.5">{product.brand}</div>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-3xl font-heading shop-price">¥{product.price}</span>
            <span className="text-sm text-text-tertiary line-through">¥{product.originalPrice}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <Star size={12} className="shop-star" fill="currentColor" />
              {product.rating}
            </div>
            <span>已售 {product.sales}</span>
            <span className={isOutOfStock ? 'text-danger font-medium' : ''}>库存 {product.stock}</span>
          </div>

          {isOutOfStock && (
            <div className="bg-danger/10 text-danger text-sm font-medium px-4 py-2 rounded-2xl">
              该商品暂时缺货
            </div>
          )}

          <div className="shop-soft-panel text-sm text-text-secondary leading-relaxed">
            {product.description}
          </div>

          {/* Delivery Options */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-2">配送方式</h3>
            <div className="space-y-2.5">
              {deliveryTypes.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDelivery(d.key)}
                  className={`shop-delivery-option w-full flex items-center gap-3 p-3 border transition-opacity active:opacity-80 cursor-pointer ${
                    selectedDelivery === d.key ? 'shop-delivery-selected' : 'shop-delivery-idle'
                  }`}
                >
                  {d.key === 'door' ? (
                    <DoorOpen size={18} className={selectedDelivery === d.key ? 'text-primary' : 'text-text-tertiary'} />
                  ) : (
                    <Truck size={18} className={selectedDelivery === d.key ? 'text-primary' : 'text-text-tertiary'} />
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="text-xs text-text-tertiary">{d.desc}</div>
                  </div>
                  <span className={`text-xs font-semibold ${d.price === 0 ? 'text-primary' : 'text-text-secondary'}`}>
                    {d.price === 0 ? '免邮' : `¥${d.price}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">购买数量</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock}
                className="shop-stepper-button w-8 h-8 min-h-[32px] min-w-[32px] rounded-full border flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus size={14} className="text-text-secondary" />
              </button>
              <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={isOutOfStock || quantity >= product.stock}
                className="shop-stepper-button w-8 h-8 min-h-[32px] min-w-[32px] rounded-full border flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={14} className="text-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 z-50 shop-bottom-bar px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/owner/cart')}
          className="relative w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-bg flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer"
          aria-label="购物车"
        >
          <ShoppingCart size={20} className="text-text" />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 shop-secondary-action font-semibold py-3 rounded-full text-sm active:opacity-80 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          加入购物车
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex-1 shop-primary-action font-semibold py-3 rounded-full text-sm active:opacity-80 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          立即购买
        </button>
      </div>
    </Layout>
  )
}
