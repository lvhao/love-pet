import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '../../data/store'
import { RoleProvider } from '../../hooks/useRole'
import { CartProvider } from '../../hooks/useCart'
import Shop from '../../pages/owner/Shop'

function renderShop() {
  return render(
    <MemoryRouter initialEntries={['/owner/shop']}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            <Shop />
          </CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>,
  )
}

describe('Feature: 商城浏览与搜索', () => {
  it('查看商城标题', () => {
    renderShop()
    expect(screen.getByText('宠管家商城')).toBeInTheDocument()
  })

  it('查看搜索框', () => {
    renderShop()
    expect(screen.getByPlaceholderText('搜索猫粮、狗粮、玩具...')).toBeInTheDocument()
  })

  it('查看商品分类标签', () => {
    renderShop()
    expect(screen.getByRole('button', { name: '全部' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '猫粮' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '狗粮' })).toBeInTheDocument()
  })

  it('商品加载后显示', async () => {
    renderShop()
    await waitFor(() => {
      expect(screen.getByText('皇家猫粮 室内成猫粮 2kg')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('按分类筛选商品', async () => {
    renderShop()
    await waitFor(() => {
      expect(screen.getByText('皇家猫粮 室内成猫粮 2kg')).toBeInTheDocument()
    }, { timeout: 3000 })

    fireEvent.click(screen.getByRole('button', { name: '猫粮' }))

    expect(screen.getByText('皇家猫粮 室内成猫粮 2kg')).toBeInTheDocument()
    expect(screen.getByText('渴望六种鱼全猫粮 1.8kg')).toBeInTheDocument()
  })
})
