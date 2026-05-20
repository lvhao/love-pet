import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RoleProvider, useRole } from '../useRole'

const wrapper = ({ children }) => (
  <BrowserRouter>
    <RoleProvider>{children}</RoleProvider>
  </BrowserRouter>
)

describe('useRole', () => {
  it('默认角色为 owner', () => {
    const { result } = renderHook(() => useRole(), { wrapper })
    expect(result.current.role).toBe('owner')
  })

  it('切换角色更新 user 数据', () => {
    const { result } = renderHook(() => useRole(), { wrapper })

    act(() => {
      result.current.setRole('caretaker')
    })

    expect(result.current.role).toBe('caretaker')
    expect(result.current.user).toBeDefined()
  })

  it('支持三种角色: owner, caretaker, operator', () => {
    const { result } = renderHook(() => useRole(), { wrapper })

    const roles = ['owner', 'caretaker', 'operator']
    roles.forEach(role => {
      act(() => {
        result.current.setRole(role)
      })
      expect(result.current.role).toBe(role)
      expect(result.current.user).toBeDefined()
    })
  })
})
