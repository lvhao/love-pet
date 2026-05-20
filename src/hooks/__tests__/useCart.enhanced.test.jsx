import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCart } from '../useCart'

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('初始购物车为空', () => {
    const { result } = renderHook(() => useCart())
    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('添加商品到购物车', () => {
    const { result } = renderHook(() => useCart())
    const product = { id: 1, name: '狗粮', price: 50 }

    act(() => {
      result.current.addItem(product)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(1)
  })

  it('添加相同商品增加数量', () => {
    const { result } = renderHook(() => useCart())
    const product = { id: 1, name: '狗粮', price: 50 }

    act(() => {
      result.current.addItem(product)
      result.current.addItem(product)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('计算总价正确', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({ id: 1, price: 50 })
      result.current.addItem({ id: 2, price: 30 })
    })

    expect(result.current.total).toBe(80)
  })

  it('删除商品', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({ id: 1, price: 50 })
      result.current.removeItem(1)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('更新商品数量', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({ id: 1, price: 50 })
      result.current.updateQuantity(1, 5)
    })

    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.total).toBe(250)
  })

  it('清空购物车', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({ id: 1, price: 50 })
      result.current.clear()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('购物车数据持久化到 localStorage', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({ id: 1, price: 50 })
    })

    const stored = JSON.parse(localStorage.getItem('cart'))
    expect(stored).toHaveLength(1)
  })
})
