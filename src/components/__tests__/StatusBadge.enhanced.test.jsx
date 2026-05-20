import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '../StatusBadge'

describe('StatusBadge', () => {
  it('待接单状态显示灰色', () => {
    render(<StatusBadge status="pending" />)
    const badge = screen.getByText('待接单')
    expect(badge).toHaveClass('bg-gray-100')
  })

  it('已接单状态显示蓝色', () => {
    render(<StatusBadge status="accepted" />)
    const badge = screen.getByText('已接单')
    expect(badge).toHaveClass('bg-blue-100')
  })

  it('服务中状态显示黄色', () => {
    render(<StatusBadge status="in_progress" />)
    const badge = screen.getByText('服务中')
    expect(badge).toHaveClass('bg-yellow-100')
  })

  it('已完成状态显示绿色', () => {
    render(<StatusBadge status="completed" />)
    const badge = screen.getByText('已完成')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('已取消状态显示红色', () => {
    render(<StatusBadge status="cancelled" />)
    const badge = screen.getByText('已取消')
    expect(badge).toHaveClass('bg-red-100')
  })

  it('未知状态显示默认样式', () => {
    render(<StatusBadge status="unknown" />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
