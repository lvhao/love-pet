import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from '../../../data/store'
import { RoleProvider } from '../../../hooks/useRole'
import { CartProvider } from '../../../hooks/useCart'
import Dashboard from '../Dashboard'
import StatsDetail, { buildCaretakerRows } from '../StatsDetail'
import { mockOrders } from '../../../data/mock'

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/caretaker']}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            <Routes>
              <Route path="/caretaker" element={<Dashboard />} />
              <Route path="/caretaker/stats/:type" element={<StatsDetail />} />
            </Routes>
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
    expect(screen.getByRole('button', { name: /可接任务/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /当前服务/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /已完成/ })).toBeInTheDocument()
  })

  it('uses caretaker scoped stats', () => {
    renderDashboard()
    expect(screen.getByRole('button', { name: /1 当前服务/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /2 可接任务/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /2 已完成/ })).toBeInTheDocument()
  })

  it('opens stat detail for the active task group', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /可接任务/ }))
    fireEvent.click(screen.getByRole('button', { name: '数据详情' }))
    expect(screen.getAllByText('可接任务详情').length).toBeGreaterThan(0)
    expect(screen.getByText('开放接单池中当前可查看的待接任务')).toBeInTheDocument()
    expect(screen.getByText('导出 Excel')).toBeInTheDocument()
  })

  it('builds caretaker stat detail rows', () => {
    expect(buildCaretakerRows('available', mockOrders)).toHaveLength(2)
    expect(buildCaretakerRows('current', mockOrders)).toHaveLength(1)
    expect(buildCaretakerRows('completed', mockOrders)).toHaveLength(2)
  })

  it('disables accepting available tasks while caretaker has a current service', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /可接任务/ }))
    const disabledButtons = screen.getAllByRole('button', { name: '服务中' })
    expect(disabledButtons).toHaveLength(2)
    disabledButtons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('shows nearby task distance while current service blocks accepting', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /可接任务/ }))
    expect(screen.getAllByText('可接任务').length).toBeGreaterThan(0)
    expect(screen.getByText('按当前服务点估算顺路距离')).toBeInTheDocument()
    expect(screen.getAllByText(/服务后距你/).length).toBeGreaterThan(0)
    expect(screen.getByText('顺路优先')).toBeInTheDocument()
  })

  it('renders role switcher', () => {
    renderDashboard()
    expect(screen.getByText('宠主')).toBeInTheDocument()
    expect(screen.getByText('护理师')).toBeInTheDocument()
    expect(screen.getByText('运营')).toBeInTheDocument()
  })

  it('renders order list sections', () => {
    renderDashboard()
    expect(screen.getAllByText('当前服务').length).toBeGreaterThanOrEqual(1)
    fireEvent.click(screen.getByRole('button', { name: /可接任务/ }))
    expect(screen.getAllByText('可接任务').length).toBeGreaterThanOrEqual(1)
    fireEvent.click(screen.getByRole('button', { name: /已完成/ }))
    expect(screen.getAllByText('已完成').length).toBeGreaterThanOrEqual(1)
  })
})
