import { expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { given, when, bddThen as then, runFeature } from './bdd'
import { StoreProvider } from '../../data/store'
import { RoleProvider } from '../../hooks/useRole'
import Dashboard from '../../pages/caretaker/Dashboard'

const feature = `
Feature: 照护师接单
  作为照护师，我一次只处理一个当前服务，避免同时进行多单。

  Scenario: 当前已有服务时不能继续接单
    Given 我已有当前服务和待接任务
    When 我查看待接任务
    Then 接单入口显示为"服务中"
`

given('我已有当前服务和待接任务', () => {
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

when('我查看待接任务', () => {
  fireEvent.click(screen.getByRole('button', { name: /可接任务/ }))
  expect(screen.getAllByText('可接任务').length).toBeGreaterThan(0)
})

then('接单入口显示为"服务中"', async () => {
  await waitFor(() => {
    const blockedButtons = screen.getAllByRole('button', { name: '服务中' })
    expect(blockedButtons.length).toBeGreaterThanOrEqual(1)
    expect(blockedButtons[0]).toBeDisabled()
  })
})

runFeature(feature)
