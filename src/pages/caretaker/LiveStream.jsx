import { useRef, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWebRTC } from '../../hooks/useWebRTC'
import { useStore } from '../../data/store'
import { Send, Video, RotateCcw, Users, PawPrint, Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function LiveStream() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { localStream, isConnected, isStreaming, wsStatus, cameraError, chatMessages, sendChatMessage, startBroadcast, flipCamera, stop } = useWebRTC(id)
  const { addToast } = useStore()
  const videoRef = useRef(null)
  const [duration, setDuration] = useState(0)
  const [input, setInput] = useState('')
  const [streamStarted, setStreamStarted] = useState(false)

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (cameraError === 'permission_denied') {
      addToast('摄像头权限被拒绝，无法开启直播', 'error')
    }
  }, [cameraError, addToast])

  useEffect(() => {
    if (!isStreaming) return
    const timer = setInterval(() => setDuration((d) => d + 1), 1000)
    return () => clearInterval(timer)
  }, [isStreaming])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleStartStream = async () => {
    await startBroadcast()
    setStreamStarted(true)
    addToast('直播已开始', 'success')
  }

  const handleFlipCamera = async () => {
    await flipCamera()
    addToast('摄像头已翻转', 'info')
  }

  const handleReconnect = () => {
    addToast('正在重新连接...', 'info')
    stop()
    setTimeout(() => startBroadcast(), 1000)
  }

  const endStream = () => {
    stop()
    navigate(`/caretaker/report/${id}`)
  }

  const handleSend = () => {
    if (!input.trim()) return
    sendChatMessage(input, 'caretaker')
    setInput('')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F1A]">
      <div className="relative flex-1 bg-[#1A1A2E] flex items-center justify-center min-h-[320px]">
        {localStream ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-white/50">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Video size={32} className="text-white/30" />
            </div>
            <div className="text-sm font-medium text-white/60">正在启动摄像头...</div>
            <div className="text-xs mt-2 text-white/30">请允许浏览器访问摄像头和麦克风</div>
          </div>
        )}

        <div className="absolute top-4 left-4 flex items-center gap-2">
          {isStreaming && (
            <>
              <div className="flex items-center gap-1.5 bg-live/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full live-pulse" />
                LIVE
              </div>
              <div className="bg-black/40 text-white/80 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-sm">
                {formatTime(duration)}
              </div>
            </>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm ${
            wsStatus === 'connected'
              ? 'bg-green-500/20 text-green-400'
              : wsStatus === 'connecting'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {wsStatus === 'connected' && <Wifi size={12} />}
            {wsStatus === 'connecting' && <RefreshCw size={12} className="animate-spin" />}
            {(wsStatus === 'disconnected' || wsStatus === 'error') && <WifiOff size={12} />}
            {wsStatus === 'connected' ? '已连接' : wsStatus === 'connecting' ? '连接中' : '已断开'}
          </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {isStreaming && (
            <>
              <button
                onClick={handleFlipCamera}
                className="bg-black/40 text-white/80 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm active:opacity-60 transition-opacity cursor-pointer"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={endStream}
                className="bg-live text-white w-9 h-9 rounded-full flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer"
              >
                <div className="w-3 h-3 bg-white rounded-sm" />
              </button>
            </>
          )}
        </div>

        {isStreaming && (
          <div className="absolute bottom-4 left-4 bg-black/40 text-white/80 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm flex items-center gap-1.5">
            <Users size={12} /> {isConnected ? '1人正在观看' : '等待观众进入'}
          </div>
        )}

        {(wsStatus === 'disconnected' || wsStatus === 'error') && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleReconnect}
              className="bg-amber-500/80 text-white px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 active:opacity-80 transition-opacity cursor-pointer"
            >
              <RefreshCw size={12} />
              重连
            </button>
          </div>
        )}
      </div>

      {!streamStarted && (
        <div className="live-chat-panel p-5">
          <button
            onClick={handleStartStream}
            className="w-full btn-primary font-semibold py-4 rounded-lg text-base flex items-center justify-center gap-2 active:opacity-80 transition-opacity cursor-pointer"
          >
            <Video size={18} />
            开始直播
          </button>
        </div>
      )}

      {streamStarted && (
        <div className="live-chat-panel rounded-t-2xl flex flex-col" style={{ height: '38vh' }}>
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">宠主互动</h3>
            <button
              onClick={endStream}
              className="bg-live text-white px-4 py-1.5 rounded-full text-xs font-semibold active:opacity-80 transition-opacity cursor-pointer"
            >
              结束直播
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-text-tertiary text-xs py-6 flex flex-col items-center gap-2">
                <PawPrint size={24} className="text-text-tertiary" />
                还没有消息，宠主可能在默默看着呢
              </div>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'caretaker' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-lg text-sm ${
                  msg.from === 'caretaker'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-[#fff1e8] text-primary rounded-bl-md'
                }`}>
                  {msg.from === 'owner' && <div className="text-[10px] text-primary/60 mb-1 font-medium">宠主</div>}
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3.5 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) handleSend() }}
              placeholder="回复宠主..."
              className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 btn-primary rounded-full flex items-center justify-center active:opacity-60 transition-opacity cursor-pointer"
            >
              <Send size={16} className="text-white ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
