import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import PetAvatar from '../../components/PetAvatar'
import { useStore } from '../../data/store'
import { Plus, ShieldCheck, Pencil, Trash2, X } from 'lucide-react'

const PET_TYPES = [
  { key: 'cat', label: '猫咪' },
  { key: 'dog', label: '狗狗' },
  { key: 'rabbit', label: '兔子' },
  { key: 'other', label: '其他' },
]

const emptyForm = { name: '', type: 'cat', breed: '', age: '', weight: '', notes: '', vaccine: false }

export default function OwnerPets() {
  const navigate = useNavigate()
  const { pets, addPet, updatePet, deletePet, addToast } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const openAddForm = () => {
    setEditingPet(null)
    setForm(emptyForm)
    setErrors({})
    setShowForm(true)
  }

  const openEditForm = (pet) => {
    setEditingPet(pet)
    setForm({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      notes: pet.notes || '',
      vaccine: pet.vaccine || false,
      photo: pet.photo || '',
    })
    setErrors({})
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingPet(null)
    setForm(emptyForm)
    setErrors({})
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '请输入宠物名字'
    if (!form.breed.trim()) errs.breed = '请输入品种'
    if (!form.age.trim()) errs.age = '请输入年龄'
    if (!form.weight.trim()) errs.weight = '请输入体重'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    if (editingPet) {
      updatePet({ id: editingPet.id, ...form })
      addToast('宠物信息已更新', 'success')
    } else {
      addPet({ ownerId: 'owner_1', photo: '', ...form })
      addToast('宠物添加成功', 'success')
    }
    closeForm()
  }

  const handleDelete = (petId) => {
    deletePet(petId)
    addToast('宠物已删除', 'info')
    setConfirmDeleteId(null)
  }

  return (
    <>
      <Layout title="我的宠物" showBack onBack={() => navigate('/owner/profile')}>
        <div className="px-4 py-4 space-y-3">
          {pets.map((pet) => (
            <div key={pet.id} className="shop-card p-4 flex items-center gap-3 overflow-hidden">
              <PetAvatar type={pet.type} photo={pet.photo} name={pet.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="font-heading font-semibold truncate">{pet.name}</div>
                  {pet.vaccine && (
                    <div className="shrink-0 inline-flex items-center gap-1 whitespace-nowrap text-[11px] leading-none text-primary font-medium bg-primary-50 px-2 py-1 rounded-lg">
                      <ShieldCheck size={12} className="shrink-0" />
                      <span>已免疫</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-text-secondary mt-0.5 truncate">{pet.breed} · {pet.age} · {pet.weight}</div>
                <div className="text-xs text-text-tertiary mt-1 truncate">{pet.notes}</div>
              </div>
              <div className="shrink-0 flex items-center gap-1">
                <button
                  onClick={() => openEditForm(pet)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-bg active:opacity-60 transition-opacity cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(pet.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-bg active:opacity-60 transition-opacity cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={openAddForm}
            className="w-full shop-soft-panel py-4 text-sm text-text-secondary flex items-center justify-center gap-2 active:opacity-60 transition-opacity cursor-pointer"
          >
            <Plus size={16} /> 添加宠物
          </button>
        </div>
      </Layout>

      {/* Add/Edit Pet Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40" onClick={closeForm}>
          <div
            className="w-full max-w-lg bg-surface rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-4 animate-slide-up max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-base">{editingPet ? '编辑宠物' : '添加宠物'}</h3>
              <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary active:opacity-60 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label htmlFor="pet-name" className="text-xs font-medium text-text-secondary">宠物名字</label>
                <input
                  id="pet-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }) }}
                  placeholder="如：团子"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-primary transition-colors"
                />
                {errors.name && <div className="text-xs text-danger mt-1">{errors.name}</div>}
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-medium text-text-secondary">宠物类型</label>
                <div className="flex gap-2 mt-1">
                  {PET_TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setForm({ ...form, type: t.key })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border active:opacity-80 transition-opacity cursor-pointer ${
                        form.type === t.key
                          ? 'bg-primary-50 border-primary/30 text-primary'
                          : 'border-border bg-surface text-text'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breed */}
              <div>
                <label htmlFor="pet-breed" className="text-xs font-medium text-text-secondary">品种</label>
                <input
                  id="pet-breed"
                  type="text"
                  value={form.breed}
                  onChange={(e) => { setForm({ ...form, breed: e.target.value }); setErrors({ ...errors, breed: undefined }) }}
                  placeholder="如：英短蓝猫"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-primary transition-colors"
                />
                {errors.breed && <div className="text-xs text-danger mt-1">{errors.breed}</div>}
              </div>

              {/* Age & Weight */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="pet-age" className="text-xs font-medium text-text-secondary">年龄</label>
                  <input
                    id="pet-age"
                    type="text"
                    value={form.age}
                    onChange={(e) => { setForm({ ...form, age: e.target.value }); setErrors({ ...errors, age: undefined }) }}
                    placeholder="如：3岁"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.age && <div className="text-xs text-danger mt-1">{errors.age}</div>}
                </div>
                <div className="flex-1">
                  <label htmlFor="pet-weight" className="text-xs font-medium text-text-secondary">体重</label>
                  <input
                    id="pet-weight"
                    type="text"
                    value={form.weight}
                    onChange={(e) => { setForm({ ...form, weight: e.target.value }); setErrors({ ...errors, weight: undefined }) }}
                    placeholder="如：4.5kg"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-primary transition-colors"
                  />
                  {errors.weight && <div className="text-xs text-danger mt-1">{errors.weight}</div>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-text-secondary">备注</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="有什么需要嘱咐护理师的..."
                  rows={2}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm mt-1 focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Vaccine */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, vaccine: !form.vaccine })}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                    form.vaccine ? 'bg-primary border-primary' : 'border-border bg-surface'
                  }`}
                >
                  {form.vaccine && <span className="text-white text-xs">✓</span>}
                </button>
                <span className="text-sm text-text-secondary">已免疫</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full btn-primary font-semibold py-3 rounded-lg text-sm active:opacity-80 transition-opacity cursor-pointer"
              >
                {editingPet ? '保存修改' : '添加宠物'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmDeleteId(null)}>
          <div
            className="shop-card w-72 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading font-semibold text-base text-center">确认删除</h3>
            <p className="text-sm text-text-secondary text-center">删除后将无法恢复，确定要删除这只宠物吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium shop-secondary-action active:opacity-80 transition-opacity cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-danger text-white active:opacity-80 transition-opacity cursor-pointer"
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
