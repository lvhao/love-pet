import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '../../../data/store'
import { RoleProvider } from '../../../hooks/useRole'
import { CartProvider } from '../../../hooks/useCart'
import Dashboard from '../Dashboard'

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/caretaker']}>
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

describe('CaretakerDashboard', () => {
  it('renders page title', () => {
    renderDashboard()
    expect(screen.getByText('宠管家 · 护理师')).toBeInTheDocument()
  })

  it('shows stats cards', () => {
    renderDashboard()
    expect(screen.getAllByText('新任务来了').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('你正在照顾').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('已完成')).toBeInTheDocument()
  })

  it('renders role switcher', () => {
    renderDashboard()
    expect(screen.getByText('宠主')).toBeInTheDocument()
    expect(screen.getByText('护理师')).toBeInTheDocument()
    expect(screen.getByText('运营')).toBeInTheDocument()
  })

  it('renders order list sections', () => {
    renderDashboard()
    expect(screen.getAllByText('新任务来了').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('你正在照顾').length).toBeGreaterThanOrEqual(1)
  })
})