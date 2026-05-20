import { describe, it, expect, vi } from 'vitest';
import {
  VALID_TRANSITIONS,
  isValidTransition,
  generateOrderId,
  generateReportId,
  generatePetId,
  generateAddressId,
} from '../store';

describe('VALID_TRANSITIONS', () => {
  it('pending can transition to accepted or cancelled', () => {
    expect(VALID_TRANSITIONS.pending).toEqual(['accepted', 'cancelled']);
  });

  it('accepted can transition to in_progress or cancelled', () => {
    expect(VALID_TRANSITIONS.accepted).toEqual(['in_progress', 'cancelled']);
  });

  it('in_progress can transition to streaming, completed, or cancelled', () => {
    expect(VALID_TRANSITIONS.in_progress).toEqual(['streaming', 'completed', 'cancelled']);
  });

  it('streaming can transition to completed or cancelled', () => {
    expect(VALID_TRANSITIONS.streaming).toEqual(['completed', 'cancelled']);
  });

  it('completed has no transitions', () => {
    expect(VALID_TRANSITIONS.completed).toEqual([]);
  });

  it('cancelled has no transitions', () => {
    expect(VALID_TRANSITIONS.cancelled).toEqual([]);
  });
});

describe('isValidTransition', () => {
  it('returns true for valid transitions', () => {
    expect(isValidTransition('pending', 'accepted')).toBe(true);
    expect(isValidTransition('pending', 'cancelled')).toBe(true);
    expect(isValidTransition('accepted', 'in_progress')).toBe(true);
    expect(isValidTransition('in_progress', 'streaming')).toBe(true);
    expect(isValidTransition('streaming', 'completed')).toBe(true);
  });

  it('returns false for invalid transitions', () => {
    expect(isValidTransition('pending', 'in_progress')).toBe(false);
    expect(isValidTransition('completed', 'pending')).toBe(false);
    expect(isValidTransition('cancelled', 'pending')).toBe(false);
    expect(isValidTransition('streaming', 'pending')).toBe(false);
  });

  it('returns false for unknown status', () => {
    expect(isValidTransition('unknown', 'pending')).toBe(false);
  });
});

describe('ID generators', () => {
  it('generateOrderId returns ORD- prefix', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    const id = generateOrderId();
    expect(id).toMatch(/^ORD-1000-\d{3}$/);
    vi.restoreAllMocks();
  });

  it('generateReportId returns RPT- prefix', () => {
    vi.spyOn(Date, 'now').mockReturnValue(2000);
    expect(generateReportId()).toBe('RPT-2000');
    vi.restoreAllMocks();
  });

  it('generatePetId returns pet- prefix', () => {
    vi.spyOn(Date, 'now').mockReturnValue(3000);
    expect(generatePetId()).toBe('pet-3000');
    vi.restoreAllMocks();
  });

  it('generateAddressId returns addr- prefix', () => {
    vi.spyOn(Date, 'now').mockReturnValue(4000);
    expect(generateAddressId()).toBe('addr-4000');
    vi.restoreAllMocks();
  });
});
