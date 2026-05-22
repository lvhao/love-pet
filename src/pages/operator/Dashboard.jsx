import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import RoleSwitcher from '../../components/RoleSwitcher'
import { useStore } from '../../data/store'
import { productCategories } from '../../data/shop'
import { mockCaretakerApplications, mockComplaints, serviceTypes } from '../../data/mock'
import ProductArt from '../../components/ProductArt'
import StatusBadge from '../../components/StatusBadge'
import { Plus, Edit3, Trash2, X, Image as ImageIcon, UserCheck, AlertCircle, Clock, MessageCircle, Package, Truck, ArchiveRestore, CheckCircle2, FileText, PhoneCall, Send, ShieldAlert } from 'lucide-react'

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
  image: '',
  price: '',
  originalPrice: '',
  stock: '',
  category: 'cat_food',
}

const initialShipments = [
  {
    id: 'ship_1',
    owner: '小明',
    deliveryType: 'express',
    items: '渴望六种鱼全猫粮 x1',
    amount: 298,
    address: '杭州市西湖区文三路xx小区3栋502',
    status: '待发货',
  },
  {
    id: 'ship_2',
    owner: '林女士',
    deliveryType: 'door',
    items: 'Catit 猫薄荷玩具球 x2',
    amount: 78,
    address: '下次上门服务时顺带',
    status: '待备货',
  },
]

function getServiceLabel(order) {
  return serviceTypes.find((service) => service.key === order.serviceType)?.label || '上门护理'
}

const OPERATION_NOW = new Date('2026-05-21T12:00:00').getTime()

function getScheduledTime(order) {
  return new Date(order.scheduledAt?.replace(' ', 'T')).getTime()
}

function getOrderAttention(order) {
  if (order.status === 'completed' && !order.reportId) return { text: '已完成，待补服务报告', priority: 0 }

  const scheduledTime = getScheduledTime(order)
  const isPastAppointment = Number.isFinite(scheduledTime) && scheduledTime < OPERATION_NOW
  if (!isPastAppointment) return null

  if (order.status === 'pending' && !order.caretakerId) return { text: '预约时间已过，仍未接单', priority: 1 }
  if (order.status === 'accepted') return { text: '已接单但未开始服务', priority: 2 }
  if (['in_progress', 'streaming'].includes(order.status)) return { text: '履约时间异常，需确认进度', priority: 2 }
  return null
}

const ORDER_STATUS_PRIORITY = { pending: 0, accepted: 1, in_progress: 2, streaming: 3, completed: 4, cancelled: 5 }
const EVENT_PAGE_SIZE = 100

const eventStatusStyles = {
  待审核: 'bg-amber-50 text-amber-700 border-amber-100',
  待补资料: 'bg-orange-50 text-orange-700 border-orange-100',
  已通过: 'bg-green-50 text-green-700 border-green-100',
  待处理: 'bg-red-50 text-red-700 border-red-100',
  处理中: 'bg-blue-50 text-blue-700 border-blue-100',
  已回访: 'bg-green-50 text-green-700 border-green-100',
}

const priorityStyles = {
  高: 'bg-red-50 text-red-700 border-red-100',
  中: 'bg-amber-50 text-amber-700 border-amber-100',
  低: 'bg-gray-50 text-text-secondary border-border',
}

