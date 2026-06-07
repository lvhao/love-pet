import { useState, useRef, useCallback, useEffect } from 'react'

// EN-01: Configurable signaling URL via env variable
const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:3001'

// EN-04: TURN server config via env
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  ...(import.meta.env.VITE_TURN_URL ? [{
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME || '',
    credential: import.meta.env.VITE_TURN_CREDENTIAL || '',
  }] : []),
]

// EN-12: HTTPS check for WebRTC
function checkHTTPS() {
  if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    console.warn('WebRTC requires HTTPS in production. Current protocol is http.')
  }
}

export function useWebRTC(roomId) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [wsStatus, setWsStatus] = useState('disconnected') // 'disconnected' | 'connecting' | 'connected' | 'error'
  const [cameraError, setCameraError] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const pcRef = useRef(null)
  const wsRef = useRef(null)
  const facingModeRef = useRef('environment')

  const createPeerConnection = useCallback(() => {
    checkHTTPS()
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          roomId,
          candidate: e.candidate,
        }))
      }
    }

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0])
    }

    // EN-05: ICE connection failure detection
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      setIsConnected(state === 'connected')
      if (state === 'failed' || state === 'disconnected') {
        console.warn(`ICE connection state: ${state}`)
      }
    }

    return pc
  }, [roomId])

  const startCamera = useCallback(async (facingMode = facingModeRef.current) => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 640, height: 480 },
        audio: true,
      })
      facingModeRef.current = facingMode
      setLocalStream(stream)
      return stream
    } catch (err) {
      console.error('Camera access denied:', err)
      setCameraError(err.name === 'NotAllowedError' ? 'permission_denied' : 'not_available')
      return null
    }
  }, [])

  // EN-02: WebSocket error handling
  const setupWebSocket = useCallback((pc, onMessage) => {
    setWsStatus('connecting')
    const ws = new WebSocket(SIGNALING_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
      ws.send(JSON.stringify({ type: 'join', roomId }))
    }

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data)
      await onMessage(data)
    }

    ws.onerror = () => {
      setWsStatus('error')
      console.error('WebSocket connection failed')
    }

    ws.onclose = () => {
      setWsStatus('disconnected')
    }

    return ws
  }, [roomId])

  const startBroadcast = useCallback(async () => {
    const stream = await startCamera()
    if (!stream) return

    const pc = createPeerConnection()
    pcRef.current = pc

    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    setupWebSocket(pc, async (data) => {
      if (data.type === 'peer-joined') {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        wsRef.current?.send(JSON.stringify({ type: 'offer', roomId, sdp: offer }))
      }
      if (data.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      }
      if (data.type === 'ice-candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
      if (data.type === 'chat-message') {
        setChatMessages((prev) => [...prev, { id: `chat-${Date.now()}-${Math.random()}`, from: data.from, text: data.text }])
      }
    })

    setIsStreaming(true)
  }, [roomId, createPeerConnection, startCamera, setupWebSocket])

  const joinStream = useCallback(() => {
    const pc = createPeerConnection()
    pcRef.current = pc

    setupWebSocket(pc, async (data) => {
      if (data.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        wsRef.current?.send(JSON.stringify({ type: 'answer', roomId, sdp: answer }))
      }
      if (data.type === 'ice-candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
      if (data.type === 'chat-message') {
        setChatMessages((prev) => [...prev, { id: `chat-${Date.now()}-${Math.random()}`, from: data.from, text: data.text }])
      }
    })
  }, [roomId, createPeerConnection, setupWebSocket])

  const sendChatMessage = useCallback((text, from) => {
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    const msg = { type: 'chat-message', roomId, from, text }
    wsRef.current.send(JSON.stringify(msg))
    setChatMessages((prev) => [...prev, { id: `chat-${Date.now()}-${Math.random()}`, from, text }])
  }, [roomId])

  const flipCamera = useCallback(async () => {
    const newFacing = facingModeRef.current === 'environment' ? 'user' : 'environment'
    const stream = await startCamera(newFacing)
    if (!stream || !pcRef.current) return

    // Replace video track in the peer connection
    const videoTrack = stream.getVideoTracks()[0]
    const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video')
    if (sender && videoTrack) {
      await sender.replaceTrack(videoTrack)
    }

    // Stop old stream tracks (except the new ones)
    localStream?.getTracks().forEach(t => {
      if (t !== videoTrack && t.kind !== 'audio') t.stop()
    })
  }, [startCamera, localStream])

  const stop = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    wsRef.current?.close()
    setLocalStream(null)
    setRemoteStream(null)
    setIsStreaming(false)
    setIsConnected(false)
    setWsStatus('disconnected')
    setCameraError(null)
    setChatMessages([])
  }, [localStream])

  useEffect(() => () => {
    localStream?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    wsRef.current?.close()
  }, [localStream])

  return {
    localStream,
    remoteStream,
    isConnected,
    isStreaming,
    wsStatus,
    cameraError,
    chatMessages,
    sendChatMessage,
    startBroadcast,
    joinStream,
    flipCamera,
    stop,
  }
}
