import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import Skeleton from '../../components/Skeleton'
import ProductArt from '../../components/ProductArt'
import { useStore } from '../../data/store'
import { productCategories } from '../../data/shop'
import { useCart } from '../../hooks/useCart'
import { Search, ShoppingCart, HeartHandshake, Sparkles, Star, Plus, Flame } from 'lucide-react'

export default function Shop() {
  const navigate = useNavigate()
  const { products } = useStore()
  const { addItem, totalItems } = useCart()
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceTimer = useRef(null)
  const [loading, setLoading] = useState(true)

  // Simulated loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Debounce search input by 300ms
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [search])

  const filtered = products.filter((p) => {
    const matchCat = category === 'all' || p.category === category
    const matchSearch = !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <Layout title="宠管家商城" right={
        <button onClick={() => navigate('/owner/cart')} className="shop-cart-button relative w-8 h-8 flex items-center justify-center cursor-pointer" aria-label="购物车">
          <ShoppingCart size={18} className="text-text" />
          {totalItems > 0 && (
            <span className="shop-cart-count absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[11px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>
          )}
        </button>
      }>
        <div className="shop-page">
        {/* Search */}
        <div className="px-4 pt-3">
          <div className="shop-search relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索猫粮、狗粮、玩具..."
              className="w-full bg-transparent pl-10 pr-4 py-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Banner */}
        <div className="shop-promo mx-4 mt-4">
          <div className="flex items-start gap-2.5">
            <span className="shop-promo-icon mt-0.5 shrink-0"><HeartHandshake size={17} /></span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text">护理师顺手带上门，邮费我们包了</div>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">下次上门时顺便配送，省心也少一点等待</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {productCategories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`shop-chip px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap active:opacity-70 transition-all cursor-pointer ${
                category === c.key
                  ? 'shop-chip-active'
                  : 'shop-chip-idle text-text-secondary'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="px-4 mt-4 mb-6 grid grid-cols-2 gap-3">
          {loading ? (
            <>
              <Skeleton.ProductCard />
              <Skeleton.ProductCard />
              <Skeleton.ProductCard />
              <Skeleton.ProductCard />
            </>
          ) : (
            filtered.map((product) => {
              return (
                <article
                  key={product.id}
                  onClick={() => navigate(`/owner/product/${product.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/owner/product/${product.id}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="shop-card text-left active:opacity-85 transition-opacity cursor-pointer overflow-hidden"
                >
                  <div className="relative">
                    <ProductArt product={product} />
                    {product.tags?.includes('热销') && (
                      <span className="shop-badge shop-badge-hot absolute top-2.5 left-2.5 text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5">
                        <Flame size={8} /> 热销
                      </span>
                    )}
                    {product.tags?.includes('新品') && (
                      <span className="shop-badge shop-badge-new absolute top-2.5 left-2.5 text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5">
                        <Sparkles size={8} /> 新品
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-[13px] font-semibold leading-snug line-clamp-2 text-text">{product.name}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star size={10} className="shop-star" fill="currentColor" />
                      <span className="text-[11px] text-text-tertiary">{product.rating} · 已售{product.sales}</span>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <span className="text-[17px] font-bold shop-price">¥{product.price}</span>
                        <span className="text-[11px] text-text-tertiary line-through ml-1">¥{product.originalPrice}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); addItem(product) }}
                        className="shop-add-button w-8 h-8 min-h-[32px] min-w-[32px] rounded-full flex items-center justify-center active:opacity-70 transition-opacity cursor-pointer"
                        aria-label={`添加${product.name}`}
                      >
                        <span className="sr-only">+</span>
                        <Plus size={14} className="text-white" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
        </div>
      </Layout>
      <TabBar />
    </>
  )
}
