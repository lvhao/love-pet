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

  it('does not include the standalone data dashboard', () => {
    renderDashboard()
    expect(screen.queryByText('数据看板')).not.toBeInTheDocument()
    expect(screen.queryByText('今日服务成交')).not.toBeInTheDocument()
    expect(screen.queryByText('累计营收')).not.toBeInTheDocument()
  })

  it('shows product management section', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: '商品' }))
    expect(screen.getAllByText('商品').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /全部商品/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /补库存/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /需消化/ })).toBeInTheDocument()
    expect(screen.getByText('当前在售商品')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /补库存/ }))
    expect(screen.getByText('库存低于 300，优先补货')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /需消化/ }))
    expect(screen.getAllByText('需消化').length).toBeGreaterThan(0)
    expect(screen.getByText('库存高且非热销，考虑活动')).toBeInTheDocument()
  })

  it('shows compact event filters and switches event data below', () => {
    renderDashboard()
    expect(screen.queryByText('运营管理')).not.toBeInTheDocument()
    expect(screen.queryByText('处理今天要落地的运营动作')).not.toBeInTheDocument()
    expect(screen.queryByText('工单处理、商品维护和商品订单发货分开看')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '工单' })).toHaveClass('shop-chip-active')
    expect(screen.getByRole('button', { name: '发货' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '人员' })).not.toBeInTheDocument()
    expect(screen.getByText('事件')).toBeInTheDocument()
    expect(screen.getByText(/项待关注/)).toBeInTheDocument()
    expect(screen.queryByText('运营工单')).not.toBeInTheDocument()
    expect(screen.queryByText('按事件类型处理')).not.toBeInTheDocument()
    expect(screen.queryByText('先切换事件，再在下方处理对应明细')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /待审核/ }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /客诉单/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /履约提醒/ })).toBeInTheDocument()
    expect(screen.getByText('护理师加入申请')).toBeInTheDocument()
    expect(screen.getByText('王阿姨')).toBeInTheDocument()
    expect(screen.getByText('详情')).toBeInTheDocument()
    expect(screen.getByText(/APP_1/)).toBeInTheDocument()
    expect(screen.getByText(/中优先/)).toBeInTheDocument()
    expect(screen.getByText(/今日 18:00 前审核/)).toBeInTheDocument()
    expect(screen.getByText(/准入运营/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /补资料/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /通过/ })).toBeInTheDocument()
    expect(screen.queryByText('客户投诉单')).not.toBeInTheDocument()
    expect(screen.queryByText('小明')).not.toBeInTheDocument()
    expect(screen.queryByText('待分配')).not.toBeInTheDocument()
    expect(screen.queryByText('订单异常')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /客诉单/ }))
    expect(screen.getByText('客户投诉单')).toBeInTheDocument()
    expect(screen.getByText('小明')).toBeInTheDocument()
    expect(screen.getByText(/CMP_1/)).toBeInTheDocument()
    expect(screen.getByText(/高优先/)).toBeInTheDocument()
    expect(screen.getByText(/2 小时内首次响应/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /跟进中/ }).length).toBeGreaterThan(0)
    expect(screen.queryByText('护理师加入申请')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /履约提醒/ }))
    expect(screen.getAllByText('履约提醒').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/预约时间已过，仍未接单/).length).toBeGreaterThan(0)
    expect(screen.getByText(/已完成，待补服务报告/)).toBeInTheDocument()
    expect(screen.getAllByText('系统提醒').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /提醒护理师/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /升级/ }).length).toBeGreaterThan(0)
  })

  it('handles caretaker application and customer complaint actions', () => {
    renderDashboard()
    fireEvent.click(screen.getAllByText('详情')[0])
    expect(screen.getByText('工单详情')).toBeInTheDocument()
    expect(screen.getByText('申请信息')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /通过/ }).at(-1))
    expect(screen.getByText('当前没有需要处理的待审核')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /客诉单/ }))
    fireEvent.click(screen.getAllByText('详情')[0])
    expect(screen.getByText('投诉内容')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /已回访/ }).at(-1))
    expect(screen.queryByText('服务报告照片不完整')).not.toBeInTheDocument()
    expect(screen.getByText('上门配送时间未同步')).toBeInTheDocument()
  })

  it('shows shipping operations for product orders', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: '发货' }))
    expect(screen.getAllByText('发货').length).toBeGreaterThan(0)
    expect(screen.getByText('商品交付')).toBeInTheDocument()
    expect(screen.getByText(/项待交付/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /待处理/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /快递发货/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /上门备货/ })).toBeInTheDocument()
    expect(screen.getByText('客户已选择快递，运营打包并发出')).toBeInTheDocument()
    expect(screen.getByText('标记已发货')).toBeInTheDocument()
    expect(screen.queryByText('标记已备货交接')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /上门备货/ }))
    expect(screen.getByText('客户已选择上门，运营备货并交接给护理师')).toBeInTheDocument()
    expect(screen.getByText('标记已备货交接')).toBeInTheDocument()
    expect(screen.queryByText('标记已发货')).not.toBeInTheDocument()
  })

  it('shows add product button', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: '商品' }))
    expect(screen.getByText('上新')).toBeInTheDocument()
  })

  it('renders role switcher', () => {
    renderDashboard()
    expect(screen.getByText('宠主')).toBeInTheDocument()
    expect(screen.getAllByText('护理师').length).toBeGreaterThan(0)
    expect(screen.getByText('运营')).toBeInTheDocument()
  })

  it('opens add product form', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: '商品' }))
    fireEvent.click(screen.getByText('上新'))
    expect(screen.getByText('添加新商品')).toBeInTheDocument()
    expect(screen.getByText('商品图片 *')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('粘贴商品主图 URL')).toBeInTheDocument()
  })

  it('closes add product form', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: '商品' }))
    fireEvent.click(screen.getByText('上新'))
    expect(screen.getByText('添加新商品')).toBeInTheDocument()
    fireEvent.click(screen.getByText('取消'))
    expect(screen.queryByText('添加新商品')).not.toBeInTheDocument()
  })
})
