import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import { useStore } from '../../data/store'
import { serviceTypes } from '../../data/mock'
import { exportRowsToExcel, toExcelCell } from '../../utils/exportExcel'
import { Download, FileSpreadsheet } from 'lucide-react'

const CURRENT_CARETAKER_ID = 'ct_1'
const ACTIVE_STATUSES = ['accepted', 'in_progress', 'streaming']

const detailConfig = {
  available: {
    title: '可接任务详情',
    desc: '开放接单池中当前可查看的待接任务',
    filename: '护理师可接任务',
  },
  current: {
    title: '当前服务详情',
    desc: '当前正在履约的服务订单',
    filename: '护理师当前服务',
  },
  completed: {
    title: '已完成详情',
    desc: '已完成服务记录明细',
    filename: '护理师已完成',
  },
}

function getServiceLabel(order) {
  return serviceTypes.find((service) => service.key === order.serviceType)?.label || '上门护理'
}

function buildCaretakerRows(type, orders) {
  if (type === 'available') {
    return orders
      .filter((order) => order.status === 'pending' && !order.caretakerId)
      .map((order) => ({
        订单: order.id,
        服务: getServiceLabel(order),
        宠物: order.petName,
        状态: '待接单',
        上门时间: order.scheduledAt,
        地址: order.address,
        金额: order.price,
      }))
  }

  if (type === 'current') {
    return orders
      .filter((order) => order.caretakerId === CURRENT_CARETAKER_ID && ACTIVE_STATUSES.includes(order.status))
      .map((order) => ({
        订单: order.id,
        服务: getServiceLabel(order),
        宠物: order.petName,
        状态: order.status,
        上门时间: order.scheduledAt,
        地址: order.address,
        金额: order.price,
      }))
  }

  if (type === 'completed') {
    return orders
      .filter((order) => order.caretakerId === CURRENT_CARETAKER_ID && order.status === 'completed')
      .map((order) => ({
        订单: order.id,
        服务: getServiceLabel(order),
        宠物: order.petName,
        状态: '已完成',
        上门时间: order.scheduledAt,
        报告: order.reportId ? '已提交' : '待补',
        金额: order.price,
      }))
  }

  return []
}

export { buildCaretakerRows }

export default function CaretakerStatsDetail() {
  const navigate = useNavigate()
  const { type = 'available' } = useParams()
  const { orders, addToast } = useStore()
  const config = detailConfig[type] || detailConfig.available
  const rows = useMemo(() => buildCaretakerRows(type, orders), [type, orders])
  const headers = Object.keys(rows[0] || {})

  const handleExport = () => {
    exportRowsToExcel(config.filename, rows)
    addToast('Excel 已开始导出', 'success')
  }

  return (
    <>
      <Layout title={config.title} showBack onBack={() => navigate('/caretaker')}>
        <div className="px-4 py-4 space-y-4">
          <div className="shop-card p-4">
            <div className="flex items-start gap-3">
              <div className="shop-promo-icon">
                <FileSpreadsheet size={18} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text">{config.title}</h3>
                <p className="mt-1 text-xs leading-5 text-text-tertiary">{config.desc}</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg btn-primary text-sm font-semibold active:opacity-80 cursor-pointer"
            >
              <Download size={15} />
              导出 Excel
            </button>
          </div>

          <div className="shop-card divide-y divide-border overflow-hidden">
            {rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-text-tertiary">暂无明细</div>
            ) : rows.map((row, index) => (
              <div key={index} className="px-4 py-3">
                <div className="text-sm font-semibold text-text">{toExcelCell(row[headers[0]])}</div>
                <div className="mt-2 grid gap-1.5">
                  {headers.slice(1).map((header) => (
                    <div key={header} className="flex items-start justify-between gap-3 text-xs">
                      <span className="shrink-0 text-text-tertiary">{header}</span>
                      <span className="min-w-0 text-right font-medium text-text-secondary">{toExcelCell(row[header])}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
      <TabBar />
    </>
  )
}