function EventPill({ children, className = '' }) {
  return (
    <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold leading-none ${className}`}>
      {children}
    </span>
  )
}

EventPill.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

function getApplicationMeta(item) {
  return {
    code: item.id.toUpperCase(),
    status: item.status,
    priority: item.status === '待审核' ? '中' : '低',
    subject: item.name,
    summary: item.experience,
    relation: `护理师申请 · ${item.area}`,
    assignee: '准入运营',
    sla: item.status === '待审核' ? '今日 18:00 前审核' : '待候选人补充',
    source: '小程序报名',
    risk: item.status === '待审核' ? '资质准入' : '材料缺口',
  }
}

function getComplaintMeta(item) {
  return {
    code: item.id.toUpperCase(),
    status: item.status,
    priority: item.status === '待处理' ? '高' : '中',
    subject: item.owner,
    summary: item.reason,
    relation: `关联 ${item.target}`,
    assignee: item.status === '待处理' ? '待认领' : '客诉运营',
    sla: item.status === '待处理' ? '2 小时内首次响应' : '今日内回访闭环',
    source: '用户投诉',
    risk: item.target.includes('order') ? '服务体验' : '商品交付',
  }
}

function getReminderMeta(order) {
  const statusLabel = order.attention.priority === 0 ? '待内部确认' : order.status === 'pending' ? '待处理' : '处理中'
  return {
    code: order.id.toUpperCase(),
    status: statusLabel,
    priority: order.attention.priority === 0 ? '中' : '高',
    subject: getServiceLabel(order),
    summary: `${order.petName} · ${order.attention.text}`,
    relation: `订单 ${order.id}`,
    assignee: order.caretakerName || '待分配护理师',
    sla: order.attention.priority === 0 ? '今日补齐报告' : '已超预约时间',
    source: '系统提醒',
    risk: order.attention.priority === 0 ? '报告缺失' : '履约超时',
  }
}

export default function OperatorDashboard() {
  const { products, orders, addProduct, updateProduct, deleteProduct, addToast } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [activeModule, setActiveModule] = useState('fulfillment')
  const [caretakerApplications, setCaretakerApplications] = useState(mockCaretakerApplications)
  const [complaints, setComplaints] = useState(mockComplaints)
  const [shipments, setShipments] = useState(initialShipments)
  const [activeEventType, setActiveEventType] = useState('applications')
  const [activeProductView, setActiveProductView] = useState('all')
  const [activeShippingView, setActiveShippingView] = useState('express')
  const [eventVisibleCount, setEventVisibleCount] = useState(EVENT_PAGE_SIZE)
  const [eventDetail, setEventDetail] = useState(null)
  const eventLoadMoreRef = useRef(null)

  const orderExceptions = orders
    .map((order) => ({ ...order, attention: getOrderAttention(order) }))
    .filter((order) => order.attention)
    .sort((a, b) => a.attention.priority - b.attention.priority || (ORDER_STATUS_PRIORITY[a.status] ?? 9) - (ORDER_STATUS_PRIORITY[b.status] ?? 9))
  const pendingApplications = caretakerApplications.filter((item) => item.status === '待审核')
  const openComplaints = complaints.filter((item) => item.status !== '已回访')
  const pendingShipments = shipments.filter((item) => !['已发货', '已交接'].includes(item.status))
  const lowStockProducts = products.filter((product) => product.stock <= 300)
  const digestStockProducts = products.filter((product) => product.stock >= 400 && !product.tags?.includes('热销')).slice(0, 3)
  const expressShipments = pendingShipments.filter((item) => item.deliveryType === 'express')
  const doorShipments = pendingShipments.filter((item) => item.deliveryType === 'door')
  const productViewGroups = [
    { key: 'all', label: '全部商品', count: products.length, Icon: Package },
    { key: 'low', label: '补库存', count: lowStockProducts.length, Icon: ArchiveRestore },
    { key: 'digest', label: '需消化', count: digestStockProducts.length, Icon: AlertCircle },
  ]
  const shippingViewGroups = [
    { key: 'express', label: '快递发货', count: expressShipments.length, Icon: Truck },
    { key: 'door', label: '上门备货', count: doorShipments.length, Icon: ArchiveRestore },
  ]
  const activeProductGroup = productViewGroups.find((item) => item.key === activeProductView) || productViewGroups[0]
  const activeShippingGroup = shippingViewGroups.find((item) => item.key === activeShippingView) || shippingViewGroups[0]
  const visibleProducts = activeProductView === 'low'
    ? lowStockProducts
    : activeProductView === 'digest'
      ? digestStockProducts
      : products
  const visibleShipments = activeShippingView === 'door' ? doorShipments : expressShipments
  const eventGroups = [
    {
      key: 'applications',
      label: '待审核',
      title: '护理师加入申请',
      description: '只显示等待运营判断的准入申请',
      count: pendingApplications.length,
      Icon: UserCheck,
      items: pendingApplications,
    },
    {
      key: 'complaints',
      label: '客诉单',
      title: '客户投诉单',
      description: '需要运营回访、跟进和闭环的投诉',
      count: openComplaints.length,
      Icon: MessageCircle,
      items: openComplaints,
    },
    {
      key: 'reminders',
      label: '履约提醒',
      title: '履约提醒',
      description: '护理师自接单模式下，仅提示需要关注的服务进度',
      count: orderExceptions.length,
      Icon: AlertCircle,
      items: orderExceptions,
    },
  ]
  const activeEvent = eventGroups.find((item) => item.key === activeEventType) || eventGroups[0]
  const visibleEventItems = activeEvent.items.slice(0, eventVisibleCount)
  const hasMoreEventItems = activeEvent.items.length > eventVisibleCount

  useEffect(() => {
    if (!hasMoreEventItems || !eventLoadMoreRef.current || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setEventVisibleCount((count) => count + EVENT_PAGE_SIZE)
      }
    }, { rootMargin: '160px' })

    observer.observe(eventLoadMoreRef.current)
    return () => observer.disconnect()
  }, [activeEventType, hasMoreEventItems, eventVisibleCount])

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
      image: product.image || '',
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
    if (!form.name.trim() || !form.image.trim() || !form.price || !form.stock) {
      addToast('请填写必填项（名称、图片、价格、库存）', 'error')
      return
    }

    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim() || form.name.trim()[0],
      description: form.description.trim(),
      image: form.image.trim(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      sales: 0,
      rating: 0,
      tags: [],
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

  const updateApplicationStatus = (id, status) => {
    setCaretakerApplications((items) => items.map((item) => item.id === id ? { ...item, status } : item))
    addToast(status === '已通过' ? '已通过护理师申请' : '已标记需补资料', 'success')
  }

  const updateComplaintStatus = (id, status) => {
    setComplaints((items) => items.map((item) => item.id === id ? { ...item, status } : item))
    addToast(status === '已回访' ? '客诉已回访' : '客诉已进入处理', 'success')
  }

  const updateShipmentStatus = (id, status) => {
    setShipments((items) => items.map((item) => item.id === id ? { ...item, status } : item))
    addToast(status === '已发货' ? '快递订单已标记发货' : '上门商品已标记备货交接', 'success')
  }

  const selectEventType = (key) => {
    setActiveEventType(key)
    setEventVisibleCount(EVENT_PAGE_SIZE)
    setEventDetail(null)
  }

  const openEventDetail = (type, item) => {
    setEventDetail({ type, item })
  }

  const handleInlineEventAction = (event, callback) => {
    event.stopPropagation()
    callback()
  }

  const renderEventCard = ({ type, item, meta, primaryAction, secondaryAction, extra }) => (
    <div
      key={item.id}
      onClick={() => openEventDetail(type, item)}
      className="block w-full px-4 py-3 text-left active:bg-bg cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-text">{meta.subject}</span>
            <EventPill className={eventStatusStyles[meta.status] || eventStatusStyles['待处理']}>{meta.status}</EventPill>
            <EventPill className={priorityStyles[meta.priority] || priorityStyles['中']}>{meta.priority}优先</EventPill>
          </div>
          <div className="mt-1 text-xs text-text-secondary">{meta.summary}</div>
          <div className="mt-2 grid gap-1 text-[11px] text-text-tertiary sm:grid-cols-2">
            <span className="truncate">编号 {meta.code}</span>
            <span className="truncate">{meta.relation}</span>
            <span className="truncate">SLA {meta.sla}</span>
            <span className="truncate">处理人 {meta.assignee}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <EventPill className="border-border bg-bg text-text-secondary">{meta.source}</EventPill>
            <EventPill className="border-border bg-bg text-text-secondary">{meta.risk}</EventPill>
            {extra}
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => handleInlineEventAction(event, () => openEventDetail(type, item))}
          className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-primary active:bg-primary-50 cursor-pointer"
        >
          详情
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  )

  return (
    <>
      <Layout title="宠管家 · 运营">
        <RoleSwitcher />

        <div className="px-4 mt-3">
          <div className="role-switcher p-1 rounded-2xl flex gap-1">
            {[
              { key: 'fulfillment', label: '工单' },
              { key: 'product', label: '商品' },
              { key: 'shipping', label: '发货' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveModule(item.key)}
                className={`flex-1 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                  activeModule === item.key ? 'shop-chip-active' : 'shop-chip-idle text-text-secondary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Operations */}
        {activeModule === 'fulfillment' && <section className="px-4 mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">事件</h3>
            <span className="text-[11px] text-text-tertiary">{pendingApplications.length + openComplaints.length + orderExceptions.length} 项待关注</span>
          </div>
          <div className="shop-card p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {eventGroups.map(({ key, label, count, Icon }) => {
                const active = activeEventType === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectEventType(key)}
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

          <div className="mt-4">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text">{activeEvent.title}</div>
                <div className="mt-0.5 truncate text-[11px] text-text-tertiary">{activeEvent.description}</div>
              </div>
              <div className="shrink-0 text-[11px] text-text-tertiary">
                {visibleEventItems.length}/{activeEvent.items.length}
              </div>
            </div>
            <div className="shop-card divide-y divide-border overflow-hidden">
              {visibleEventItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-tertiary">当前没有需要处理的{activeEvent.label}</div>
              ) : activeEventType === 'applications' ? (
                visibleEventItems.map((item) => renderEventCard({
                  type: 'applications',
                  item,
                  meta: getApplicationMeta(item),
                  secondaryAction: (
                    <button
                      type="button"
                      onClick={(event) => handleInlineEventAction(event, () => updateApplicationStatus(item.id, '待补资料'))}
                      className="btn-default flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-medium active:opacity-80 cursor-pointer"
                    >
                      <FileText size={13} />
                      补资料
                    </button>
                  ),
                  primaryAction: (
                    <button
                      type="button"
                      onClick={(event) => handleInlineEventAction(event, () => updateApplicationStatus(item.id, '已通过'))}
                      className="btn-primary flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold active:opacity-80 cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      通过
                    </button>
                  ),
                  extra: <EventPill className="border-blue-100 bg-blue-50 text-blue-700">待资质核验</EventPill>,
                }))
              ) : activeEventType === 'complaints' ? (
                visibleEventItems.map((item) => renderEventCard({
                  type: 'complaints',
                  item,
                  meta: getComplaintMeta(item),
                  secondaryAction: (
                    <button
                      type="button"
                      onClick={(event) => handleInlineEventAction(event, () => updateComplaintStatus(item.id, '处理中'))}
                      className="btn-default flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-medium active:opacity-80 cursor-pointer"
                    >
                      <PhoneCall size={13} />
                      跟进中
                    </button>
                  ),
                  primaryAction: (
                    <button
                      type="button"
                      onClick={(event) => handleInlineEventAction(event, () => updateComplaintStatus(item.id, '已回访'))}
                      className="btn-primary flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold active:opacity-80 cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      已回访
                    </button>
                  ),
                  extra: item.status === '待处理' ? <EventPill className="border-red-100 bg-red-50 text-red-700">需首次响应</EventPill> : null,
                }))
              ) : (
                visibleEventItems.map((order) => renderEventCard({
                  type: 'reminders',
                  item: order,
                  meta: getReminderMeta(order),
                  secondaryAction: (
                    <button
                      type="button"
                      onClick={(event) => handleInlineEventAction(event, () => {
                        addToast('已通知护理师确认履约进度', 'success')
                      })}
                      className="btn-default flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-medium active:opacity-80 cursor-pointer"
                    >
                      <Send size={13} />
                      提醒护理师
                    </button>
                  ),
                  primaryAction: (
                    <button
                      type="button"
                      onClick={(event) => handleInlineEventAction(event, () => {
                        addToast('已升级给值班运营负责人', 'success')
                      })}
                      className="btn-primary flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold active:opacity-80 cursor-pointer"
                    >
                      <ShieldAlert size={13} />
                      升级
                    </button>
                  ),
                  extra: (
                    <>
                      <EventPill className="border-border bg-bg text-text-secondary">¥{order.price}</EventPill>
                      <EventPill className="border-border bg-bg text-text-secondary">
                        <Clock size={10} className="mr-1" />
                        {order.scheduledAt}
                      </EventPill>
                    </>
                  ),
                }))
              )}
            </div>
            {hasMoreEventItems && (
              <button
                ref={eventLoadMoreRef}
                type="button"
                onClick={() => setEventVisibleCount((count) => count + EVENT_PAGE_SIZE)}
                className="mt-3 h-10 w-full rounded-xl border border-border bg-surface text-xs font-medium text-text-secondary active:opacity-80 cursor-pointer"
              >
                加载更多
              </button>
            )}
          </div>
        </section>}

        {/* Product Management */}
        {activeModule === 'product' && <div className="px-4 mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">商品</h3>
            <button
              onClick={openAddForm}
              className="text-[11px] font-medium text-primary flex items-center gap-1 active:opacity-80 cursor-pointer"
            >
              <Plus size={12} /> 上新
            </button>
          </div>
          <div className="shop-card p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {productViewGroups.map(({ key, label, count, Icon }) => {
                const active = activeProductView === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveProductView(key)}
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

          <div className="mt-4">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text">{activeProductGroup.label}</div>
                <div className="mt-0.5 truncate text-[11px] text-text-tertiary">
                  {activeProductView === 'low' ? '库存低于 300，优先补货' : activeProductView === 'digest' ? '库存高且非热销，考虑活动' : '当前在售商品'}
                </div>
              </div>
              <div className="shrink-0 text-[11px] text-text-tertiary">{visibleProducts.length} 项</div>
            </div>
            <div className="shop-card divide-y divide-border overflow-hidden">
            {visibleProducts.map((product) => {
              const pc = productCategoryColors[product.category] || productCategoryColors.cat_food
              const action = activeProductView === 'low' ? '补库存' : activeProductView === 'digest' ? '加速消化' : null
              return (
                <div key={product.id} className="py-4 px-3 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br ${pc.from} ${pc.to} flex items-center justify-center text-lg font-heading font-bold ${pc.text}`}>
                    {product.image ? (
                      <ProductArt product={product} size="thumb" />
                    ) : (
                      product.brand?.[0] || product.name[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{product.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text font-semibold">¥{product.price}</span>
                      <span className="text-[10px] text-text-tertiary">库存{product.stock} · 已售{product.sales}</span>
                    </div>
                    {action && <div className="mt-1 text-[11px] font-medium text-primary">{action}</div>}
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
            {visibleProducts.length === 0 && (
              <div className="py-8 text-center text-sm text-text-tertiary">当前没有{activeProductGroup.label}</div>
            )}
            </div>
          </div>
        </div>}

        {/* Shipping Operations */}
        {activeModule === 'shipping' && <section className="px-4 mt-4 mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">商品交付</h3>
            <span className="text-[11px] text-text-tertiary">{pendingShipments.length} 项待交付</span>
          </div>
          <div className="shop-card p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {shippingViewGroups.map(({ key, label, count, Icon }) => {
                const active = activeShippingView === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveShippingView(key)}
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

          <div className="mt-4">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text">{activeShippingGroup.label}</div>
                <div className="mt-0.5 truncate text-[11px] text-text-tertiary">
                  {activeShippingView === 'express' ? '客户已选择快递，运营打包并发出' : '客户已选择上门，运营备货并交接给护理师'}
                </div>
              </div>
              <div className="shrink-0 text-[11px] text-text-tertiary">{visibleShipments.length} 项</div>
            </div>
            <div className="shop-card divide-y divide-border overflow-hidden">
              {visibleShipments.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-tertiary">当前没有{activeShippingGroup.label}</div>
              ) : visibleShipments.map((item) => (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text">{item.items}</div>
                      <div className="mt-1 text-xs text-text-secondary">{item.owner} · {item.deliveryType === 'express' ? '快递发货' : '上门备货'}</div>
                      <div className="mt-1 truncate text-[11px] text-text-tertiary">{item.address}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold text-text">¥{item.amount}</div>
                      <div className="mt-1 text-[11px] text-text-tertiary">{item.status}</div>
                    </div>
                  </div>
                  {!['已发货', '已交接'].includes(item.status) && (
                    <button
                      onClick={() => updateShipmentStatus(item.id, item.deliveryType === 'express' ? '已发货' : '已交接')}
                      className="mt-3 h-9 w-full rounded-lg btn-primary text-xs font-semibold active:opacity-80 cursor-pointer"
                    >
                      {item.deliveryType === 'express' ? '标记已发货' : '标记已备货交接'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>}
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
              <div>
                <label className="text-xs text-text-secondary mb-1 block">商品图片 *</label>
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl border border-border bg-bg overflow-hidden flex items-center justify-center shrink-0">
                    {form.image.trim() ? (
                      <img src={form.image.trim()} alt="商品图片预览" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={22} className="text-text-tertiary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      value={form.image}
                      onChange={(e) => handleFormChange('image', e.target.value)}
                      placeholder="粘贴商品主图 URL"
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <p className="mt-1.5 text-[11px] leading-relaxed text-text-tertiary">用于商城列表、详情页、购物车和确认订单。</p>
                  </div>
                </div>
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

      {/* Event Detail Drawer */}
      {eventDetail && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={() => setEventDetail(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-lg rounded-t-2xl bg-surface p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-primary">工单详情</div>
                <h3 className="mt-0.5 text-base font-semibold text-text">
                  {eventDetail.type === 'applications' ? eventDetail.item.name : eventDetail.type === 'complaints' ? eventDetail.item.owner : getServiceLabel(eventDetail.item)}
                </h3>
              </div>
              <button onClick={() => setEventDetail(null)} className="w-8 h-8 flex items-center justify-center cursor-pointer">
                <X size={18} className="text-text-tertiary" />
              </button>
            </div>

            {eventDetail.type === 'applications' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-bg p-3">
                  <div className="text-xs font-semibold text-text">申请信息</div>
                  <div className="mt-2 text-sm text-text">{eventDetail.item.experience}</div>
                  <div className="mt-1 text-xs text-text-tertiary">{eventDetail.item.area} · {eventDetail.item.status}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      updateApplicationStatus(eventDetail.item.id, '待补资料')
                      setEventDetail(null)
                    }}
                    className="btn-default h-10 rounded-xl text-sm font-medium active:opacity-80 cursor-pointer"
                  >
                    补资料
                  </button>
                  <button
                    onClick={() => {
                      updateApplicationStatus(eventDetail.item.id, '已通过')
                      setEventDetail(null)
                    }}
                    className="btn-primary h-10 rounded-xl text-sm font-semibold active:opacity-80 cursor-pointer"
                  >
                    通过
                  </button>
                </div>
              </div>
            )}

            {eventDetail.type === 'complaints' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-bg p-3">
                  <div className="text-xs font-semibold text-text">投诉内容</div>
                  <div className="mt-2 text-sm text-text">{eventDetail.item.reason}</div>
                  <div className="mt-1 text-xs text-text-tertiary">{eventDetail.item.target} · {eventDetail.item.status}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      updateComplaintStatus(eventDetail.item.id, '处理中')
                      setEventDetail(null)
                    }}
                    className="btn-default h-10 rounded-xl text-sm font-medium active:opacity-80 cursor-pointer"
                  >
                    处理中
                  </button>
                  <button
                    onClick={() => {
                      updateComplaintStatus(eventDetail.item.id, '已回访')
                      setEventDetail(null)
                    }}
                    className="btn-primary h-10 rounded-xl text-sm font-semibold active:opacity-80 cursor-pointer"
                  >
                    已回访
                  </button>
                </div>
              </div>
            )}

            {eventDetail.type === 'reminders' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-bg p-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold text-text">履约信息</div>
                    <StatusBadge status={eventDetail.item.status} />
                  </div>
                  <div className="mt-2 text-sm text-text">{eventDetail.item.petName} · {eventDetail.item.attention.text}</div>
                  <div className="mt-1 text-xs text-text-tertiary">{eventDetail.item.scheduledAt} · {eventDetail.item.caretakerName || '待接单'}</div>
                  <div className="mt-1 text-xs text-text-tertiary">{eventDetail.item.address}</div>
                </div>
                <button
                  onClick={() => setEventDetail(null)}
                  className="btn-primary h-10 w-full rounded-xl text-sm font-semibold active:opacity-80 cursor-pointer"
                >
                  知道了
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <TabBar />
    </>
  )
}
