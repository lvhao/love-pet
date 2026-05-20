import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useStore } from '../../data/store'
import { sopSteps } from '../../data/mock'
import { Check, Video, Camera, Undo2, RotateCcw, MapPin, ShieldCheck, GlassWater, UtensilsCrossed, Sparkles, Heart, Eye, DoorOpen } from 'lucide-react'

const stepIcons = [MapPin, ShieldCheck, GlassWater, UtensilsCrossed, Sparkles, Heart, Eye, DoorOpen]

function getSopStorageKey(orderId) {
  return `love-pet-sop-progress-${orderId}`
}

function loadSavedProgress(orderId) {
  try {
    const raw = localStorage.getItem(getSopStorageKey(orderId))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore corrupt data */ }
  return null
}

export default function ServiceExecution() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders, addToast } = useStore()
  const order = orders.find((o) => o.id === id)

  const savedProgress = useRef(loadSavedProgress(id))

  const [completedSteps, setCompletedSteps] = useState(savedProgress.current?.completedSteps || [])
  const [stepPhotos, setStepPhotos] = useState(savedProgress.current?.stepPhotos || {})
  const [stepTimes, setStepTimes] = useState(savedProgress.current?.stepTimes || {})
  const fileInputRef = useRef(null)
  const [photoStepId, setPhotoStepId] = useState(null)

  const currentStep = completedSteps.length
  const allDone = completedSteps.length === sopSteps.length
  const progress = (completedSteps.length / sopSteps.length) * 100

  const saveProgress = useCallback(() => {
    const data = { completedSteps, stepPhotos, stepTimes }
    localStorage.setItem(getSopStorageKey(id), JSON.stringify(data))
  }, [id, completedSteps, stepPhotos, stepTimes])

  useEffect(() => { saveProgress() }, [saveProgress])

  const clearProgress = () => {
    if (!window.confirm('确定要重置所有执行进度吗？此操作不可撤销。')) return
    setCompletedSteps([])
    setStepPhotos({})
    setStepTimes({})
    localStorage.removeItem(getSopStorageKey(id))
    addToast('进度已重置', 'info')
  }

  const completeStep = (stepId) => {
    if (completedSteps.includes(stepId)) return
    setCompletedSteps([...completedSteps, stepId])
    setStepTimes((prev) => ({
      ...prev,
      [stepId]: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }))
  }

  const undoStep = (stepId) => {
    setCompletedSteps(completedSteps.filter((s) => s !== stepId))
    setStepPhotos((prev) => {
      const next = { ...prev }
      delete next[stepId]
      return next
    })
    setStepTimes((prev) => {
      const next = { ...prev }
      delete next[stepId]
      return next
    })
    addToast('已撤销该步骤', 'info')
  }

  const undoLastStep = () => {
    if (completedSteps.length === 0) return
    const lastStepId = completedSteps[completedSteps.length - 1]
    undoStep(lastStepId)
  }

  // Photo → auto-complete the step
  const handlePhotoClick = (stepId) => {
    setPhotoStepId(stepId)
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !photoStepId) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setStepPhotos((prev) => ({ ...prev, [photoStepId]: ev.target.result }))
      completeStep(photoStepId)
      addToast(`${sopSteps.find((s) => s.id === photoStepId)?.title} 已完成`, 'success')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Direct complete without photo
  const handleDirectComplete = (stepId) => {
    completeStep(stepId)
    addToast(`${sopSteps.find((s) => s.id === stepId)?.title} 已完成`, 'success')
  }

  return (
    <Layout title="服务执行" showBack onBack={() => navigate(-1)}>
      <div className="px-4 py-4 space-y-4">
        {/* Current Step Card */}
        {!allDone && (
          <div className="shop-promo relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-primary/8" />
            <div className="text-xs text-text-secondary mb-1 font-medium">当前步骤 {currentStep + 1}/{sopSteps.length}</div>
            <div className="font-heading text-xl font-bold mb-1 text-primary">{sopSteps[currentStep]?.title}</div>
            <div className="text-sm text-text-secondary">{sopSteps[currentStep]?.desc}</div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handlePhotoClick(sopSteps[currentStep]?.id)}
                className="btn-primary font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center gap-1.5 active:opacity-80 transition-opacity cursor-pointer"
              >
                <Camera size={16} />
                拍照完成
              </button>
              <button
                onClick={() => handleDirectComplete(sopSteps[currentStep]?.id)}
                className="py-2.5 px-4 rounded-lg text-sm font-medium shop-secondary-action flex items-center gap-1.5 active:opacity-80 transition-opacity cursor-pointer"
              >
                <Check size={14} />
                直接完成
              </button>
            </div>
          </div>
        )}

        {/* All Done */}
        {allDone && (
          <div className="shop-promo text-center">
            <div className="text-2xl mb-2">&#127881;</div>
            <div className="font-heading text-lg font-bold text-primary mb-1">所有步骤已完成</div>
            <div className="text-sm text-text-secondary">请提交服务报告</div>
          </div>
        )}

        {/* Progress */}
        <div className="shop-card p-4">
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>执行进度</span>
            <span className="font-semibold text-primary">{completedSteps.length}/{sopSteps.length}</span>
          </div>
          <div className="w-full shop-soft-panel h-2 rounded-full p-0 overflow-hidden">
            <div className="bg-primary rounded-full h-2 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* SOP Steps */}
        <div className="shop-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">SOP 检查清单</h3>
            <div className="flex items-center gap-3">
              {completedSteps.length > 0 && (
                <button onClick={undoLastStep} className="text-xs text-text-tertiary flex items-center gap-1 active:opacity-60 transition-opacity cursor-pointer">
                  <Undo2 size={12} /> 撤销上一步
                </button>
              )}
              <button onClick={clearProgress} className="text-xs text-text-tertiary flex items-center gap-1 active:opacity-60 transition-opacity cursor-pointer">
                <RotateCcw size={12} /> 重置进度
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {sopSteps.map((step, i) => {
              const done = completedSteps.includes(step.id)
              const isCurrent = i === currentStep && !done
              const isLocked = i > currentStep && !done
              const StepIcon = stepIcons[i]
              const photo = stepPhotos[step.id]
              const time = stepTimes[step.id]
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    done ? 'bg-primary-50/50' : isCurrent ? 'shop-soft-panel' : ''
                  } ${isLocked ? 'opacity-40' : ''}`}
                >
                  {/* Step icon / check */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    done ? 'bg-primary' : isCurrent ? 'bg-primary' : 'bg-bg'
                  }`}>
                    {done ? (
                      <Check size={16} className="text-white" strokeWidth={2.5} />
                    ) : (
                      <StepIcon size={16} className={isCurrent ? 'text-white' : 'text-text-tertiary'} />
                    )}
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${done ? 'text-text-secondary' : isCurrent ? 'font-semibold' : 'text-text-secondary'}`}>
                      {step.title}
                    </div>
                    {time && <div className="text-[10px] text-primary mt-0.5">{time} 完成</div>}
                  </div>

                  {/* Photo thumbnail or action */}
                  {photo && (
                    <img src={photo} alt="step" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-primary/20" />
                  )}

                  {/* Actions */}
                  {done && !photo && (
                    <button
                      onClick={() => handlePhotoClick(step.id)}
                      className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center flex-shrink-0 active:opacity-60 transition-opacity cursor-pointer"
                    >
                      <Camera size={14} className="text-text-tertiary" />
                    </button>
                  )}
                  {done && (
                    <button
                      onClick={() => undoStep(step.id)}
                      className="text-[10px] text-text-tertiary active:opacity-60 transition-opacity cursor-pointer flex-shrink-0"
                    >
                      撤销
                    </button>
                  )}
                  {!done && !isLocked && !photo && (
                    <button
                      onClick={() => handlePhotoClick(step.id)}
                      className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center flex-shrink-0 active:opacity-60 transition-opacity cursor-pointer"
                    >
                      <Camera size={14} className="text-text-tertiary" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />

        {/* Streaming */}
        {!allDone && (
          <button
            onClick={() => navigate(`/caretaker/stream/${order?.id || id}`)}
            className="w-full btn-primary font-semibold py-4 rounded-lg text-base flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
          >
            <Video size={18} />
            <span className="w-2 h-2 bg-white rounded-full live-pulse" />
            开启看护直播
          </button>
        )}

        {/* Submit Report */}
        {allDone && (
          <button
            onClick={() => {
              localStorage.removeItem(getSopStorageKey(id))
              navigate(`/caretaker/report/${order?.id || id}`)
            }}
            className="w-full btn-primary font-semibold py-4 rounded-lg text-base active:opacity-80 transition-opacity cursor-pointer"
          >
            服务完成，提交报告
          </button>
        )}
      </div>
    </Layout>
  )
}
