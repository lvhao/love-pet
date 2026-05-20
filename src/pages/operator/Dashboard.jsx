import { useState } from 'react'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import RoleSwitcher from '../../components/RoleSwitcher'
import { useStore } from '../../data/store'
import { productCategories } from '../../data/shop'
import { Plus, Edit3, Trash2, Package, TrendingUp, X } from 'lucide-react'

const productCategoryColors = {
  cat_food: { from: 'from-feeding-50', to: 'to-primary-50', text: 'text-feeding' },
  dog_food: { from: 'from-walking-50', to: 'to-green-50', text: 'text-walking' },
  cat_toy: { from: 'from-cat-50', to: 'to-amber-50', text: 'text-cat' },
  dog_toy: { from: 'from-dog-50', to: 'to-emerald-50', text: 'text-dog' },
}

const emptyForm = {
  name: '',
  brand: '',
  description: '',
  price: '',
  originalPrice: '',
  stock: '',
  category: 'cat_food',
}

export default function OperatorDashboard() {
  const { products, addProduct, updateProduct, deleteProduct, addToast } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const totalRevenue = products.reduce((s, p) => s + p.price * p.sales, 0)

  const openAddForm = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      brand: product.brand || '',
      description: product.description || '',
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      stock: String(product.stock),
      category: product.category,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setForm(emptyForm)
  }

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price || !form.stock) {
      addToast('请填写必填项（名称、价格、库存）', 'error')
      return
    }

    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim() || form.name.trim()[0],
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      sales: 0,
      rating: 0,
      tags: [],
      image: '',
    }

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...productData })
      addToast('商品已更新', 'success')
    } else {
      addProduct({
        id: `prod_${Date.now()}`,
        ...productData,
      })
      addToast('商品已添加', 'success')
    }

    closeForm()
  }

  const handleDelete = (productId) => {
    deleteProduct(productId)
    setDeleteConfirm(null)
    addToast('商品已删除', 'success')
  }

  return (
    <>
      <Layout title="宠管家 · 运营">
        <RoleSwitcher />

        {/* Stats */}
        <div className="mx-4 mt-2 grid grid-cols-2 gap-2.5">
          <div className="shop-card p-4 text-center">
            <div className="shop-promo-icon mx-auto mb-2">
              <Package size={18} className="text-primary" />
            </div>
            <div className="text-xl font-heading font-bold text-text">{products.length}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">在售商品</div>
          </div>
          <div className="shop-card p-4 text-center">
            <div className="shop-promo-icon mx-auto mb-2">
              <TrendingUp size={18} className="text-primary" />
            </div>
            <div className="text-xl font-heading font-bold text-text">¥{(totalRevenue / 10000).toFixed(1)}w</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">累计营收</div>
          </div>
        </div>

        {/* Product Management */}
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">商品管理</h3>
            <button
              onClick={openAddForm}
              className="btn-primary text-white px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 active:opacity-80 transition-opacity cursor-pointer"
            >
              <Plus size={12} /> 上新
            </button>
          </div>
          <div className="shop-card divide-y divide-border overflow-hidden">
            {products.map((product) => {
              const pc = productCategoryColors[product.category] || productCategoryColors.cat_food
              return (
                <div key={product.id} className="py-4 px-3 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pc.from} ${pc.to} flex items-center justify-center text-lg font-heading font-bold ${pc.text}`}>
                    {product.brand?.[0] || product.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{product.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text font-semibold">¥{product.price}</span>
                      <span className="text-[10px] text-text-tertiary">库存{product.stock} · 已售{product.sales}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditForm(product)}
                      className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer"
                    >
                      <Edit3 size={14} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={14} className="text-danger" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Layout>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={closeForm}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-surface w-full max-w-lg rounded-t-2xl p-5 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">{editingProduct ? '编辑商品' : '添加新商品'}</h3>
              <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center cursor-pointer">
                <X size={18} className="text-text-tertiary" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">商品名称 *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="请输入商品名称"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">品牌</label>
                <input
                  value={form.brand}
                  onChange={(e) => handleFormChange('brand', e.target.value)}
                  placeholder="请输入品牌"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">商品描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="请输入商品描述"
                  rows={2}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">售价 *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">原价</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => handleFormChange('originalPrice', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">库存 *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => handleFormChange('stock', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">分类</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors bg-surface"
                  >
                    {productCategories.filter((c) => c.key !== 'all').map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={closeForm}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-border text-text-secondary active:opacity-80 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium active:opacity-80 cursor-pointer"
              >
                {editingProduct ? '保存修改' : '添加商品'}
              </button>
            </div>
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
            <div className="text-sm text-text-secondary text-center">删除后不可恢复，确认要删除该商品吗？</div>
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

      <TabBar />
    </>
  )
}
