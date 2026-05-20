# 宠上门 (PetAtDoor) — 去中心化上门宠物服务+云监工 产品设计

## 机会选择

TOP3 排名：
1. **去中心化上门服务+云监工**（选择实现）— 刚需高频、技术差异化、轻资产
2. 行为管理与心理丰容 — 痛点明确但客单价低
3. 预防医学与中医理疗 — 客单价高但信任门槛高

## 产品定位

面向高线城市白领的上门宠物喂养+云监工平台。核心差异化：服务过程中实时视频直播（云监工），让宠主远程查看宠物状况。

## 双端角色

| 端 | 角色 | 核心流程 |
|---|---|---|
| 宠主端 | 下单方 | 浏览服务→下单→云监工→查看报告 |
| 护理师端 | 服务方 | 接单→执行SOP→推流直播→提交报告 |

## 技术方案

- **前端**：React + Tailwind CSS v4，移动端 H5 优先（max-width: 430px）
- **视频流**：WebRTC P2P，极简 WebSocket 信令服务器
- **后端**：Node.js 信令服务器（~50行），前端 mock 数据

## 页面结构

**宠主端（8页）：** 首页、下单页、订单列表、订单详情、云监工、服务报告、宠物列表、个人中心
**护理师端（7页）：** 工作台、接单详情、服务执行、直播推流、提交报告、服务记录、个人中心

## 数据模型

- User: id, name, phone, avatar, role(owner|caretaker), rating, specialties
- Pet: id, ownerId, name, type, breed, age, photo, notes
- Order: id, ownerId, caretakerId, petId, serviceType, status, scheduledAt, address, price, reportId
- Report: id, orderId, behaviorNotes, environmentCheck, photos[], feedingCompleted, waterCompleted

## 订单状态机

pending → accepted → in_progress → streaming → completed

## WebRTC 信令

WebSocket 信令交换 SDP/ICE，P2P 直连传输视频流。信令服务器仅做房间管理和消息转发。
