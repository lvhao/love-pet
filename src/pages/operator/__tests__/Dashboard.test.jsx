import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '../../../data/store'
import { RoleProvider } from '../../../hooks/useRole'
import { CartProvider } from '../../../hooks/useCart'
import Dashboard from '../Dashboard'

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/operator']}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            <Dashboard />
          </CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => { localStorage.clear() })

describe('OperatorDashboard', () => {
  it('renders page title', () => {
    renderDashboard()
    expect(screen.getByText('宠管家 · 运营')).toBeInTheDocument()
  })

  it('shows stats cards', () => {
    renderDashboard()
    expect(screen.getByText('在售商品')).toBeInTheDocument()
    expect(screen.getByText('累计营收')).toBeInTheDocument()
  })

  it('shows product management section', () => {
    renderDashboard()
    expect(screen.getByText('商品管理')).toBeInTheDocument()
  })

  it('shows add product button', () => {
    renderDashboard()
    expect(screen.getByText('上新')).toBeInTheDocument()
  })

  it('renders role switcher', () => {
    renderDashboard()
    expect(screen.getByText('宠主')).toBeInTheDocument()
    expect(screen.getByText('护理师')).toBeInTheDocument()
    expect(screen.getByText('运营')).toBeInTheDocument()
  })

  it('opens add product form', () => {
    renderDashboard()
    fireEvent.click(screen.getByText('上新'))
    expect(screen.getByText('添加新商品')).toBeInTheDocument()
  })

  it('closes add product form', () => {
    renderDashboard()
    fireEvent.click(screen.getByText('上新'))
    expect(screen.getByText('添加新商品')).toBeInTheDocument()
    fireEvent.click(screen.getByText('取消'))
    expect(screen.queryByText('添加新商品')).not.toBeInTheDocument()
  })
})