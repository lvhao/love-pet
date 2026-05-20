const CHAT_KEY_PREFIX = 'love-pet-chat-'

export function loadChat(orderId) {
  try {
    const raw = localStorage.getItem(`${CHAT_KEY_PREFIX}${orderId}`)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore corrupt data
  }
  return []
}

export function saveChat(orderId, messages) {
  try {
    localStorage.setItem(`${CHAT_KEY_PREFIX}${orderId}`, JSON.stringify(messages))
  } catch {
    // storage full or unavailable
  }
}

export function addMessage(orderId, { sender, text, image }) {
  const messages = loadChat(orderId)
  const msg = {
    id: `msg-${Date.now()}`,
    sender,
    text,
    timestamp: Date.now(),
  }
  if (image) msg.image = image
  const updated = [...messages, msg]
  saveChat(orderId, updated)
  return updated
}

export function clearChat(orderId) {
  localStorage.removeItem(`${CHAT_KEY_PREFIX}${orderId}`)
}