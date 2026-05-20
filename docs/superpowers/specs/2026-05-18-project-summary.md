# Love-Pet 项目开发总结

## 一、需求阶段

### 原始需求

宠主端 OrderDetail 页面有"联系护理师"按钮，但点击后仅弹 toast 提示"已发送消息给护理师"，无实际交互。护理师端完全没有联系宠主的入口。

### 需求澄清（2 个关键决策）

| 决策点 | 选项 | 选定 | 原因 |
|--------|------|------|------|
| 交互形式 | 纯文字 / 文字+图片+快捷短语 / 仅快捷消息 | 文字+图片+快捷短语 | 实际场景需要发宠物照片、确认上门时间，纯文字不够用 |
| 数据存储 | localStorage / WebSocket / 本地先行预留接口 | 本地先行，预留接口 | 项目是纯前端 demo 无后端，先跑通流程，架构上 chat.js 纯函数可替换为 API 调用 |

### 经验：需求阶段不要跳过澄清

"联系护理师没有交互"这句话可以解读为三种完全不同的方案：快捷拨号面板、完整 IM 系统、订单内轻聊。不澄清就动手，大概率做错方向。**一个选择题比一���描述更高效**——给用户 2-3 个选项带 trade-off，比问"你觉得怎么做"更快得到有效反馈。

---

## 二、开发阶段

### 新增文件

