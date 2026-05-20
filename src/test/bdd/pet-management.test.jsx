import { expect } from 'vitest'
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { given, when, bddThen as then, runFeature } from './bdd'
import { StoreProvider } from '../../data/store'
import { RoleProvider } from '../../hooks/useRole'
import Pets from '../../pages/owner/Pets'

const feature = `
Feature: 宠物管理
  作为宠主，我想管理我的宠物信息，以便预约服务时使用。

  Scenario: 添加新宠物
    Given 我在宠物列表页面
    When 我点击"添加宠物"按钮
    And 我填写宠物信息
    Then 宠物列表中显示新添加的宠物
`

given('我在宠物列表页面', () => {
  cleanup()
  render(
    <BrowserRouter>
      <StoreProvider>
        <RoleProvider>
          <Pets />
        </RoleProvider>
      </StoreProvider>
    </BrowserRouter>
  )
})

when('我点击"添加宠物"按钮', () => {
  const addButton = screen.getByText(/添加宠物/i)
  fireEvent.click(addButton)
})

when('我填写宠物信息', async () => {
  const nameInput = screen.getByLabelText(/宠物名字/i)
  fireEvent.change(nameInput, { target: { value: '旺财' } })
  fireEvent.change(screen.getByLabelText(/品种/i), { target: { value: '柯基' } })
  fireEvent.change(screen.getByLabelText(/年龄/i), { target: { value: '2岁' } })
  fireEvent.change(screen.getByLabelText(/体重/i), { target: { value: '10kg' } })

  const submitButton = screen.getAllByRole('button', { name: '添加宠物' }).at(-1)
  fireEvent.click(submitButton)
})

then('宠物列表中显示新添加的宠物', async () => {
  await waitFor(() => {
    expect(screen.getAllByText('旺财').length).toBeGreaterThan(0)
  })
})

runFeature(feature)
