export const mockUsers = {
  owner: {
    id: 'owner_1',
    name: '小明',
    phone: '138****8888',
    avatar: '',
    role: 'owner',
  },
  caretaker: {
    id: 'ct_1',
    name: '李姐',
    phone: '139****6666',
    avatar: '',
    role: 'caretaker',
    rating: 4.9,
    completedOrders: 326,
    specialties: ['猫', '狗', '小型异宠'],
    bio: '5年宠物护理经验，擅长老年犬猫照护',
    currentLocation: {
      label: '西湖区文三路',
      lat: 30.2809,
      lng: 120.1301,
    },
  },
}

export const mockPets = [
  {
    id: 'pet_1',
    ownerId: 'owner_1',
    name: '团子',
    type: 'cat',
    breed: '英短蓝猫',
    age: '3岁',
    weight: '4.5kg',
    photo: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=240&q=80',
    notes: '挑食，只吃皇家猫粮；胆小，不要强行抱',
    vaccine: true,
  },
  {
    id: 'pet_2',
    ownerId: 'owner_1',
    name: '旺财',
    type: 'dog',
    breed: '柯基',
    age: '2岁',
    weight: '12kg',
    photo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=240&q=80',
    notes: '需要遛20分钟以上；会拆家，注意关好卧室门',
    vaccine: true,
  },
]

export const mockAddresses = [
  { id: 'addr_1', name: '小明', phone: '138****8888', label: '家', address: '杭州市西湖区文三路xx小区3栋502', isDefault: true },
  { id: 'addr_2', name: '小明', phone: '138****8888', label: '公司', address: '杭州市滨江区网商路yy大厦A座1201', isDefault: false },
]

export const mockOrders = [
  {
    id: 'order_1',
    ownerId: 'owner_1',
    caretakerId: 'ct_1',
    petId: 'pet_1',
    serviceType: 'feeding',
    status: 'streaming',
    scheduledAt: '2026-05-17 18:00',
    address: '杭州市西湖区文三路xx小区3栋502',
    location: { lat: 30.2798, lng: 120.1316, area: '西湖区文三路' },
    price: 89,
    petName: '团子',
    caretakerName: '李姐',
    reportId: null,
  },
  {
    id: 'order_2',
    ownerId: 'owner_1',
    caretakerId: null,
    petId: 'pet_2',
    serviceType: 'feeding_walk',
    status: 'pending',
    scheduledAt: '2026-05-18 09:00',
    address: '杭州市西湖区古翠路88号2栋1102',
    location: { lat: 30.2865, lng: 120.1262, area: '西湖区古翠路' },
    price: 129,
    petName: '旺财',
    caretakerName: null,
    reportId: null,
  },
  {
    id: 'order_3',
    ownerId: 'owner_1',
    caretakerId: 'ct_1',
    petId: 'pet_1',
    serviceType: 'feeding',
    status: 'completed',
    scheduledAt: '2026-05-16 18:00',
    address: '杭州市西湖区文三路xx小区3栋502',
    location: { lat: 30.2798, lng: 120.1316, area: '西湖区文三路' },
    price: 89,
    petName: '团子',
    caretakerName: '李姐',
    reportId: 'report_1',
  },
  {
    id: 'order_4',
    ownerId: 'owner_1',
    caretakerId: null,
    petId: 'pet_2',
    serviceType: 'feeding_walk',
    status: 'pending',
    scheduledAt: '2026-05-19 10:00',
    address: '杭州市滨江区网商路699号A座1201',
    location: { lat: 30.1889, lng: 120.1906, area: '滨江区网商路' },
    price: 129,
    petName: '旺财',
    caretakerName: null,
    reportId: null,
  },
  {
    id: 'order_5',
    ownerId: 'owner_1',
    caretakerId: 'ct_1',
    petId: 'pet_1',
    serviceType: 'feeding_grooming',
    status: 'completed',
    scheduledAt: '2026-05-20 14:00',
    address: '杭州市西湖区文三路xx小区3栋502',
    location: { lat: 30.2798, lng: 120.1316, area: '西湖区文三路' },
    price: 169,
    petName: '团子',
    caretakerName: '李姐',
    reportId: null,
  },
]

export const mockCaretakerApplications = [
  { id: 'app_1', name: '王阿姨', experience: '3年猫狗上门喂养经验', area: '西湖区', status: '待审核' },
  { id: 'app_2', name: '陈师傅', experience: '宠物店洗护师，擅长小型犬', area: '滨江区', status: '待补资料' },
]

export const mockComplaints = [
  { id: 'cmp_1', owner: '小明', target: 'order_5', reason: '服务报告照片不完整', status: '待处理' },
  { id: 'cmp_2', owner: '林女士', target: '商品配送', reason: '上门配送时间未同步', status: '处理中' },
]

export const mockReport = {
  id: 'report_1',
  orderId: 'order_3',
  behaviorNotes: '团子今天精神状态良好，主动进食，吃完后在窗台晒太阳约15分钟。对陌生人（护理师）保持警惕但未出现应激反应，互动时逐渐放松。',
  environmentCheck: {
    windows: true,
    doors: true,
    water: true,
    food: true,
    litter: true,
    hazards: false,
  },
  photos: [],
  feedingCompleted: true,
  waterCompleted: true,
  createdAt: '2026-05-16 18:35',
}

export const serviceTypes = [
  { key: 'feeding', label: '上门喂养', price: 89, desc: '喂食+换水+清理猫砂', Icon: 'UtensilsCrossed' },
  { key: 'feeding_walk', label: '喂养+遛狗', price: 129, desc: '喂食+换水+遛狗20分钟', Icon: 'Dog' },
  { key: 'feeding_grooming', label: '喂养+洗护', price: 169, desc: '喂食+换水+基础洗护', Icon: 'ShowerHead' },
]

export const sopSteps = [
  { id: 1, title: '到达确认', desc: '拍摄门牌号确认到达', Icon: 'MapPin' },
  { id: 2, title: '环境安全检查', desc: '检查门窗、危险物品', Icon: 'ShieldCheck' },
  { id: 3, title: '更换饮水', desc: '倒掉旧水，换上新鲜饮用水', Icon: 'GlassWater' },
  { id: 4, title: '喂食', desc: '按宠主要求添加食物', Icon: 'UtensilsCrossed' },
  { id: 5, title: '清理猫砂/狗厕所', desc: '铲屎并清理周围区域', Icon: 'Sparkles' },
  { id: 6, title: '互动陪伴', desc: '与宠物互动5-10分钟', Icon: 'Heart' },
  { id: 7, title: '行为观察', desc: '观察并记录宠物状态', Icon: 'Eye' },
  { id: 8, title: '离开确认', desc: '确认门窗关闭后离开', Icon: 'DoorOpen' },
]

export const statusLabels = {
  pending: '待接单',
  accepted: '已接单',
  in_progress: '服务中',
  streaming: '直播中',
  completed: '已完成',
  cancelled: '已取消',
}

export const statusColors = {
  pending: '#F5A623',
  accepted: '#00B578',
  in_progress: '#42A5F5',
  streaming: '#FA5151',
  completed: '#00B578',
  cancelled: '#999999',
}
