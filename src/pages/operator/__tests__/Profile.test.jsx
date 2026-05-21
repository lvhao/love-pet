import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '../../../data/store'
import { RoleProvider } from '../../../hooks/useRole'
import { CartProvider } from '../../../hooks/useCart'
import OperatorProfile from '../Profile'

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/operator/profile']}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            <OperatorProfile />
          </CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => { localStorage.clear() })

describe('OperatorProfile', () => {
  it('keeps account and system entries separate from operations', () => {
    renderProfile()
    expect(screen.getByText('运营小王')).toBeInTheDocument()
    expect(screen.getByText('运营管理员')).toBeInTheDocument()
    expect(screen.getByText('夜间模式')).toBeInTheDocument()
    expect(screen.getByText('消息通知')).toBeInTheDocument()
    expect(screen.getByText('权限与安全')).toBeInTheDocument()
    expect(screen.getByText('系统设置')).toBeInTheDocument()
    expect(screen.queryByText('商品管理')).not.toBeInTheDocument()
    expect(screen.queryByText('销售数据')).not.toBeInTheDocument()
  })
})
