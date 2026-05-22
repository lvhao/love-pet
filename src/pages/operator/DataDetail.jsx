import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import { useStore } from '../../data/store'
import { mockCaretakerApplications, mockComplaints, serviceTypes } from '../../data/mock'
import { exportRowsToExcel, toExcelCell } from '../../utils/exportExcel'
import { Download, FileSpreadsheet } from 'lucide-react'

const detailConfig = {
  business: {
    title: '经营数据详情',
    desc: '服务订单与商品销售明细',
    filename: '经营数据',
  },
  fulfillment: {
    title: '履约数据详情',
    desc: '接单、服务中、完成与报告闭环明细',
    filename: '履约数据',
  },
  governance: {
    title: '治理数据详情',
    desc: '护理师审核、客诉和待补报告明细',
    filename: '治理数据',
  },
}

function getServiceLabel(order) {
  if (order.serviceType === 'product') return '商品订单'
  return serviceTypes.find((service) => service.key === order.serviceType)?.label || '上门护理'
}

function buildRows(type, products, orders) {
  if (type === 'business') {
    const serviceRows = orders
      .filter((order) => order.serviceType !== 'product')
      .map((order) => ({
        类型: '服务',
        名称: getServiceLabel(order),
        状态: order.status,
        金额: order.price,
        时间: order.scheduledAt,
      }))
    const productRows = products.map((product) => ({
      类型: '商品',
      名称: product.name,
      状态: `库存${product.stock}`,
      金额: product.price * product.sales,
      时间: `已售${product.sales}`,
    }))
    return serviceRows.concat(productRows)
  }

  if (type === 'fulfillment') {
    return orders
      .filter((order) => order.serviceType !== 'product')
      .map((order) => ({
        订单: order.id,
        服务: getServiceLabel(order),
        宠物: order.petName,
        状态: order.status,
        护理师: order.caretakerName || '待接单',
        上门时间: order.scheduledAt,
        报告: order.reportId ? '已提交' : '待补',
      }))
  }

  if (type === 'governance') {
    const applicationRows = mockCaretakerApplications.map((item) => ({
      类型: '护理师申请',
      对象: item.name,
      事项: item.experience,
      状态: item.status,
      备注: item.area,
    }))
    const complaintRows = mockComplaints.map((item) => ({
      类型: '客户投诉',
      对象: item.owner,
      事项: item.reason,
      状态: item.status,
      备注: item.target,
    }))
    const reportRows = orders
      .filter((order) => order.status === 'completed' && !order.reportId)
      .map((order) => ({
        类型: '待补报告',
        对象: order.caretakerName || '护理师',
        事项: `${order.petName} · ${getServiceLabel(order)}`,
        状态: '待补报告',
        备注: order.scheduledAt,
      }))
    return applicationRows.concat(complaintRows, reportRows)
  }

  return []
}

export { buildRows, exportRowsToExcel }

export default function OperatorDataDetail() {
  const navigate = useNavigate()
  const { type = 'business' } = useParams()
  const { products, orders, addToast } = useStore()
  const config = detailConfig[type] || detailConfig.business
  const rows = useMemo(() => buildRows(type, products, orders), [type, products, orders])
  const headers = Object.keys(rows[0] || {})

  const handleExport = () => {
    exportRowsToExcel(config.filename, rows)
    addToast('Excel 已开始导出', 'success')
  }

  return (
    <>
      <Layout title={config.title} showBack onBack={() => navigate('/operator/data')}>
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
            {rows.map((row, index) => (
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
