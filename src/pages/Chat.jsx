import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useRole } from '../hooks/useRole'
import { useStore } from '../data/store'
import { addMessage, loadChat } from '../data/chat'
import { Send, Camera, X } from 'lucide-react'

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useRole()
  const { orders, addToast } = useStore()
  const [messages, setMessages] = useState(() => loadChat(id))
  const [input, setInput] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const listRef = useRef(null)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  const order = orders.find((o) => o.id === id)
  const isOwner = role === 'owner'
  const peerName = isOwner
    ? (order?.caretakerName || '护理师')
    : (order?.ownerId ? '宠主' : '宠主')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text && !photoPreview) return
    const sender = isOwner ? 'owner' : 'caretaker'
    const updated = addMessage(id, {
      sender,
      text: text || (photoPreview ? '[图片]' : ''),
      image: photoPreview || undefined,
    })
    setMessages(updated)
    setInput('')
    setPhotoPreview(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removePhotoPreview = () => {
    setPhotoPreview(null)
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <Layout title={peerName} showBack onBack={() => navigate(-1)}>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 44px)' }}>
        {/* Message List */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-sm text-text-tertiary">暂无消息，发送第一条消息吧</div>
            </div>
          )}
          {messages.map((msg) => {
            const isSelf = msg.sender === (isOwner ? 'owner' : 'caretaker')
            return (
              <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                  isSelf
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-surface border border-border text-text rounded-bl-md'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="photo" className="rounded-lg max-h-48 mb-1.5" />
                  )}
                  {msg.text && msg.text !== '[图片]' && (
                    <div className="text-sm leading-relaxed">{msg.text}</div>
                  )}
                  {msg.text === '[图片]' && !msg.image && (
                    <div className="text-sm leading-relaxed opacity-70">[图片]</div>
                  )}
                  <div className={`text-[10px] mt-1 ${isSelf ? 'text-white/60' : 'text-text-tertiary'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Photo Preview */}
        {photoPreview && (
          <div className="px-4 py-2 bg-surface border-t border-border">
            <div className="relative inline-block">
              <img src={photoPreview} alt="preview" className="h-20 rounded-lg" />
              <button
                onClick={removePhotoPreview}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-text-tertiary rounded-full flex items-center justify-center cursor-pointer"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-surface border-t border-border px-4 py-3 flex items-center gap-2">
          <button
            onClick={handlePhotoClick}
            className="w-9 h-9 rounded-full bg-bg flex items-center justify-center active:opacity-80 transition-opacity cursor-pointer"
          >
            <Camera size={18} className="text-text-secondary" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 bg-bg rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() && !photoPreview}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center active:opacity-80 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </Layout>
  )
}