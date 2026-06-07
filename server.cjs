const http = require('http')
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')

const PORT = process.env.PORT || 3001
const DIST_DIR = path.join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function serveFile(res, filePath, mime) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not found')
    } else {
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000, immutable' })
      res.end(data)
    }
  })
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const ext = path.extname(url.pathname)

  if (ext && MIME[ext]) {
    // Static asset — serve with long cache
    serveFile(res, path.join(DIST_DIR, url.pathname), MIME[ext])
  } else {
    // SPA fallback — serve index.html
    fs.readFile(path.join(DIST_DIR, 'index.html'), (err, data) => {
      if (err) {
        // dist/ not built yet (dev mode) — health check
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('love-pet ok')
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(data)
      }
    })
  }
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
      const peers = rooms.get(roomId)
      const hasExistingPeers = peers.length > 0
      peers.push(ws)
      ws.roomId = roomId

      // Notify existing peers about the newcomer
      peers.forEach((peer) => {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
          peer.send(JSON.stringify({ type: 'peer-joined', roomId }))
        }
      })

      // Also notify the newcomer about existing peers (fixes timing deadlock)
      if (hasExistingPeers) {
        ws.send(JSON.stringify({ type: 'peer-joined', roomId }))
      }
    }

    if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate' || data.type === 'chat-message') {
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
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
