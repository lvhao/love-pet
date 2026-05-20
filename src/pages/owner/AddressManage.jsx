import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useStore } from '../../data/store'
import { MapPin, Phone, User, Trash2, Edit3, Plus, X } from 'lucide-react'

const PHONE_REGEX = /^1[3-9]\d{9}$/

export default function AddressManage() {
  const navigate = useNavigate()
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, addToast } = useStore()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [phoneError, setPhoneError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const startEdit = (addr) => {
    setEditingId(addr.id)
    setForm({ name: addr.name, phone: addr.phone, address: addr.address })
    setPhoneError('')
    setShowForm(true)
  }

  const startAdd = () => {
    setEditingId(null)
    setForm({ name: '', phone: '', address: '' })
    setPhoneError('')
    setShowForm(true)
  }

  const saveAddress = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      addToast('请填写完整信息', 'error')
      return
    }

    if (!PHONE_REGEX.test(form.phone)) {
      setPhoneError('请输入正确的手机号码')
      return
    }

    if (editingId) {
      updateAddress({ id: editingId, name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() })
      addToast('地址已更新', 'success')
    } else {
      addAddress({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        isDefault: addresses.length === 0,
      })
      addToast('地址已添加', 'success')
    }

    setShowForm(false)
    setForm({ name: '', phone: '', address: '' })
    setEditingId(null)
    setPhoneError('')
  }

  const handleDelete = (id) => {
    deleteAddress(id)
    setDeleteConfirm(null)
    addToast('地址已删除', 'success')
  }

  const handleSetDefault = (id) => {
    setDefaultAddress(id)
    addToast('已设为默认地址', 'success')
  }

  return (
    <Layout title="地址管理" showBack onBack={() => navigate(-1)}>
      <div className="px-4 py-4 space-y-3">
        {addresses.map((addr) => (
          <div key={addr.id} className={`bg-surface rounded-xl border p-4 ${addr.isDefault ? 'border-primary' : 'border-border'}`}>
            <div className="flex items-start gap-3">
              <MapPin size={18} className={addr.isDefault ? 'text-primary mt-0.5' : 'text-text-tertiary mt-0.5'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{addr.name}</span>
                  <span className="text-xs text-text-secondary">{addr.phone}</span>
                  {addr.isDefault && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">默认</span>}
                </div>
                <div className="text-xs text-text-secondary mt-1">{addr.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs text-primary font-medium active:opacity-80 cursor-pointer"
                >
                  设为默认
                </button>
              )}
              <button
                onClick={() => startEdit(addr)}
                className="flex items-center gap-1 text-xs text-primary active:opacity-80 cursor-pointer"
              >
                <Edit3 size={12} />
                编辑
              </button>
              <button
                onClick={() => setDeleteConfirm(addr.id)}
                className="flex items-center gap-1 text-xs text-danger active:opacity-80 cursor-pointer"
              >
                <Trash2 size={12} />
                删除
              </button>
            </div>
          </div>
        ))}

        {/* Add new address */}
        {!showForm && (
          <button
            onClick={startAdd}
            className="w-full bg-surface rounded-xl border border-border p-4 flex items-center justify-center gap-2 text-sm text-primary font-medium active:opacity-80 cursor-pointer"
          >
            <Plus size={16} />
            新增地址
          </button>
        )}

        {/* Address form */}
        {showForm && (
          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{editingId ? '编辑地址' : '新增地址'}</div>
              <button onClick={() => { setShowForm(false); setForm({ name: '', phone: '', address: '' }); setEditingId(null); setPhoneError('') }} className="w-8 h-8 flex items-center justify-center cursor-pointer">
                <X size={16} className="text-text-tertiary" />
              </button>
            </div>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="联系人姓名"
                className="w-full border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => { setForm((p) => ({ ...p, phone: e.target.value })); setPhoneError('') }}
                  placeholder="联系电话"
                  className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none transition-colors ${phoneError ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                />
              </div>
              {phoneError && <div className="text-xs text-danger mt-1 ml-1">{phoneError}</div>}
            </div>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-text-tertiary" />
              <textarea
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="详细地址：小区/大厦/门牌号..."
                rows={2}
                className="w-full border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowForm(false); setForm({ name: '', phone: '', address: '' }); setEditingId(null); setPhoneError('') }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-border text-text-secondary active:opacity-80 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={saveAddress}
                className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium active:opacity-80 cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-surface rounded-2xl p-5 w-72 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-base font-semibold text-center">确认删除</div>
            <div className="text-sm text-text-secondary text-center">删除后不可恢复，确认要删除该地址吗？</div>
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
    </Layout>
  )
}
