# 联系护理师 — 订单内聊天功能设计

## 背景

宠主端 OrderDetail 有"联系护理师"按钮，但 `handleContactCaretaker` 仅弹 toast，无实际交互。护理师端完全没有联系宠主的入口。需要实现订单关联的文字聊天功能。

## 方案

### 数据模型

localStorage key: `love-pet-chat-{orderId}`

```js
{
  orderId: "ORD-xxx",
  messages: [
    { id: "msg-{timestamp}", sender: "owner" | "caretaker", text: "...", timestamp: 1716000000000 }
  ]
}
```

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/data/chat.js` | chat 数据管理：loadChat, saveChat, addMessage, clearChat。纯函数，操作 localStorage |
| `src/pages/Chat.jsx` | 聊天页面组件。宠主/护理师共用，通过 useRole 区分 sender 身份 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/pages/owner/OrderDetail.jsx` | handleContactCaretaker 改为 navigate 到 `/owner/orders/:id/chat` |
| `src/pages/caretaker/OrderDetail.jsx` | accepted/in_progress/streaming 状态下添加"联系宠主"按钮，navigate 到 `/caretaker/orders/:id/chat` |
| `src/App.jsx` | 添加两条路由：`/owner/orders/:id/chat` 和 `/caretaker/orders/:id/chat` |

### 路由

```
/owner/orders/:id/chat     → Chat 页面（sender = owner）
/caretaker/orders/:id/chat → Chat 页面（sender = caretaker）
```

### Chat 页面 UI

- 顶部：Layout header，title = 对方名称（宠主看到"护理师：李姐"，护理师看到"宠主：小明"），showBack = true
- 中间：消息列表，自己发的靠右（bg-primary text-white），对方发的靠左（bg-surface text-text）
- 底部：固定输入栏，input + 发送按钮
- 空状态：居中提示"暂无消息，发送第一条消息吧"
- 自动滚动到最新消息（useEffect + ref.scrollIntoView）
- 时间戳显示：每条消息下方显示 HH:mm 格式

### chat.js API

```js
export function loadChat(orderId)        // 从 localStorage 读取，返回 messages 数组或 []
export function saveChat(orderId, chat)  // 写入 localStorage
export function addMessage(orderId, msg) // 添加一条消息，返回更新后的 messages
export function clearChat(orderId)       // 清除该订单的聊天记录
```

### 不做的事

- 图片/语音/快捷短语 — YAGNI，后续可扩展
- 未读计数/推送通知 — 需要后端支持
- WebSocket 实时同步 — 当前 localStorage 先行，架构预留接口（chat.js 纯函数可替换为 API 调用）