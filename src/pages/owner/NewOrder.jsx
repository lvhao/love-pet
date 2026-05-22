import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import PetAvatar from '../../components/PetAvatar'
import { serviceTypes } from '../../data/mock'
import { useStore } from '../../data/store'
import { UtensilsCrossed, Dog, ShowerHead, MapPin, FileText, Check, ChevronDown, Plus, Clock } from 'lucide-react'

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
    const isCurrentMonth = d.getMonth() === now.getMonth()
    days.push({
      value: d.toISOString().slice(0, 10),
      weekday: i === 0 ? '今天' : i === 1 ? '明天' : WEEKDAYS[d.getDay()],
      day: d.getDate(),
      month: d.getMonth() + 1,
      showMonth: i > 1 && !isCurrentMonth,
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

function formatDateForSummary(dateStr, dateOptions) {
  const option = dateOptions.find((d) => d.value === dateStr)
  if (!option) return ''
  if (option.weekday === '今天' || option.weekday === '明天') return option.weekday
  return option.showMonth ? `${option.month}/${option.day}` : `${option.day}日`
}

const serviceIcons = {
  feeding: UtensilsCrossed,
  feeding_walk: Dog,
  feeding_grooming: ShowerHead,
}

const FORM_STORAGE_KEY = 'love-pet-new-order-form'

const NOTE_SUGGESTIONS = [
  '食物和水碗在厨房',
  '进门请先安抚，不要强抱',
  '服务完成后请多拍几张照片',
]

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
  const [showAllTimes, setShowAllTimes] = useState(false)
  const [activeTimeGroup, setActiveTimeGroup] = useState('all')
  const [petExpanded, setPetExpanded] = useState(false)
  const sectionRefs = {
    service: useRef(null),
    time: useRef(null),
    pet: useRef(null),
    address: useRef(null),
  }

  // Persist form state to localStorage on any field change
  const saveForm = useCallback(() => {
    const formData = { serviceType, petId, date, time, selectedAddrId, notes }
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
  }, [serviceType, petId, date, time, selectedAddrId, notes])

  useEffect(() => {
    saveForm()
  }, [saveForm])

  const selectedService = serviceTypes.find((s) => s.key === serviceType)
  const selectedPet = pets.find((p) => p.id === petId)

  const dateOptions = useMemo(() => getNext15Days(), [])

  const getValidationErrors = () => {
    const errs = {}
    if (!petId) errs.pet = '请选择宠物'
    if (!date) errs.date = '请选择日期'
    if (!time) errs.time = '请选择时间'
    if (!selectedAddrId) errs.address = '请选择服务地址'
    return errs
  }

  const scrollToMissingSection = (errs) => {
    const firstKey = errs.time || errs.date ? 'time' : errs.pet ? 'pet' : errs.address ? 'address' : 'service'
    sectionRefs[firstKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = () => {
    const errs = getValidationErrors()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      scrollToMissingSection(errs)
      return
    }

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
    navigate(`/owner/order/${newOrder.id}`)
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddrId)
  const missingCount = [selectedService, selectedPet, date && time, selectedAddress].filter((item) => !item).length
  const isReady = missingCount === 0
  const nextMissingLabel = !selectedService
    ? '请选择服务'
    : !date || !time
      ? '请选择上门时间'
      : !selectedPet
        ? '请补充宠物资料'
        : !selectedAddress
          ? '请补充上门地址'
          : ''
  const dateSummary = formatDateForSummary(date, dateOptions)
  const orderSummary = isReady
    ? `${selectedService?.label} · ${dateSummary} ${time}`
    : nextMissingLabel

  const availableTimeGroups = TIME_GROUPS.map((group) => {
    const now = new Date()
    const isToday = date === now.toISOString().slice(0, 10)
    const currentHour = now.getHours()
    if (isToday && currentHour > group.end) return null
    const visibleSlots = isToday
      ? group.slots.filter((slot) => {
          const [h, m] = slot.split(':').map(Number)
          return h > currentHour || (h === currentHour && m > now.getMinutes())
        })
      : group.slots
    if (visibleSlots.length === 0) return null
    return { ...group, slots: visibleSlots }
  }).filter(Boolean)
  const recommendedSlots = availableTimeGroups.flatMap((group) => group.slots).slice(0, 6)
  const displayedTimeGroups = activeTimeGroup === 'all'
    ? availableTimeGroups
    : availableTimeGroups.filter((group) => group.label === activeTimeGroup)

  return (
    <Layout title="预约上门护理" showBack onBack={() => navigate(-1)}>
      <div className="order-page px-4 py-3 pb-32 space-y-4">
        {/* Service Type */}
        <section ref={sectionRefs.service} className="order-section p-4 scroll-mt-16">
          <div>
            <h2 className="text-base font-semibold text-text">要做什么服务？</h2>
            <p className="mt-0.5 text-xs text-text-tertiary">选一个服务内容，价格会跟随更新</p>
          </div>
          <div className="mt-3 space-y-2">
            {serviceTypes.map((s) => {
              const Icon = serviceIcons[s.key]
              const isSelected = serviceType === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setServiceType(s.key)}
                  className={`w-full rounded-2xl p-3.5 flex items-center gap-3.5 active:opacity-80 transition-all cursor-pointer ${isSelected ? 'order-choice-selected' : 'order-option'}`}
                >
                  <div className="order-icon-soft w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold text-text">{s.label}</div>
                    <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">{s.desc}</div>
                  </div>
                  <div className="text-base font-bold shop-price">¥{s.price}</div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Date & Time */}
        <section ref={sectionRefs.time} className="order-section p-4 scroll-mt-16">
          <div>
            <h2 className="text-base font-semibold text-text">什么时候上门？</h2>
            <p className="mt-0.5 text-xs text-text-tertiary">选择方便上门的日期和时段</p>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {dateOptions.map((d) => {
              const isSelected = date === d.value
              return (
                <button
                  key={d.value}
                  onClick={() => {
                    setDate(d.value);
                    setShowAllTimes(false);
                    setActiveTimeGroup('all');
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
                  className={`shrink-0 w-[4.25rem] py-2.5 rounded-2xl flex flex-col items-center gap-1 active:opacity-85 transition-colors cursor-pointer ${
                    isSelected
                      ? 'order-choice-selected'
                      : 'order-option'
                  }`}
                >
                  <span className="text-[10px] font-medium leading-none text-text-tertiary">{d.weekday}</span>
                  <span className="text-base font-heading leading-tight text-text">
                    {d.showMonth ? `${d.month}/${d.day}` : d.day}
                  </span>
                </button>
              )
            })}
          </div>
          {errors.date && <div className="text-xs text-danger mt-1">{errors.date}</div>}

          <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
            <Clock size={12} />
            <span>可接单时段：08:00 - 21:00</span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-text-secondary">
                  {showAllTimes ? '选择具体时段' : '最快可约'}
                </div>
                <div className="mt-0.5 text-[11px] text-text-tertiary">
                  {showAllTimes ? '按上门时间段快速定位' : '以下时间当前可约，点选即可'}
                </div>
              </div>
              <button
                onClick={() => setShowAllTimes((value) => !value)}
                className="text-xs font-medium text-primary active:opacity-70 transition-opacity cursor-pointer"
              >
                {showAllTimes ? '收起' : '更多时段'}
              </button>
            </div>
            {!showAllTimes && (
              <div className="grid grid-cols-3 gap-2">
                {recommendedSlots.map((slot) => {
                  const isSelected = time === slot
                  return (
                    <button
                      key={slot}
                      onClick={() => { setTime(slot); setErrors((p) => ({ ...p, time: undefined })) }}
                      className={`py-2 rounded-lg text-sm font-medium active:opacity-85 transition-colors cursor-pointer ${isSelected ? 'order-choice-selected' : 'order-option'}`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {showAllTimes && (
            <div className="mt-4 space-y-3">
              <div className="shop-chip-wrap">
                <button
                  onClick={() => setActiveTimeGroup('all')}
                  className={`shop-chip px-3 py-1.5 rounded-full text-xs font-semibold active:opacity-70 transition-all cursor-pointer ${
                    activeTimeGroup === 'all' ? 'shop-chip-active' : 'shop-chip-idle text-text-secondary'
                  }`}
                >
                  全部
                </button>
                {availableTimeGroups.map((group) => (
                  <button
                    key={group.label}
                    onClick={() => setActiveTimeGroup(group.label)}
                    className={`shop-chip px-3 py-1.5 rounded-full text-xs font-semibold active:opacity-70 transition-all cursor-pointer ${
                      activeTimeGroup === group.label ? 'shop-chip-active' : 'shop-chip-idle text-text-secondary'
                    }`}
                  >
                    {group.label.split(' ')[0]}
                  </button>
                ))}
              </div>
              {displayedTimeGroups.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs text-text-tertiary font-medium">{group.label}</div>
                    <div className="text-[11px] text-text-tertiary">{group.slots.length} 个可约</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {group.slots.map((slot) => {
                      const isSelected = time === slot
                      return (
                        <button
                          key={slot}
                          onClick={() => { setTime(slot); setErrors((p) => ({ ...p, time: undefined })) }}
                          className={`py-2 rounded-lg text-sm font-medium active:opacity-85 transition-colors cursor-pointer ${
                            isSelected
                              ? 'order-choice-selected'
                              : 'order-option'
                          }`}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.time && <div className="text-xs text-danger mt-1">{errors.time}</div>}
        </section>

        {/* Pet Selection */}
        <section ref={sectionRefs.pet} className="order-section p-4 scroll-mt-16">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-text">照护对象</h2>
              <p className="mt-0.5 text-xs text-text-tertiary">默认使用当前宠物</p>
            </div>
            {pets.length > 1 && (
              <button
                onClick={() => setPetExpanded((value) => !value)}
                className="text-xs font-medium text-primary active:opacity-70 transition-opacity cursor-pointer"
              >
                {petExpanded ? '收起' : '更换'}
              </button>
            )}
          </div>
          {!petExpanded && (
            <div className="mt-3 order-inner-panel flex w-full items-center gap-3 p-3.5">
              <PetAvatar
                type={selectedPet?.type || 'cat'}
                photo={selectedPet?.photo || ''}
                name={selectedPet?.name || '宠物'}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text truncate">{selectedPet?.name || '未添加宠物'}</div>
                <div className="text-xs text-text-tertiary truncate">{selectedPet?.breed || '请先添加宠物信息'}</div>
              </div>
            </div>
          )}
          {petExpanded && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {pets.map((pet) => {
                const isSelected = petId === pet.id
                return (
                  <button
                    key={pet.id}
                    onClick={() => {
                      setPetId(pet.id)
                      setPetExpanded(false)
                      setErrors((p) => ({ ...p, pet: undefined }))
                    }}
                    className={`min-w-0 flex flex-col items-center gap-2 p-4 rounded-2xl active:opacity-80 transition-all cursor-pointer ${
                      isSelected ? 'order-option-selected' : 'order-option'
                    }`}
                  >
                    <PetAvatar type={pet.type} photo={pet.photo} name={pet.name} size="md" />
                    <div className="text-sm font-semibold text-text truncate max-w-full">{pet.name}</div>
                    <div className="text-[11px] text-text-tertiary truncate max-w-full">{pet.breed}</div>
                  </button>
                )
              })}
            </div>
          )}
          {errors.pet && <div className="text-xs text-danger mt-1">{errors.pet}</div>}
        </section>

        {/* Address */}
        <section ref={sectionRefs.address} className="order-section p-4 scroll-mt-16">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-text">上门到哪里？</h2>
              <p className="mt-0.5 text-xs text-text-tertiary">默认使用常用地址</p>
            </div>
            {addresses.length > 1 && (
              <button
                onClick={() => { setAddrExpanded((value) => !value); setShowNewAddrForm(false) }}
                className="text-xs font-medium text-primary active:opacity-70 transition-opacity cursor-pointer"
              >
                {addrExpanded ? '收起' : '更换'}
              </button>
            )}
          </div>
          <div className="mt-3">
            {/* Collapsed: show selected address */}
            {!addrExpanded && !showNewAddrForm && selectedAddrId && (() => {
              const addr = addresses.find((a) => a.id === selectedAddrId)
              return addr ? (
                <button
                  onClick={() => {
                    if (addresses.length > 1) setAddrExpanded(true)
                    setErrors((p) => ({ ...p, address: undefined }))
                  }}
                  className={`w-full order-inner-panel p-4 flex items-start gap-3 text-left ${addresses.length > 1 ? 'active:opacity-80 transition-opacity cursor-pointer' : ''}`}
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
                  {addresses.length > 1 && <ChevronDown size={16} className="text-text-tertiary mt-1 flex-shrink-0" />}
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

            {!addrExpanded && !showNewAddrForm && addresses.length <= 1 && (
              <button
                onClick={() => setShowNewAddrForm(true)}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary active:opacity-80 transition-opacity cursor-pointer"
              >
                <Plus size={14} />
                新增或修改地址
              </button>
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
        <section className="order-section p-4">
          <div>
            <h2 className="text-base font-semibold text-text">还有什么要嘱咐？</h2>
            <p className="mt-0.5 text-xs text-text-tertiary">可选，护理师上门前会优先查看</p>
          </div>
          <div className="shop-chip-wrap mt-3 pb-1">
            {NOTE_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setNotes((current) => current ? `${current}\n${suggestion}` : suggestion)}
                className="rounded-full shop-secondary-action px-3 py-1.5 text-xs font-medium active:opacity-80 transition-opacity cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
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
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-text-tertiary">合计</span>
                <span className="text-2xl font-heading shop-price tracking-tight">¥{selectedService?.price}</span>
              </div>
              <div className="mt-0.5 truncate text-xs font-medium text-text-secondary">
                {orderSummary}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="btn-primary h-11 rounded-full px-6 text-sm font-semibold active:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
            >
              {isReady ? '确认下单' : '补齐信息'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
