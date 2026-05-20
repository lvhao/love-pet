import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoleProvider, useRole } from '../useRole';

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/owner']}>
      <RoleProvider>{children}</RoleProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('useRole', () => {
  it('defaults to owner role', () => {
    const { result } = renderHook(() => useRole(), { wrapper });
    expect(result.current.role).toBe('owner');
  });

  it('provides user object for current role', () => {
    const { result } = renderHook(() => useRole(), { wrapper });
    expect(result.current.user).toBeDefined();
    expect(result.current.user.role).toBe('owner');
  });

  it('setRole changes role to caretaker', () => {
    const { result } = renderHook(() => useRole(), { wrapper });
    act(() => {
      result.current.setRole('caretaker');
    });
    expect(result.current.role).toBe('caretaker');
    expect(result.current.user.role).toBe('caretaker');
  });

  it('setRole changes role to operator', () => {
    const { result } = renderHook(() => useRole(), { wrapper });
    act(() => {
      result.current.setRole('operator');
    });
    expect(result.current.role).toBe('operator');
    expect(result.current.user.role).toBe('operator');
  });

  it('setRole back to owner works', () => {
    const { result } = renderHook(() => useRole(), { wrapper });
    act(() => {
      result.current.setRole('caretaker');
    });
    act(() => {
      result.current.setRole('owner');
    });
    expect(result.current.role).toBe('owner');
  });

  it('caretaker user has rating and specialties', () => {
    const { result } = renderHook(() => useRole(), { wrapper });
    act(() => {
      result.current.setRole('caretaker');
    });
    expect(result.current.user.rating).toBeDefined();
    expect(result.current.user.specialties).toBeDefined();
  });
});