import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useStore } from '../../data/store'
import { CheckCircle, Camera, FileText, AlertCircle } from 'lucide-react'

export default function SubmitReport() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { submitReport, addToast } = useStore()

  const [form, setForm] = useState({
    feedingCompleted: true,
    waterCompleted: true,
    windows: true,
    doors: true,
    hazards: false,
    behaviorNotes: '',
    litterCleaned: true,
  })
  const [photos, setPhotos] = useState([]) // array of dataURL strings
  const [showPhotoWarning, setShowPhotoWarning] = useState(false)

  const fileInputRef = useRef(null)

  const toggle = (key) => setForm((f) => ({ ...f, [key]: !f[key] }))

  const checklist = [
    { key: 'feedingCompleted', label: '喂食完成' },
    { key: 'waterCompleted', label: '饮水更换' },
    { key: 'litterCleaned', label: '猫砂/厕所清理' },
    { key: 'windows', label: '窗户已关闭' },
    { key: 'doors', label: '房门已关好' },
    { key: 'hazards', label: '发现安全隐患' },
  ]

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, ev.target.result])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    // Validate: notes are required
    if (!form.behaviorNotes.trim()) {
      addToast('请填写行为观察备注', 'error')
      return
    }

    // Warn if no photos (not blocking)
    if (photos.length === 0 && !showPhotoWarning) {
      setShowPhotoWarning(true)
      return
    }

    // Submit report to store
    submitReport({
      orderId: id,
      behaviorNotes: form.behaviorNotes,
      environmentCheck: {
        windows: form.windows,
        doors: form.doors,
        water: form.waterCompleted,
        food: form.feedingCompleted,
        litter: form.litterCleaned,
        hazards: form.hazards,
      },
      feedingCompleted: form.feedingCompleted,
      waterCompleted: form.waterCompleted,
      photos,
      createdAt: new Date().toLocaleString('zh-CN'),
    })

    addToast('报告提交成功', 'success')
    navigate('/caretaker')
  }

  return (
    <Layout title="提交服务报告" showBack onBack={() => navigate(-1)}>
      <div className="px-4 py-4 space-y-4">
        {/* Checklist */}
        <div className="shop-card p-5">
          <h3 className="text-sm font-semibold text-text mb-4">完成检查</h3>
          <div className="space-y-1">
            {checklist.map((item) => {
              const checked = form[item.key]
              return (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key)}
                  className={`w-full flex items-center justify-between py-3 px-3 rounded-lg active:opacity-60 transition-opacity cursor-pointer ${
                    checked ? 'shop-chip-active' : 'shop-chip-idle'
                  }`}
                >
                  <span className="text-sm">{item.label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-opacity ${
                    checked ? 'bg-primary-50' : 'bg-bg'
                  }`}>
                    {checked ? (
                      <CheckCircle size={18} className="text-primary" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border-strong" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Behavior Notes */}
        <div className="shop-card p-5">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <FileText size={14} className="text-text-tertiary" />
            行为观察
            <span className="text-danger text-xs">*必填</span>
          </h3>
          <textarea
            value={form.behaviorNotes}
            onChange={(e) => setForm((f) => ({ ...f, behaviorNotes: e.target.value }))}
            placeholder="描述宠物的精神状态、进食情况、互动表现等..."
            rows={4}
            className="shop-search w-full px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Photos */}
        <div className="shop-card p-5">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Camera size={14} className="text-text-tertiary" />
            上传照片
            {photos.length === 0 && (
              <span className="text-amber-500 text-xs flex items-center gap-1">
                <AlertCircle size={10} />
                建议至少上传1张
              </span>
            )}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-border">
                <img src={photo} alt={`photo-${i}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-xs active:opacity-60 transition-opacity cursor-pointer"
                >
                  x
                </button>
              </div>
            ))}
            <button
              onClick={handlePhotoClick}
              className="shop-soft-panel aspect-square border-2 border-dashed flex flex-col items-center justify-center text-text-tertiary active:opacity-60 transition-opacity cursor-pointer"
            >
              <Camera size={20} />
              <span className="text-[10px] mt-1">添加照片</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Photo Warning */}
        {showPhotoWarning && (
          <div className="shop-promo p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-amber-800">建议上传照片</div>
              <div className="text-xs text-amber-600 mt-0.5">上传服务照片可以让宠主更放心，再次点击提交可跳过此提示</div>
            </div>
            <button
              onClick={() => setShowPhotoWarning(false)}
              className="text-xs text-amber-600 underline flex-shrink-0 cursor-pointer"
            >
              知道了
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full btn-primary font-semibold py-4 rounded-lg text-base active:opacity-80 transition-opacity cursor-pointer"
        >
          提交报告
        </button>
      </div>
    </Layout>
  )
}
