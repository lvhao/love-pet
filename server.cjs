const http = require('http')
const WebSocket = require('ws')

const PORT = process.env.PORT || 3001

// HTTP health-check endpoint (required by Fly.io proxy)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('love-pet ok')
})

const wss = new WebSocket.Server({ server })
const rooms = new Map()

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const data = JSON.parse(raw)

    if (data.type === 'join') {
      const roomId = data.roomId
      if (!rooms.has(roomId)) {
        rooms.set(roomId, [])
      }
      rooms.get(roomId).push(ws)
      ws.roomId = roomId

      // Notify others in room
      rooms.get(roomId).forEach((peer) => {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
          peer.send(JSON.stringify({ type: 'peer-joined', roomId }))
        }
      })
    }

    if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
      const roomId = data.roomId || ws.roomId
      const peers = rooms.get(roomId)
      if (peers) {
        peers.forEach((peer) => {
          if (peer !== ws && peer.readyState === WebSocket.OPEN) {
            peer.send(JSON.stringify(data))
          }
        })
      }
    }
  })

  ws.on('close', () => {
    if (ws.roomId && rooms.has(ws.roomId)) {
      const peers = rooms.get(ws.roomId).filter((p) => p !== ws)
      rooms.set(ws.roomId, peers)
      if (peers.length === 0) {
        rooms.delete(ws.roomId)
      }
    }
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on ws://0.0.0.0:${PORT}`)
})