| 文件 | 职责 | 行数 |
|------|------|------|
| `src/data/chat.js` | localStorage 聊天数据管理 | 36 |
| `src/pages/Chat.jsx` | 共用聊天页面组件 | 163 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/pages/owner/OrderDetail.jsx` | handleContactCaretaker 从 toast 改为 navigate |
| `src/pages/caretaker/OrderDetail.jsx` | accepted/in_progress/streaming 状态添加"联系宠主"按钮 |
| `src/App.jsx` | 添加两条 chat 路由 + Chat 组件导入 |

### 踩坑与修复

**坑 1：输入框不固定底部**

`sticky bottom-0` 在 Layout 的 `<main class="flex-1 overflow-y-auto">` 内部不可靠——sticky 依赖滚动容器，但消息区和输入栏在同一层，sticky 失效。

修复：容器用 `height: calc(100vh - 44px)` 占满视口（减去 header 高度），消息区 `flex-1 overflow-y-auto`，输入栏自然沉底。

教训：**sticky/absolute 定位在嵌套滚动容器中行为不一致，用 flex 布局 + 固定高度更可靠。**

**坑 2：图片发送后聊天记录不显示**

`addMessage(orderId, { sender, text })` 参数签名只有 `sender` 和 `text`，Chat.jsx 传了 `image` 但函数没接收，图片数据被丢弃。消息只剩 `text: '[图片]'`，渲染时 `msg.image` 为 undefined，既不显示图片也不显示文字。

修复：`addMessage` 参数改为 `{ sender, text, image }`，image 存在时写入消息对象。

教训：**函数参数签名和调用方传的参数不一致，是最常见的"数据丢了但没报错"的 bug。接口变更时必须同步调用方和定义方。**

---

## 三、测试阶段

### 测试体系搭建

项目从零开始搭建测试基础设施：

| 配置项 | 内容 |
|--------|------|
| 测试框架 | vitest + @testing-library/react + jsdom |
| 配置文件 | vite.config.js 添加 `test` 块 |
| setup 文件 | src/test/setup.js（jest-dom + scrollIntoView mock） |
| 运行命令 | `npm test`（vitest run） |

### 测试覆盖

| 层级 | 测试文件数 | 测试数 | 覆盖要点 |
|------|-----------|--------|----------|
| utils | 2 | 26 | ApiError、fetch mock、CSRF、timeout、cdnUrl |
| data | 5 | 71 | mock 数据结构、store reducer 全量、chat CRUD |
| hooks | 3 | 21 | useCart CRUD + pricing、useRole 切换、useWebRTC 状态 |
| components | 8 | 45 | Logo/StatusBadge/Skeleton/PetAvatar/Layout/RoleSwitcher/Toast/TabBar |
| pages | 6 | 32 | Home/Shop/Pets/Orders/Profile/Chat |
| **合计** | **24** | **195** | |

### 测试踩坑

**坑 1：JSX 文件必须用 .jsx 后缀**

`store-integration.test.js` 包含 JSX 但后缀是 `.js`，vite 解析失败。改名 `.jsx` 即修复。

教训：**vitest/vite 遵循后缀约定，含 JSX 的测试文件必须用 .jsx。**

**坑 2：jsdom 不支持 scrollIntoView**

Chat 组件的 `useEffect` 调用 `bottomRef.current.scrollIntoView()`，jsdom 的 Element 没有此方法，测试全部崩溃。

修复：在 setup.js 中 `Element.prototype.scrollIntoView = () => {}`。

教训：**jsdom 缺少很多浏览器 API（scrollIntoView、getBoundingClientRect、matchMedia 等），在 setup.js 中统一 mock，不要逐个测试文件处理。**

**坑 3：重复文本导致 getByText 失败**

"宠管家"在 header 和 hero 区域各出现一次，`getByText` 报错 "Found multiple elements"。Orders 页面"待接单"同时出现在 tab 和 StatusBadge 中。

修复：用 `getAllByText` + 长度判断，或用 `getAllByText[0]` 点击特定元素。

教训：**getByText 在重复文本场景下不可靠，优先用 getByPlaceholderText、getByRole、getAllByText 等更精确的查询。**

**坑 4：useParams 在 MemoryRouter 中需要 Route 匹配**

Chat 测试用 `MemoryRouter initialEntries` 设置 URL，但 `useParams()` 只有在 `<Route path="/owner/orders/:id/chat">` 匹配时才能提取参数。直接 render `<Chat />` 不走 Route，`id` 为 undefined。

修复：wrapper 中包裹 `<Routes><Route ...>` 结构。

教训：**测试依赖路由参数的组件时，MemoryRouter 必须配合 Route，否则 useParams/useLocation 取不到值。**

---

## 四、可推广经验

### 1. 分层测试策略

按依赖深度从浅到深写测试：utils（纯函数）→ data（reducer）→ hooks（状态逻辑）→ components（渲染）→ pages（集成）。浅层测试稳定、跑得快，深层测试依赖多但覆盖真实场景。**先写浅层，保证核心逻辑正确，再补深层。**

### 2. 测试 wrapper 统一封装

每个需要 Provider 包裹的测试都重复写 MemoryRouter + StoreProvider + RoleProvider + CartProvider。应提取为公共 wrapper 工具函数，减少重复，且 Provider 层级变更时只改一处。

### 3. 接口变更必须双向同步

`addMessage` 参数从 `{ sender, text }` 扩展到 `{ sender, text, image }`，定义方改了但调用方（Chat.jsx）已经传了 image——这次是定义方漏了。反过来也一样：调用方改了传参，定义方必须同步接收。**最简单的办法：函数签名用对象解构，新增字段用默认值，不破坏旧调用。**

### 4. 需求澄清用选择题而非开放式提问

"联系护理师怎么做？"得到的回答通常模糊。"三种方案：A（轻量）、B（中等）、C（完整），推荐 B，因为 X"——用户 10 秒就能做出有效决策。**选择题自带 trade-off 信息，比开放式提问效率高 5-10 倍。**

### 5. localStorage 先行 + 纯函数接口预留后端切换

chat.js 全部是纯函数（loadChat/saveChat/addMessage/clearChat），操作 localStorage。未来切换到后端 API，只需把这些函数内部实现从 localStorage 改为 fetch 调用，调用方（Chat.jsx）零改动。**数据层用纯函数封装，存储介质可替换，是前端 demo 到生产最平滑的过渡路径。**