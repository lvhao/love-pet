import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from '../../../data/store'
import { RoleProvider } from '../../../hooks/useRole'
import { CartProvider } from '../../../hooks/useCart'
import OperatorData from '../Data'
import OperatorDataDetail, { buildRows, exportRowsToExcel } from '../DataDetail'
import { mockOrders } from '../../../data/mock'
import { mockProducts } from '../../../data/shop'

function Providers({ children, initialEntries = ['/operator/data'] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>
  )
}

function renderData() {
  return render(
    <Providers>
      <Routes>
        <Route path="/operator/data" element={<OperatorData />} />
        <Route path="/operator/data/:type" element={<OperatorDataDetail />} />
      </Routes>
    </Providers>,
  )
}

function renderDetail(type = 'business') {
  return render(
    <Providers initialEntries={[`/operator/data/${type}`]}>
      <Routes>
        <Route path="/operator/data/:type" element={<OperatorDataDetail />} />
      </Routes>
    </Providers>,
  )
}

beforeEach(() => { localStorage.clear() })

describe('OperatorData', () => {
  it('renders unified data cards', () => {
    renderData()
    expect(screen.getByText('运营数据')).toBeInTheDocument()
    expect(screen.getAllByText('数据').length).toBeGreaterThan(0)
    expect(screen.getByText('详情页可导出 Excel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /经营/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /履约/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /治理/ })).toBeInTheDocument()
    expect(screen.getByText('经营数据')).toBeInTheDocument()
    expect(screen.getByText('查看明细并导出 Excel')).toBeInTheDocument()
  })

  it('switches compact data cards and shows current metrics below', () => {
    renderData()
    expect(screen.getByText('今日服务成交')).toBeInTheDocument()
    expect(screen.getByText('商品累计GMV')).toBeInTheDocument()
    expect(screen.queryByText('待接单')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /履约/ }))
    expect(screen.getByText('履约数据')).toBeInTheDocument()
    expect(screen.getByText('待接单')).toBeInTheDocument()
    expect(screen.getByText('待报告')).toBeInTheDocument()
    expect(screen.queryByText('今日服务成交')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /治理/ }))
    expect(screen.getByText('治理数据')).toBeInTheDocument()
    expect(screen.getByText('待审核护理师')).toBeInTheDocument()
    expect(screen.getByText('处理中客诉')).toBeInTheDocument()
    expect(screen.queryByText('待分配')).not.toBeInTheDocument()
  })

  it('opens detail page from a data card', () => {
    renderData()
    fireEvent.click(screen.getByRole('button', { name: /履约/ }))
    fireEvent.click(screen.getByText('查看明细并导出 Excel'))
    expect(screen.getAllByText('履约数据详情').length).toBeGreaterThan(0)
    expect(screen.getByText('导出 Excel')).toBeInTheDocument()
  })
})

describe('OperatorDataDetail', () => {
  it('renders governance detail with export action', () => {
    renderDetail('governance')
    expect(screen.getAllByText('治理数据详情').length).toBeGreaterThan(0)
    expect(screen.getByText('护理师审核、客诉和待补报告明细')).toBeInTheDocument()
    expect(screen.getByText('导出 Excel')).toBeInTheDocument()
    expect(screen.getAllByText('客户投诉').length).toBeGreaterThan(0)
  })

  it('builds rows for each detail module', () => {
    expect(buildRows('business', mockProducts, mockOrders).length).toBeGreaterThan(0)
    expect(buildRows('fulfillment', mockProducts, mockOrders)[0]).toHaveProperty('订单')
    expect(buildRows('governance', mockProducts, mockOrders)[0]).toHaveProperty('类型')
  })

  it('exports xls file', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    URL.createObjectURL = vi.fn(() => 'blob:operator-data')
    URL.revokeObjectURL = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    exportRowsToExcel('测试数据', [{ 指标: '今日服务成交', 数值: '¥0' }])

    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(appendSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:operator-data')

    clickSpy.mockRestore()
  })
})
