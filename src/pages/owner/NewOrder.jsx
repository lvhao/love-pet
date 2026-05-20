import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import PetAvatar from '../../components/PetAvatar'
import { serviceTypes } from '../../data/mock'
import { useStore } from '../../data/store'
import { UtensilsCrossed, Dog, ShowerHead, MapPin, FileText, Check, Video, ChevronDown, Plus, Clock, RotateCcw } from 'lucide-react'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const TIME_GROUPS = [
  { label: '早上 8:00-12:00', start: 8, end: 11, slots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
  { label: '下午 13:00-17:00', start: 13, end: 16, slots: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'] },
  { label: '晚上 17:00-21:00', start: 17, end: 20, slots: ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'] },
]

function getNext15Days() {
  const days = []
  const now = new Date()
  for (let i = 0; i < 15; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    days.push({
      value: d.toISOString().slice(0, 10),
      weekday: i === 0 ? '今天' : i === 1 ? '明天' : WEEKDAYS[d.getDay()],
      day: d.getDate(),
    })
  }
  return days
}

function getFirstAvailableTime(dateStr) {
  const now = new Date()
  const isToday = dateStr === now.toISOString().slice(0, 10)
  for (const group of TIME_GROUPS) {
    for (const slot of group.slots) {
      if (!isToday) return slot
      const [h, m] = slot.split(':').map(Number)
      if (h > now.getHours() || (h === now.getHours() && m > now.getMinutes())) {
        return slot
      }
    }
  }
  return ''
}

const serviceIcons = {
  feeding: UtensilsCrossed,
  feeding_walk: Dog,
  feeding_grooming: ShowerHead,
}

const serviceColors = {
  feeding: { bg: 'bg-feeding', light: 'bg-feeding-50', text: 'text-feeding', border: 'border-feeding/30' },
  feeding_walk: { bg: 'bg-walking', light: 'bg-walking-50', text: 'text-walking', border: 'border-walking/30' },
  feeding_grooming: { bg: 'bg-grooming', light: 'bg-grooming-50', text: 'text-grooming', border: 'border-grooming/30' },
}

const FORM_STORAGE_KEY = 'love-pet-new-order-form'

function loadSavedForm() {
  try {
    const raw = localStorage.getItem(FORM_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore corrupt data */ }
  return null
}

export default function NewOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const { pets, addresses, addOrder, addAddress, addToast } = useStore()

  const savedForm = useMemo(() => loadSavedForm(), [])
  const initialType = location.state?.serviceType || savedForm?.serviceType || 'feeding'

  const [serviceType, setServiceType] = useState(initialType)
  const [petId, setPetId] = useState(savedForm?.petId || pets[0]?.id || '')
  const [date, setDate] = useState(savedForm?.date || (() => new Date().toISOString().slice(0, 10)))
  const [time, setTime] = useState(savedForm?.time || (() => getFirstAvailableTime(new Date().toISOString().slice(0, 10))))
  const [selectedAddrId, setSelectedAddrId] = useState(savedForm?.selectedAddrId || (() => addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ''))
  const [addrExpanded, setAddrExpanded] = useState(false)
  const [showNewAddrForm, setShowNewAddrForm] = useState(false)
  const [newAddrName, setNewAddrName] = useState('')
  const [newAddrPhone, setNewAddrPhone] = useState('')
  const [newAddrDetail, setNewAddrDetail] = useState('')
  const [notes, setNotes] = useState(savedForm?.notes ?? '')
  const [errors, setErrors] = useState({})

  // Persist form state to localStorage on any field change
  const saveForm = useCallback(() => {
    const formData = { serviceType, petId, date, time, selectedAddrId, notes }
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
  }, [serviceType, petId, date, time, selectedAddrId, notes])

  useEffect(() => {
    saveForm()
  }, [saveForm])

  const clearForm = () => {
    setServiceType('feeding')
    setPetId(pets[0]?.id || '')
    setDate(new Date().toISOString().slice(0, 10))
    setTime(getFirstAvailableTime(new Date().toISOString().slice(0, 10)))
    setSelectedAddrId(addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || '')
    setNotes('')
    setErrors({})
    localStorage.removeItem(FORM_STORAGE_KEY)
    addToast('表单已清空', 'info')
  }

  const selectedService = serviceTypes.find((s) => s.key === serviceType)
  const selectedPet = pets.find((p) => p.id === petId)

  const dateOptions = useMemo(() => getNext15Days(), [])

  const validate = () => {
    const errs = {}
    if (!petId) errs.pet = '请选择宠物'
    if (!date) errs.date = '请选择日期'
    if (!time) errs.time = '请选择时间'
    if (!selectedAddrId) errs.address = '请选择服务地址'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const addr = addresses.find((a) => a.id === selectedAddrId)
    const newOrder = addOrder({
      ownerId: 'owner_1',
      petId,
      petName: selectedPet?.name || '',
      serviceType,
      scheduledAt: `${date} ${time}`,
      address: addr?.address || '',
      price: selectedService?.price || 0,
      caretakerId: null,
      caretakerName: null,
      notes,
    })

    localStorage.removeItem(FORM_STORAGE_KEY)
    addToast('下单成功', 'success')
    navigate(`/owner/orders/${newOrder.id}`)
  }

  return (
    <Layout title="预约上门护理" showBack onBack={() => navigate(-1)}>
      <div className="order-page px-4 py-4 pb-32 space-y-4">
        <div className="order-hero p-5">
          <div className="text-xl font-heading font-bold text-text">给毛孩子安排一次安心照护</div>
          <div className="mt-1.5 text-sm text-text-secondary leading-relaxed">确认服务、宠物、上门时间和地址，护理师接单后会按流程上门。</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="order-inner-panel py-2">
              <div className="text-[11px] text-text-tertiary">服务</div>
              <div className="text-xs font-semibold text-text mt-0.5 truncate px-1">{selectedService?.label}</div>
            </div>
            <div className="order-inner-panel py-2">
              <div className="text-[11px] text-text-tertiary">宠物</div>
              <div className="text-xs font-semibold text-text mt-0.5 truncate px-1">{selectedPet?.name || '未选择'}</div>
            </div>
            <div className="order-inner-panel py-2">
              <div className="text-[11px] text-text-tertiary">时间</div>
              <div className="text-xs font-semibold text-text mt-0.5 truncate px-1">{time || '待定'}</div>
            </div>
          </div>
        </div>

        {/* Service Type */}
        <section className="order-section p-5">
          <div className="flex items-center gap-2.5">
            <span className="order-step w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <h2 className="text-sm font-semibold text-text">选择服务</h2>
          </div>
          <div className="mt-3 space-y-2">
            {serviceTypes.map((s) => {
              const Icon = serviceIcons[s.key]
              const sc = serviceColors[s.key]
              const isSelected = serviceType === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setServiceType(s.key)}
                  className={`w-full rounded-2xl p-3.5 flex items-center gap-3.5 active:opacity-80 transition-all cursor-pointer ${
                    isSelected
                      ? `order-option-selected ${sc.border}`
                      : 'order-option'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? sc.bg : 'order-icon-soft'
                  }`}>
                    <Icon size={18} className={isSelected ? 'text-white' : sc.text} strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold text-text">{s.label}</div>
                    <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">{s.desc}</div>
                  </div>
                  <div className="text-base font-bold shop-price">¥{s.price}</div>
                  {isSelected && (
                    <div className={`w-5 h-5 rounded-full ${sc.bg} flex items-center justify-center shrink-0`}>
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Pet Selection */}
        <section className="order-section p-5">
          <div className="flex items-center gap-2.5">
            <span className="order-step w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-sm font-semibold text-text">选择宠物</h2>
          </div>
          <div className="mt-3 flex gap-3">
            {pets.map((pet) => {
              const isSelected = petId === pet.id
              return (
                <button
                  key={pet.id}
                  onClick={() => { setPetId(pet.id); setErrors((p) => ({ ...p, pet: undefined })) }}
                  className={`flex-1 min-w-0 flex flex-col items-center gap-2 p-4 rounded-2xl active:opacity-80 transition-all cursor-pointer ${
                    isSelected ? 'order-option-selected' : 'order-option'
                  }`}
                >
                  <PetAvatar type={pet.type} size="md" />
                  <div className="text-sm font-semibold text-text truncate max-w-full">{pet.name}</div>
                  <div className="text-[11px] text-text-tertiary truncate max-w-full">{pet.breed}</div>
                </button>
              )
            })}
          </div>
          {errors.pet && <div className="text-xs text-danger mt-1">{errors.pet}</div>}
        </section>

        {/* Date & Time */}
        <section className="order-section p-5">
          <div className="flex items-center gap-2.5">
            <span className="order-step w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <h2 className="text-sm font-semibold text-text">预约时间</h2>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {dateOptions.map((d) => {
              const isSelected = date === d.value
              return (
                <button
                  key={d.value}
                  onClick={() => {
                    setDate(d.value);
                    setErrors((p) => ({ ...p, date: undefined, time: undefined }));
                    const allSlots = TIME_GROUPS.flatMap(g => {
                      const now = new Date();
                      const isToday = d.value === now.toISOString().slice(0, 10);
                      if (isToday && now.getHours() > g.end) return []
                      const visible = isToday
                        ? g.slots.filter((s) => {
                            const [h, m] = s.split(':').map(Number)
                            return h > now.getHours() || (h === now.getHours() && m > now.getMinutes())
                          })
                        : g.slots
                      return visible
                    })
                    if (!allSlots.includes(time)) {
                      setTime(allSlots[0] || '')
                    }
                  }}
                  className={`shrink-0 w-14 py-2.5 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                    isSelected
                      ? 'order-option-selected'
                      : 'order-option'
                  }`}
                >
                  <span className="text-[10px] font-medium leading-none text-text-tertiary">{d.weekday}</span>
                  <span className="text-base font-heading leading-tight text-text">{d.day}</span>
                </button>
              )
            })}
          </div>
          {errors.date && <div className="text-xs text-danger mt-1">{errors.date}</div>}

          {/* Time range hint */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
            <Clock size={12} />
            <span>可接单时段：08:00 - 21:00</span>
          </div>

          {/* Time picker — grouped by morning/afternoon/evening */}
          <div className="mt-4 space-y-3">
            {TIME_GROUPS.map((group) => {
              const now = new Date()
              const isToday = date === now.toISOString().slice(0, 10)
              const currentHour = now.getHours()
              // Hide entire group if today and all slots have passed
              if (isToday && currentHour > group.end) return null
              const visibleSlots = isToday
                ? group.slots.filter((s) => {
                    const [h, m] = s.split(':').map(Number)
                    return h > currentHour || (h === currentHour && m > now.getMinutes())
                  })
                : group.slots
              if (visibleSlots.length === 0) return null
              return (
                <div key={group.label}>
                  <div className="text-xs text-text-tertiary font-medium mb-1.5">{group.label}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {visibleSlots.map((slot) => {
                      const isSelected = time === slot
                      return (
                        <button
                          key={slot}
                          onClick={() => { setTime(slot); setErrors((p) => ({ ...p, time: undefined })) }}
                          className={`py-2 rounded-lg text-sm font-medium active:scale-95 transition-all cursor-pointer ${
                            isSelected
                              ? 'order-option-selected'
                              : 'order-option'
                          }`}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          {errors.time && <div className="text-xs text-danger mt-1">{errors.time}</div>}
        </section>

        {/* Address */}
        <section className="order-section p-5">
          <div className="flex items-center gap-2.5">
            <span className="order-step w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <h2 className="text-sm font-semibold text-text">服务地址</h2>
          </div>
          <div className="mt-3">
            {/* Collapsed: show selected address */}
            {!addrExpanded && !showNewAddrForm && selectedAddrId && (() => {
              const addr = addresses.find((a) => a.id === selectedAddrId)
              return addr ? (
                <button
                  onClick={() => { setAddrExpanded(true); setErrors((p) => ({ ...p, address: undefined })) }}
                  className="w-full order-inner-panel p-4 flex items-start gap-3 active:opacity-80 transition-opacity cursor-pointer text-left"
                >
                  <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{addr.name}</span>
                      <span className="text-xs text-text-secondary">{addr.phone}</span>
                      {addr.isDefault && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">默认</span>}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">{addr.address}</div>
                  </div>
                  <ChevronDown size={16} className="text-text-tertiary mt-1 flex-shrink-0" />
                </button>
              ) : null
            })()}

            {/* Expanded: address list */}
            {addrExpanded && !showNewAddrForm && (
              <div className="order-inner-panel divide-y divide-border overflow-hidden">
                {addresses.map((a) => {
                  const isSelected = selectedAddrId === a.id
                  return (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedAddrId(a.id); setAddrExpanded(false); setErrors((p) => ({ ...p, address: undefined })) }}
                      className={`w-full p-4 flex items-start gap-3 active:opacity-80 transition-opacity cursor-pointer text-left ${
                        isSelected ? 'bg-[#fff4ec]' : 'bg-white'
                      }`}
                    >
                      <MapPin size={18} className={isSelected ? 'text-primary mt-0.5' : 'text-text-tertiary mt-0.5'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{a.name}</span>
                          <span className="text-xs text-text-secondary">{a.phone}</span>
                          {a.isDefault && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">默认</span>}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">{a.address}</div>
                      </div>
                      {isSelected && <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />}
                    </button>
                  )
                })}
                <button
                  onClick={() => { setShowNewAddrForm(true); setAddrExpanded(false) }}
                  className="w-full p-3 flex items-center justify-center gap-1.5 text-xs text-primary font-medium active:opacity-80 transition-opacity cursor-pointer"
                >
                  <Plus size={14} />
                  新增地址
                </button>
              </div>
            )}

            {/* New address form */}
            {showNewAddrForm && (
              <div className="order-inner-panel p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm font-semibold">新增服务地址</span>
                </div>
                <input
                  type="text"
                  value={newAddrName}
                  onChange={(e) => setNewAddrName(e.target.value)}
                  placeholder="联系人姓名"
                  className="order-input w-full px-3 py-2.5 text-sm focus:outline-none transition-colors"
                />
                <input
                  type="tel"
                  value={newAddrPhone}
                  onChange={(e) => setNewAddrPhone(e.target.value)}
                  placeholder="联系电话"
                  className="order-input w-full px-3 py-2.5 text-sm focus:outline-none transition-colors"
                />
                <textarea
                  value={newAddrDetail}
                  onChange={(e) => setNewAddrDetail(e.target.value)}
                  placeholder="详细地址：小区/大厦/门牌号..."
                  rows={2}
                  className="order-input w-full px-3 py-2.5 text-sm focus:outline-none transition-colors resize-none"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setShowNewAddrForm(false); setNewAddrName(''); setNewAddrPhone(''); setNewAddrDetail('') }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium shop-secondary-action active:opacity-80 transition-opacity cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrDetail.trim()) return
                      const newAddr = addAddress({
                        name: newAddrName.trim(),
                        phone: newAddrPhone.trim(),
                        address: newAddrDetail.trim(),
                        isDefault: false,
                      })
                      setSelectedAddrId(newAddr.id)
                      setShowNewAddrForm(false)
                      setNewAddrName(''); setNewAddrPhone(''); setNewAddrDetail('')
                      setErrors((p) => ({ ...p, address: undefined }))
                    }}
                    className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium active:opacity-80 transition-opacity cursor-pointer"
                  >
                    保存
                  </button>
                </div>
              </div>
            )}
          </div>
          {errors.address && <div className="text-xs text-danger mt-1">{errors.address}</div>}
        </section>

        {/* Notes */}
        <section className="order-section p-5">
          <div className="flex items-center gap-2.5">
            <span className="order-step w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">5</span>
            <h2 className="text-sm font-semibold text-text">服务备注</h2>
          </div>
          <div className="mt-3 relative">
            <FileText size={14} className="absolute left-3 top-3 text-text-tertiary" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="猫粮在厨房柜子里，每天2勺..."
              rows={3}
              className="order-input w-full pl-9 pr-3 py-2.5 text-sm focus:outline-none transition-colors resize-none"
            />
          </div>
        </section>

        <div className="order-submit-bar fixed left-0 right-0 bottom-0 z-40 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-lg flex items-center gap-3">
            <div>
              <div className="text-[11px] text-text-tertiary">预计费用</div>
              <div className="text-2xl font-heading shop-price tracking-tight">¥{selectedService?.price}</div>
              <div className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <Video size={12} className="text-primary" />
                含看护直播
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={clearForm}
                className="w-11 h-11 rounded-full shop-secondary-action active:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
                aria-label="清空表单"
              >
                <RotateCcw size={17} />
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary font-semibold px-5 py-3 rounded-full text-sm active:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
              >
                给{selectedPet?.name || '毛孩子'}安排上
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
