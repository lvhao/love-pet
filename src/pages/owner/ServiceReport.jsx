import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useStore } from '../../data/store'
import { CheckCircle, XCircle, Camera, Star, Cat, UtensilsCrossed, Sparkles, FileText } from 'lucide-react'

const photoIcons = [Cat, UtensilsCrossed, Sparkles]

export default function ServiceReport() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { orders, reports, updateReportRating } = useStore()

  // Try to find report by reportId (from URL) or by orderId
  let report = reports.find((r) => r.id === id)
  if (!report) {
    // If id looks like an orderId, find the report linked to that order
    const order = orders.find((o) => o.id === id)
    if (order?.reportId) {
      report = reports.find((r) => r.id === order.reportId)
    }
  }

  const [rating, setRating] = useState(report?.rating || 0)

  const handleRating = (value) => {
    setRating(value)
    if (report) {
      updateReportRating(report.id, value)
    }
  }

  // Report not found
  if (!report) {
    return (
      <Layout title="服务报告" showBack onBack={() => navigate(-1)}>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center mb-4">
            <FileText size={28} className="text-text-tertiary" />
          </div>
          <h3 className="font-heading text-lg mb-2">报告尚未生成</h3>
          <p className="text-sm text-text-secondary mb-6">服务完成后护理师将提交报告，请稍后再查看</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary font-semibold px-6 py-2.5 rounded-lg text-sm active:opacity-80 transition-opacity cursor-pointer"
          >
            返回
          </button>
        </div>
      </Layout>
    )
  }

  const checkItems = [
    { key: 'windows', label: '窗户关闭' },
    { key: 'doors', label: '房门安全' },
    { key: 'water', label: '饮水充足' },
    { key: 'food', label: '食物充足' },
    { key: 'litter', label: '猫砂清洁' },
    { key: 'hazards', label: '无安全隐患' },
  ]

  return (
    <Layout title="服务报告" showBack onBack={() => navigate(-1)}>
      <div className="px-4 py-4 space-y-4">
        {/* Summary Card */}
        <div className="shop-promo relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/8" />
          <div className="font-heading text-xl font-bold text-primary">服务完成</div>
          <div className="text-sm text-text-secondary mt-1">{report.createdAt}</div>
          <div className="flex gap-5 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-primary">
              <CheckCircle size={14} /> 喂食完成
            </div>
            <div className="flex items-center gap-1.5 text-sm text-primary">
              <CheckCircle size={14} /> 饮水更换
            </div>
          </div>
        </div>

        {/* Environment Check */}
        <div className="shop-card p-5">
          <h3 className="text-sm font-semibold text-text mb-4">环境安全检查</h3>
          <div className="grid grid-cols-2 gap-3">
            {checkItems.map((item) => {
              const passed = report.environmentCheck[item.key]
              return (
                <div key={item.key} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${
                  passed ? 'bg-primary-50' : 'bg-red-50'
                }`}>
                  {passed ? (
                    <CheckCircle size={16} className="text-primary" />
                  ) : (
                    <XCircle size={16} className="text-danger" />
                  )}
                  <span className={`text-xs font-medium ${passed ? 'text-primary' : 'text-danger'}`}>{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Behavior Notes */}
        <div className="shop-card p-5">
          <h3 className="text-sm font-semibold text-text mb-3">行为观察</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{report.behaviorNotes}</p>
        </div>

        {/* Photos */}
        <div className="shop-card p-5">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Camera size={14} className="text-text-tertiary" />
            服务照片
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {photoIcons.map((PhotoIcon, i) => (
              <div key={i} className="aspect-square bg-bg rounded-lg flex items-center justify-center border border-border">
                <PhotoIcon size={24} className="text-text-tertiary" />
              </div>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="shop-card p-5 text-center">
          <h3 className="text-sm font-semibold text-text mb-3">对本次服务满意吗？</h3>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => handleRating(i)} className="active:opacity-60 transition-opacity cursor-pointer">
                <Star size={28} className={`transition-colors ${i <= rating ? 'text-amber-400' : 'text-border hover:text-amber-300'}`} fill={i <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <div className="text-xs text-text-tertiary mt-2">{rating}.0 / 5.0</div>
        </div>
      </div>
    </Layout>
  )
}
