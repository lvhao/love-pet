import { expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { given, when, bddThen as then, runFeature } from './bdd'
import { StoreProvider } from '../../data/store'
import { RoleProvider } from '../../hooks/useRole'
import Dashboard from '../../pages/caretaker/Dashboard'

const feature = `
Feature: 照护师接单
  作为照护师，我想接单并完成服务，以便获得收入。

  Scenario: 接单
    Given 有一个新订单
    When 我点击"接单"按钮
    Then 订单状态变为"已接单"
`

let mockOrder

given('有一个新订单', () => {
  mockOrder = { id: 1, status: 'pending' }
  render(
    <BrowserRouter>
      <StoreProvider>
        <RoleProvider>
          <Dashboard />
        </RoleProvider>
      </StoreProvider>
    </BrowserRouter>
  )
})

when('我点击"接单"按钮', () => {
  const acceptButton = screen.getByRole('button', { name: '接单' })
  fireEvent.click(acceptButton)
})

then('订单状态变为"已接单"', async () => {
  await waitFor(() => {
    expect(screen.getByText(/已接单/i)).toBeInTheDocument()
  })
})

runFeature(feature)
