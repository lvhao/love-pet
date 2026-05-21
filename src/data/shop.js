export const mockProducts = [
  {
    id: 'prod_1',
    name: '皇家猫粮 室内成猫粮 2kg',
    brand: 'Royal Canin',
    price: 168,
    originalPrice: 198,
    category: 'cat_food',
    image: '',
    sales: 2341,
    rating: 4.8,
    tags: ['热销', '满减'],
    stock: 500,
    description: '专为室内猫设计，减少毛球形成，控制体重',
  },
  {
    id: 'prod_2',
    name: '渴望六种鱼全猫粮 1.8kg',
    brand: 'Orijen',
    price: 298,
    originalPrice: 358,
    category: 'cat_food',
    image: '',
    sales: 1856,
    rating: 4.9,
    tags: ['进口'],
    stock: 200,
    description: '新鲜鱼肉含量达80%，富含Omega-3',
  },
  {
    id: 'prod_3',
    name: '伯纳天纯狗粮 成犬通用 3kg',
    brand: '伯纳天纯',
    price: 128,
    originalPrice: 158,
    category: 'dog_food',
    image: '',
    sales: 3210,
    rating: 4.7,
    tags: ['热销'],
    stock: 800,
    description: '无谷配方，添加益生菌，呵护肠胃',
  },
  {
    id: 'prod_4',
    name: 'ZIPI 益生菌狗粮 2kg',
    brand: 'ZIPI',
    price: 238,
    originalPrice: 278,
    category: 'dog_food',
    image: '',
    sales: 987,
    rating: 4.8,
    tags: ['新品'],
    stock: 300,
    description: '冻干益生菌涂层技术，适口性极佳',
  },
  {
    id: 'prod_5',
    name: 'Catit 猫薄荷玩具球 3个装',
    brand: 'Catit',
    price: 39,
    originalPrice: 49,
    category: 'cat_toy',
    image: '',
    sales: 5620,
    rating: 4.6,
    tags: ['满减'],
    stock: 1000,
    description: '天然猫薄荷填充，激发猫咪活力',
  },
  {
    id: 'prod_6',
    name: 'KONG 经典玩具球 大号',
    brand: 'KONG',
    price: 79,
    originalPrice: 99,
    category: 'dog_toy',
    image: '',
    sales: 2890,
    rating: 4.9,
    tags: ['进口'],
    stock: 400,
    description: '天然橡胶材质，耐咬弹跳，可塞零食',
  },
]

export const productCategories = [
  { key: 'all', label: '全部' },
  { key: 'cat_food', label: '猫粮' },
  { key: 'dog_food', label: '狗粮' },
  { key: 'cat_toy', label: '猫玩具' },
  { key: 'dog_toy', label: '狗玩具' },
]

export const FREE_EXPRESS_THRESHOLD = 99
export const EXPRESS_DELIVERY_FEE = 8

export function getDeliveryFee(deliveryType, totalPrice) {
  if (deliveryType === 'door') return 0
  if (totalPrice >= FREE_EXPRESS_THRESHOLD) return 0
  return EXPRESS_DELIVERY_FEE
}

export function getDeliveryDesc(deliveryType, totalPrice = 0) {
  if (deliveryType === 'door') return '护理师下次上门时顺便带，免邮费'
  return totalPrice >= FREE_EXPRESS_THRESHOLD
    ? '快递邮寄，已满99元免邮'
    : `快递邮寄，满99元免邮，未满加${EXPRESS_DELIVERY_FEE}元运费`
}

export const deliveryTypes = [
  { key: 'door', label: '上门配送', desc: '护理师下次上门时顺便带，免邮费', icon: 'DoorOpen' },
  { key: 'express', label: '快递邮寄', desc: '满99元免邮，未满加8元运费', icon: 'Truck' },
]

export const mockOperator = {
  id: 'op_1',
  name: '运营小王',
  phone: '137****1234',
  role: 'operator',
}
