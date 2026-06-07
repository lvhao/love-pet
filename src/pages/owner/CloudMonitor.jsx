import { useRef, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWebRTC } from '../../hooks/useWebRTC'
import { useStore } from '../../data/store'
import { X, Send, Video, Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function CloudMonitor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { remoteStream, isConnected, wsStatus, cameraError, chatMessages, sendChatMessage, joinStream, stop } = useWebRTC(id)
  const { addToast } = useStore()
  const videoRef = useRef(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    joinStream()
    return () => stop()
  }, [joinStream, stop])

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  useEffect(() => {
    if (cameraError === 'permission_denied') {
      addToast('摄像头权限被拒绝，无法观看直播', 'error')
    }
  }, [addToast, cameraError])

  const handleReconnect = () => {
    addToast('正在重新连接...', 'info')
    stop()
    setTimeout(() => joinStream(), 1000)
  }

  const sendMessage = () => {
    if (!input.trim()) return
    sendChatMessage(input, 'owner')
    setInput('')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F1A]">
      {/* Video Area */}
      <div className="relative flex-1 bg-[#1A1A2E] flex items-center justify-center min-h-[320px]">
        {remoteStream ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-white/50">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Video size={32} className="text-white/30" />
            </div>
            <div className="text-sm font-medium text-white/60">
              {cameraError === 'permission_denied'
                ? '摄像头权限被拒绝'
                : isConnected ? '连接中...' : '等待护理师开启直播'}
            </div>
          </div>
        )}

        {/* Live indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-live/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full live-pulse" />
            LIVE
          </div>
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm ${
            wsStatus === 'connected'
              ? 'bg-green-500/20 text-green-400'
              : wsStatus === 'connecting'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {wsStatus === 'connected' && <Wifi size={12} />}
            {wsStatus === 'connecting' && <RefreshCw size={12} className="animate-spin" />}
            {wsStatus === 'disconnected' && <WifiOff size={12} />}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => { stop(); navigate(-1) }}
          className="absolute top-4 right-4 bg-black/40 text-white/80 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm active:opacity-60 transition-opacity cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Reconnect button */}
        {wsStatus === 'error' && (
          <button
            onClick={handleReconnect}
            className="absolute bottom-4 bg-amber-500/80 text-white px-5 py-2.5 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 active:opacity-60 transition-opacity cursor-pointer"
          >
            <RefreshCw size={12} />
            重新连接
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="live-chat-panel rounded-t-2xl flex flex-col" style={{ height: '42vh' }}>
        <div className="px-4 py-3.5 border-b border-border">
          <h3 className="text-sm font-semibold text-text">实时互动</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {chatMessages.length === 0 && (
            <div className="text-center text-text-tertiary text-xs py-6">暂无消息</div>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'owner' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-lg text-sm ${
                msg.from === 'owner'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-[#fff1e8] text-primary rounded-bl-md'
              }`}>
                {msg.from === 'caretaker' && <div className="text-[11px] text-primary/60 mb-1 font-medium">护理师</div>}
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3.5 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="给护理师发消息..."
            className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 btn-primary rounded-full flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer"
          >
            <Send size={16} className="text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
