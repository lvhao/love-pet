import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import RoleSwitcher from '../../components/RoleSwitcher'
import { useStore } from '../../data/store'
import { mockCaretakerApplications, mockComplaints } from '../../data/mock'
import { CalendarDays, TrendingUp, Package, ClipboardList, AlertCircle, CheckCircle, ShieldCheck, Download } from 'lucide-react'

const TODAY = '2026-05-21'
const CURRENT_MONTH = '2026-05'

function getOrderDate(order) {
  return order.scheduledAt?.slice(0, 10) || ''
}

function getOrderMonth(order) {
  return order.scheduledAt?.slice(0, 7) || ''
}

function formatMoney(value) {
  if (value >= 10000) return `¥${(value / 10000).toFixed(1)}w`
  return `¥${value}`
}

function buildOperatorDataCards(products, orders) {
  const completedServiceOrders = orders.filter((order) => order.status === 'completed' && order.serviceType !== 'product')
  const todayRevenue = completedServiceOrders
    .filter((order) => getOrderDate(order) === TODAY)
    .reduce((sum, order) => sum + order.price, 0)
  const monthRevenue = completedServiceOrders
    .filter((order) => getOrderMonth(order) === CURRENT_MONTH)
    .reduce((sum, order) => sum + order.price, 0)
  const productTotalGmv = products.reduce((sum, product) => sum + product.price * product.sales, 0)
  const pendingOrders = orders.filter((order) => order.status === 'pending' && !order.caretakerId)
  const activeOrders = orders.filter((order) => ['accepted', 'in_progress', 'streaming'].includes(order.status))
  const completedWithoutReport = orders.filter((order) => order.status === 'completed' && !order.reportId)
  const completedOrders = orders.filter((order) => order.status === 'completed')
  const waitingApplicationCount = mockCaretakerApplications.filter((item) => item.status === '待审核').length
  const openComplaintCount = mockComplaints.filter((item) => item.status !== '已回访').length

  return [
    {
      key: 'business',
      label: '经营',
      title: '经营数据',
      desc: '服务成交、商品销售和收入结构',
      count: formatMoney(monthRevenue),
      Icon: TrendingUp,
      metrics: [
        { label: '今日服务成交', value: formatMoney(todayRevenue), Icon: CalendarDays },
        { label: '本月服务成交', value: formatMoney(monthRevenue), Icon: TrendingUp },
        { label: '在售商品', value: products.length, Icon: Package },
        { label: '商品累计GMV', value: formatMoney(productTotalGmv), Icon: TrendingUp },
      ],
    },
    {
      key: 'fulfillment',
      label: '履约',
      title: '履约数据',
      desc: '订单接单、服务中、完成和报告闭环',
      count: activeOrders.length,
      Icon: ClipboardList,
      metrics: [
        { label: '待接单', value: pendingOrders.length, Icon: AlertCircle },
        { label: '履约中', value: activeOrders.length, Icon: ClipboardList },
        { label: '已完成', value: completedOrders.length, Icon: CheckCircle },
        { label: '待报告', value: completedWithoutReport.length, Icon: AlertCircle },
      ],
    },
    {
      key: 'governance',
      label: '治理',
      title: '治理数据',
      desc: '准入审核、客户投诉和服务闭环压力',
      count: waitingApplicationCount + openComplaintCount + completedWithoutReport.length,
      Icon: ShieldCheck,
      metrics: [
        { label: '待审核护理师', value: waitingApplicationCount, Icon: CheckCircle },
        { label: '处理中客诉', value: openComplaintCount, Icon: AlertCircle },
        { label: '待补报告', value: completedWithoutReport.length, Icon: ClipboardList },
      ],
    },
  ]
}

export { buildOperatorDataCards }

export default function OperatorData() {
  const navigate = useNavigate()
  const { products, orders } = useStore()
  const cards = buildOperatorDataCards(products, orders)
  const [activeType, setActiveType] = useState(cards[0]?.key || 'business')
  const activeCard = cards.find((card) => card.key === activeType) || cards[0]

  return (
    <>
      <Layout title="运营数据">
        <RoleSwitcher />

        <div className="px-4 mt-4 pb-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">数据</h3>
            <span className="text-[11px] text-text-tertiary">详情页可导出 Excel</span>
          </div>
          <div className="shop-card p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {cards.map(({ key, label, count, Icon }) => {
                const active = activeType === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveType(key)}
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
                <div className="text-xs font-semibold text-text">{activeCard.title}</div>
                <div className="mt-0.5 truncate text-[11px] text-text-tertiary">{activeCard.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/operator/data/${activeCard.key}`)}
                className="shrink-0 text-[11px] font-medium text-primary active:opacity-80 cursor-pointer"
              >
                详情
              </button>
            </div>
            <div className="shop-card divide-y divide-border overflow-hidden">
              {activeCard.metrics.map(({ label, value, Icon }) => (
                <div key={label} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon size={15} className="shrink-0 text-text-tertiary" />
                      <div className="truncate text-sm font-medium text-text-secondary">{label}</div>
                    </div>
                    <div className="shrink-0 text-lg font-heading font-bold text-text">{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate(`/operator/data/${activeCard.key}`)}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-xs font-semibold text-primary active:opacity-80 cursor-pointer"
            >
              <Download size={14} />
              查看明细并导出 Excel
            </button>
          </div>
        </div>
      </Layout>
      <TabBar />
    </>
  )
}
