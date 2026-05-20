import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { mockPets, mockOrders, mockAddresses, mockReport } from './mock'
import { mockProducts } from './shop'

// ---------------------------------------------------------------------------
// Deep clone helper – ensures we never mutate the original mock arrays
// ---------------------------------------------------------------------------
function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

// ---------------------------------------------------------------------------
// ID generators
// ---------------------------------------------------------------------------
function generateOrderId() {
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `ORD-${Date.now()}-${rand}`
}

function generateReportId() {
  return `RPT-${Date.now()}`
}

function generatePetId() {
  return `pet-${Date.now()}`
}

function generateAddressId() {
  return `addr-${Date.now()}`
}

// ---------------------------------------------------------------------------
// Order status machine – defines valid transitions
// ---------------------------------------------------------------------------
const VALID_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['streaming', 'completed', 'cancelled'],
  streaming: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

function isValidTransition(current, next) {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false
}

// ---------------------------------------------------------------------------
// Initial state – deep cloned from mock data
// ---------------------------------------------------------------------------
const CART_STORAGE_KEY = 'love-pet-cart'

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore corrupt data
  }
  return { items: [], deliveryType: 'door' }
}

function getInitialState() {
  const cart = loadCartFromStorage()
  return {
    orders: clone(mockOrders),
    pets: clone(mockPets),
    addresses: clone(mockAddresses),
    reports: mockReport ? clone([mockReport]) : [],
    products: clone(mockProducts),
    cart,
    toasts: [],
  }
}

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
const ACTION = {
  // Orders
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  CANCEL_ORDER: 'CANCEL_ORDER',

  // Pets
  ADD_PET: 'ADD_PET',
  UPDATE_PET: 'UPDATE_PET',
  DELETE_PET: 'DELETE_PET',

  // Addresses
  ADD_ADDRESS: 'ADD_ADDRESS',
  UPDATE_ADDRESS: 'UPDATE_ADDRESS',
  DELETE_ADDRESS: 'DELETE_ADDRESS',
  SET_DEFAULT_ADDRESS: 'SET_DEFAULT_ADDRESS',

  // Reports
  SUBMIT_REPORT: 'SUBMIT_REPORT',
  UPDATE_REPORT_RATING: 'UPDATE_REPORT_RATING',

  // Products
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',

  // Cart
  CART_ADD_ITEM: 'CART_ADD_ITEM',
  CART_REMOVE_ITEM: 'CART_REMOVE_ITEM',
  CART_UPDATE_QUANTITY: 'CART_UPDATE_QUANTITY',
  CART_SET_DELIVERY_TYPE: 'CART_SET_DELIVERY_TYPE',
  CART_CLEAR: 'CART_CLEAR',

  // Toasts
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function reducer(state, action) {
  switch (action.type) {
    // ---- Orders ----------------------------------------------------------
    case ACTION.ADD_ORDER:
      return { ...state, orders: [...state.orders, action.payload] }

    case ACTION.UPDATE_ORDER_STATUS: {
      const { orderId, status } = action.payload
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        ),
      }
    }

    case ACTION.CANCEL_ORDER: {
      const { orderId } = action.payload
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId && isValidTransition(o.status, 'cancelled')
            ? { ...o, status: 'cancelled' }
            : o
        ),
      }
    }

    // ---- Pets ------------------------------------------------------------
    case ACTION.ADD_PET:
      return { ...state, pets: [...state.pets, action.payload] }

    case ACTION.UPDATE_PET:
      return {
        ...state,
        pets: state.pets.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      }

    case ACTION.DELETE_PET:
      return { ...state, pets: state.pets.filter((p) => p.id !== action.payload) }

    // ---- Addresses -------------------------------------------------------
    case ACTION.ADD_ADDRESS: {
      const newAddr = action.payload
      // If the new address is set as default, unset others first
      const addresses = newAddr.isDefault
        ? state.addresses.map((a) => ({ ...a, isDefault: false }))
        : state.addresses
      return { ...state, addresses: [...addresses, newAddr] }
    }

    case ACTION.UPDATE_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      }

    case ACTION.DELETE_ADDRESS:
      return { ...state, addresses: state.addresses.filter((a) => a.id !== action.payload) }

    case ACTION.SET_DEFAULT_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.map((a) => ({
          ...a,
          isDefault: a.id === action.payload,
        })),
      }

    // ---- Reports ---------------------------------------------------------
    case ACTION.SUBMIT_REPORT:
      return { ...state, reports: [...state.reports, action.payload] }

    case ACTION.UPDATE_REPORT_RATING: {
      const { reportId, rating } = action.payload
      return {
        ...state,
        reports: state.reports.map((r) =>
          r.id === reportId ? { ...r, rating } : r
        ),
      }
    }

    // ---- Products --------------------------------------------------------
    case ACTION.ADD_PRODUCT:
      return { ...state, products: [...state.products, action.payload] }

    case ACTION.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      }

    case ACTION.DELETE_PRODUCT:
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) }

    // ---- Cart ------------------------------------------------------------
    case ACTION.CART_ADD_ITEM: {
      const { product, quantity } = action.payload
      const existing = state.cart.items.find((i) => i.id === product.id)
      const items = existing
        ? state.cart.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...state.cart.items, { ...product, quantity }]
      return { ...state, cart: { ...state.cart, items } }
    }

    case ACTION.CART_REMOVE_ITEM:
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter((i) => i.id !== action.payload),
        },
      }

    case ACTION.CART_UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.filter((i) => i.id !== productId),
          },
        }
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          ),
        },
      }
    }

    case ACTION.CART_SET_DELIVERY_TYPE:
      return {
        ...state,
        cart: { ...state.cart, deliveryType: action.payload },
      }

    case ACTION.CART_CLEAR:
      return { ...state, cart: { items: [], deliveryType: 'door' } }

    // ---- Toasts ----------------------------------------------------------
    case ACTION.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] }

    case ACTION.REMOVE_TOAST:
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const StoreContext = createContext(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)

  // -- Persist cart to localStorage whenever it changes ----------------------
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart))
    } catch {
      // storage full or unavailable – silently ignore
    }
  }, [state.cart])

  // -- Toast auto-dismiss ---------------------------------------------------
  const toastTimers = useRef(new Map())

  useEffect(() => {
    state.toasts.forEach((toast) => {
      if (!toastTimers.current.has(toast.id)) {
        const timer = setTimeout(() => {
          dispatch({ type: ACTION.REMOVE_TOAST, payload: toast.id })
          toastTimers.current.delete(toast.id)
        }, 3000)
        toastTimers.current.set(toast.id, timer)
      }
    })
    // Clean up timers for toasts that no longer exist
    for (const [id] of toastTimers.current) {
      if (!state.toasts.find((t) => t.id === id)) {
        clearTimeout(toastTimers.current.get(id))
        toastTimers.current.delete(id)
      }
    }
  }, [state.toasts])

  // -- Action creators (memoized) ------------------------------------------

  // Orders
  const addOrder = useCallback((order) => {
    const newOrder = {
      id: generateOrderId(),
      status: 'pending',
      ...order,
    }
    dispatch({ type: ACTION.ADD_ORDER, payload: newOrder })
    return newOrder
  }, [])

  const updateOrderStatus = useCallback((orderId, nextStatus) => {
    // We validate inside the reducer as well, but we also guard here so
    // callers can be informed if the transition is invalid.
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return false
    if (!isValidTransition(order.status, nextStatus)) return false
    dispatch({ type: ACTION.UPDATE_ORDER_STATUS, payload: { orderId, status: nextStatus } })
    return true
  }, [state.orders])

  const cancelOrder = useCallback((orderId) => {
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return false
    if (!isValidTransition(order.status, 'cancelled')) return false
    dispatch({ type: ACTION.CANCEL_ORDER, payload: { orderId } })
    return true
  }, [state.orders])

  // Pets
  const addPet = useCallback((pet) => {
    const newPet = {
      id: generatePetId(),
      ...pet,
    }
    dispatch({ type: ACTION.ADD_PET, payload: newPet })
    return newPet
  }, [])

  const updatePet = useCallback((pet) => {
    dispatch({ type: ACTION.UPDATE_PET, payload: pet })
  }, [])

  const deletePet = useCallback((petId) => {
    dispatch({ type: ACTION.DELETE_PET, payload: petId })
  }, [])

  // Addresses
  const addAddress = useCallback((address) => {
    const newAddress = {
      id: generateAddressId(),
      ...address,
    }
    dispatch({ type: ACTION.ADD_ADDRESS, payload: newAddress })
    return newAddress
  }, [])

  const updateAddress = useCallback((address) => {
    dispatch({ type: ACTION.UPDATE_ADDRESS, payload: address })
  }, [])

  const deleteAddress = useCallback((addressId) => {
    dispatch({ type: ACTION.DELETE_ADDRESS, payload: addressId })
  }, [])

  const setDefaultAddress = useCallback((addressId) => {
    dispatch({ type: ACTION.SET_DEFAULT_ADDRESS, payload: addressId })
  }, [])

  // Reports
  const submitReport = useCallback((report) => {
    const newReport = {
      id: generateReportId(),
      ...report,
    }
    dispatch({ type: ACTION.SUBMIT_REPORT, payload: newReport })
    return newReport
  }, [])

  const updateReportRating = useCallback((reportId, rating) => {
    dispatch({ type: ACTION.UPDATE_REPORT_RATING, payload: { reportId, rating } })
  }, [])

  // Products
  const addProduct = useCallback((product) => {
    dispatch({ type: ACTION.ADD_PRODUCT, payload: product })
  }, [])

  const updateProduct = useCallback((product) => {
    dispatch({ type: ACTION.UPDATE_PRODUCT, payload: product })
  }, [])

  const deleteProduct = useCallback((productId) => {
    dispatch({ type: ACTION.DELETE_PRODUCT, payload: productId })
  }, [])

  // Cart
  const addItem = useCallback((product, quantity = 1) => {
    dispatch({ type: ACTION.CART_ADD_ITEM, payload: { product, quantity } })
  }, [])

  const removeItem = useCallback((productId) => {
    dispatch({ type: ACTION.CART_REMOVE_ITEM, payload: productId })
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    dispatch({ type: ACTION.CART_UPDATE_QUANTITY, payload: { productId, quantity } })
  }, [])

  const setDeliveryType = useCallback((deliveryType) => {
    dispatch({ type: ACTION.CART_SET_DELIVERY_TYPE, payload: deliveryType })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: ACTION.CART_CLEAR })
  }, [])

  // Toasts
  const addToast = useCallback((message, type = 'info') => {
    const id = `toast-${Date.now()}`
    dispatch({ type: ACTION.ADD_TOAST, payload: { id, message, type } })
    return id
  }, [])

  const removeToast = useCallback((toastId) => {
    dispatch({ type: ACTION.REMOVE_TOAST, payload: toastId })
  }, [])

  // -- Derived cart values --------------------------------------------------
  const cartItems = state.cart.items
  const deliveryType = state.cart.deliveryType
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = deliveryType === 'door' ? 0 : (totalPrice > 99 ? 0 : 8)
  const finalPrice = totalPrice + deliveryFee

  // -- Context value --------------------------------------------------------
  const value = {
    // State slices
    orders: state.orders,
    pets: state.pets,
    addresses: state.addresses,
    reports: state.reports,
    products: state.products,
    toasts: state.toasts,

    // Cart state
    cartItems,
    deliveryType,
    totalItems,
    totalPrice,
    deliveryFee,
    finalPrice,

    // Order actions
    addOrder,
    updateOrderStatus,
    cancelOrder,

    // Pet actions
    addPet,
    updatePet,
    deletePet,

    // Address actions
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    // Report actions
    submitReport,
    updateReportRating,

    // Product actions
    addProduct,
    updateProduct,
    deleteProduct,

    // Cart actions
    addItem,
    removeItem,
    updateQuantity,
    setDeliveryType,
    clearCart,

    // Toast actions
    addToast,
    removeToast,
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Exports for testing / external consumption
// ---------------------------------------------------------------------------
export { VALID_TRANSITIONS, isValidTransition, generateOrderId, generateReportId, generatePetId, generateAddressId }
