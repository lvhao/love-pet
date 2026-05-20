import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../useCart';

function wrapper({ children }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe('useCart', () => {
  it('initializes with empty items and door delivery', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.deliveryType).toBe('door');
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('addItem adds new product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 168 }, 2);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(336);
  });

  it('addItem increments quantity for existing product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 168 }, 1);
    });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 168 }, 3);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(4);
    expect(result.current.totalItems).toBe(4);
  });

  it('removeItem removes product by id', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 168 });
      result.current.addItem({ id: 'prod_2', name: 'Dog Food', price: 128 });
    });
    act(() => {
      result.current.removeItem('prod_1');
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('prod_2');
  });

  it('updateQuantity changes quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 100 }, 1);
    });
    act(() => {
      result.current.updateQuantity('prod_1', 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
  });

  it('updateQuantity removes item when quantity <= 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 168 });
    });
    act(() => {
      result.current.updateQuantity('prod_1', 0);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('clearCart empties items but keeps deliveryType', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 168 });
      result.current.setDeliveryType('express');
    });
    act(() => {
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
    // Note: useCart's clearCart only clears items, not deliveryType
    expect(result.current.deliveryType).toBe('express');
  });

  it('setDeliveryType changes delivery type', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.setDeliveryType('express');
    });
    expect(result.current.deliveryType).toBe('express');
  });

  it('deliveryFee is 0 for door delivery', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 50 });
    });
    expect(result.current.deliveryFee).toBe(0);
  });

  it('deliveryFee is 0 for express when totalPrice > 99', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 168 });
      result.current.setDeliveryType('express');
    });
    expect(result.current.deliveryFee).toBe(0);
  });

  it('deliveryFee is 8 for express when totalPrice <= 99', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 50 });
      result.current.setDeliveryType('express');
    });
    expect(result.current.deliveryFee).toBe(8);
  });

  it('finalPrice = totalPrice + deliveryFee', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({ id: 'prod_1', name: 'Cat Food', price: 50 });
      result.current.setDeliveryType('express');
    });
    expect(result.current.finalPrice).toBe(58);
  });
});