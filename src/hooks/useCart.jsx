import { createContext, useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getDeliveryFee } from '../data/shop'

const CartContext = createContext(null)

function getInitialCartItems() {
  try {
    const stored = localStorage.getItem('cart')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function useCartState() {
  const [items, setItems] = useState(getInitialCartItems)
  const [deliveryType, setDeliveryType] = useState('door')

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])


  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) => prev.map((i) => i.id === productId ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = getDeliveryFee(deliveryType, totalPrice)
  const finalPrice = totalPrice + deliveryFee

  return {
    items, deliveryType, setDeliveryType,
    addItem, removeItem, updateQuantity, clearCart,
    clear: clearCart,
    total: totalPrice,
    totalItems, totalPrice, deliveryFee, finalPrice,
  }
}

export function CartProvider({ children }) {
  const cart = useCartState()

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  )
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useCart() {
  const cart = useContext(CartContext)
  const fallbackCart = useCartState()
  return cart || fallbackCart
}
