import { describe, it, expect } from 'vitest';
import {
  mockUsers,
  mockPets,
  mockAddresses,
  mockOrders,
  mockReport,
  serviceTypes,
  sopSteps,
  statusLabels,
  statusColors,
} from '../mock';

describe('mock data', () => {
  it('mockUsers has owner and caretaker', () => {
    expect(mockUsers.owner).toBeDefined();
    expect(mockUsers.caretaker).toBeDefined();
    expect(mockUsers.owner.role).toBe('owner');
    expect(mockUsers.caretaker.role).toBe('caretaker');
  });

  it('caretaker has extra fields', () => {
    expect(mockUsers.caretaker).toHaveProperty('rating');
    expect(mockUsers.caretaker).toHaveProperty('completedOrders');
    expect(mockUsers.caretaker).toHaveProperty('specialties');
    expect(mockUsers.caretaker).toHaveProperty('bio');
  });

  it('mockPets has 2 pets', () => {
    expect(mockPets).toHaveLength(2);
    expect(mockPets[0].type).toBe('cat');
    expect(mockPets[1].type).toBe('dog');
  });

  it('mockAddresses has 2 addresses', () => {
    expect(mockAddresses).toHaveLength(2);
    expect(mockAddresses.find((a) => a.isDefault)).toBeDefined();
  });

  it('mockOrders has 5 orders with various statuses', () => {
    expect(mockOrders).toHaveLength(5);
    const statuses = mockOrders.map((o) => o.status);
    expect(statuses).toContain('streaming');
    expect(statuses).toContain('pending');
    expect(statuses).toContain('completed');
    expect(statuses).toContain('accepted');
    expect(statuses).toContain('in_progress');
  });

  it('mockReport has environmentCheck', () => {
    expect(mockReport.environmentCheck).toBeDefined();
    expect(mockReport.environmentCheck.windows).toBe(true);
    expect(mockReport.environmentCheck.hazards).toBe(false);
  });

  it('serviceTypes has 3 types', () => {
    expect(serviceTypes).toHaveLength(3);
    expect(serviceTypes.map((s) => s.key)).toEqual(['feeding', 'feeding_walk', 'feeding_grooming']);
  });

  it('sopSteps has 8 steps', () => {
    expect(sopSteps).toHaveLength(8);
    expect(sopSteps[0].id).toBe(1);
    expect(sopSteps[7].id).toBe(8);
  });

  it('statusLabels covers all statuses', () => {
    const keys = Object.keys(statusLabels);
    expect(keys).toContain('pending');
    expect(keys).toContain('accepted');
    expect(keys).toContain('in_progress');
    expect(keys).toContain('streaming');
    expect(keys).toContain('completed');
    expect(keys).toContain('cancelled');
  });

  it('statusColors covers all statuses', () => {
    const keys = Object.keys(statusColors);
    expect(keys).toHaveLength(6);
    keys.forEach((k) => {
      expect(statusColors[k]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
