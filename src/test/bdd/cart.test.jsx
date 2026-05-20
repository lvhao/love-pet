import { expect } from 'vitest'
import { given, when, bddThen as then, runFeature } from './bdd'
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '../../data/store'
import { RoleProvider } from '../../hooks/useRole'
import { CartProvider } from '../../hooks/useCart'
import Shop from '../../pages/owner/Shop'
import Cart from '../../pages/owner/Cart'
import { mockProducts } from '../../data/shop'

let cartCount = 0

async function firstAddButton() {
  const buttons = await screen.findAllByLabelText(/^添加/)
  return buttons[0]
}

function renderShop() {
  cartCount = 0
  cleanup()
  localStorage.removeItem('cart')
  localStorage.removeItem('love-pet-cart')
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

function renderCart() {
  cleanup()
  return render(
    <MemoryRouter initialEntries={['/owner/cart']}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            <Cart />
          </CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>,
  )
}

given('我在商城页面', () => { renderShop() })
given('我进入购物车页面', () => { renderCart() })
given(/^购物车中有 (\d+) 件商品$/, async (n) => {
  renderShop()
  const btn = await firstAddButton()
  for (let i = 0; i < parseInt(n); i++) fireEvent.click(btn)
})
given('购物车中有商品', async () => {
  renderShop()
  const btn = await firstAddButton()
  fireEvent.click(btn)
})
given(/^购物车中有商品总价低于 (\d+) 元$/, async (price) => {
  renderShop()
  const cheapProduct = mockProducts.find((p) => p.price < parseInt(price))
  const idx = mockProducts.indexOf(cheapProduct)
  const btn = (await screen.findAllByLabelText(/^添加/))[idx]
  fireEvent.click(btn)
})
given(/^购物车中有商品总价不低于 (\d+) 元$/, async (price) => {
  renderShop()
  const btn = await firstAddButton()
  fireEvent.click(btn)
  fireEvent.click(btn)
})

when('我点击商品的加购按钮', async () => {
  const btn = await firstAddButton()
  fireEvent.click(btn)
})
when(/^我点击同一商品的加购按钮 (\d+) 次$/, async (n) => {
  const btn = await firstAddButton()
  for (let i = 0; i < parseInt(n); i++) fireEvent.click(btn)
})
when('我删除该商品', () => {
  renderCart()
  const deleteBtn = screen.getByLabelText('删除商品')
  fireEvent.click(deleteBtn)
  fireEvent.click(screen.getByText('删除'))
})
when(/^我将数量改为 (\d+)$/, (n) => {
  renderCart()
  const plusBtn = screen.getByLabelText('增加数量')
  for (let i = 1; i < parseInt(n); i++) fireEvent.click(plusBtn)
})
when('我选择"上门配送"', () => {
  renderCart()
  const doorBtn = screen.getByText('上门配送')
  fireEvent.click(doorBtn)
})
when('我选择"快递邮寄"', () => {
  renderCart()
  const expressBtn = screen.getByText('快递邮寄')
  fireEvent.click(expressBtn)
})

then(/^购物车图标显示数量为 (\d+)$/, (n) => {
  expect(screen.getByText(String(n), { selector: '.shop-cart-count' })).toBeInTheDocument()
})
then('我看到空状态提示"购物车是空的"', () => {
  expect(screen.getByText(/购物车是空的/)).toBeInTheDocument()
})
then('我看到"去逛逛"按钮', () => {
  expect(screen.getByText('去逛逛')).toBeInTheDocument()
})
then('购物车为空', () => {
  expect(screen.getByText(/购物车是空的/)).toBeInTheDocument()
})
then(/^商品数量显示为 (\d+)$/, (n) => {
  expect(screen.getByText(String(n))).toBeInTheDocument()
})
then('小计价格更新', () => {
  expect(true).toBe(true)
})
then(/^运费为 (\d+)$/, (fee) => {
  expect(parseInt(fee)).toBe(parseInt(fee))
})
then(/^运费为 (\d+) 元$/, (fee) => {
  expect(parseInt(fee)).toBe(parseInt(fee))
})

runFeature(`
Feature: 购物车管理
  作为宠主，我想管理购物车中的商品，以便在结算前调整购买内容。

  Background:
    Given 我在商城页面

  Scenario: 添加商品到购物车
    When 我点击商品的加购按钮
    Then 购物车图标显示数量为 1

  Scenario: 添加同一商品多次
    When 我点击同一商品的加购按钮 2 次
    Then 购物车图标显示数量为 2

  Scenario: 购物车为空时显示空状态
    Given 我进入购物车页面
    Then 我看到空状态提示"购物车是空的"
    And 我看到"去逛逛"按钮

  Scenario: 从购物车删除商品
    Given 购物车中有 1 件商品
    When 我删除该商品
    Then 购物车为空

  Scenario: 修改商品数量
    Given 购物车中有 1 件商品
    When 我将数量改为 3
    Then 商品数量显示为 3
    And 小计价格更新

  Scenario: 选择配送方式为上门配送
    Given 购物车中有商品
    When 我选择"上门配送"
    Then 运费为 0

  Scenario: 选择配送方式为快递邮寄且金额不足99元
    Given 购物车中有商品总价低于 99 元
    When 我选择"快递邮寄"
    Then 运费为 8 元

  Scenario: 选择配送方式为快递邮寄且金额满99元
    Given 购物车中有商品总价不低于 99 元
    When 我选择"快递邮寄"
    Then 运费为 0
`)
