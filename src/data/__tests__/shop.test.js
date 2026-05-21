import { describe, it, expect } from 'vitest';
import { EXPRESS_DELIVERY_FEE, FREE_EXPRESS_THRESHOLD, getDeliveryFee, mockProducts, productCategories, deliveryTypes, mockOperator } from '../shop';

describe('shop data', () => {
  it('mockProducts has 6 products', () => {
    expect(mockProducts).toHaveLength(6);
  });

  it('each product has required fields', () => {
    mockProducts.forEach((p) => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('brand');
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('originalPrice');
      expect(p).toHaveProperty('category');
      expect(p).toHaveProperty('stock');
    });
  });

  it('product categories include all and specific types', () => {
    expect(productCategories).toHaveLength(5);
    expect(productCategories[0].key).toBe('all');
    const keys = productCategories.map((c) => c.key);
    expect(keys).toContain('cat_food');
    expect(keys).toContain('dog_food');
    expect(keys).toContain('cat_toy');
    expect(keys).toContain('dog_toy');
  });

  it('deliveryTypes has door and express', () => {
    expect(deliveryTypes).toHaveLength(2);
    expect(deliveryTypes[0].key).toBe('door');
    expect(deliveryTypes[1].key).toBe('express');
  });

  it('delivery fee uses selected delivery and free express threshold', () => {
    expect(FREE_EXPRESS_THRESHOLD).toBe(99);
    expect(EXPRESS_DELIVERY_FEE).toBe(8);
    expect(getDeliveryFee('door', 50)).toBe(0);
    expect(getDeliveryFee('express', 98)).toBe(8);
    expect(getDeliveryFee('express', 99)).toBe(0);
  });

  it('mockOperator has required fields', () => {
    expect(mockOperator.role).toBe('operator');
    expect(mockOperator).toHaveProperty('name');
    expect(mockOperator).toHaveProperty('phone');
  });
});
