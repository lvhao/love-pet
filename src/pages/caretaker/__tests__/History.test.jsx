import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '../../../data/store'
import { RoleProvider } from '../../../hooks/useRole'
import { CartProvider } from '../../../hooks/useCart'
import History from '../History'

function renderHistory() {
  return render(
    <MemoryRouter initialEntries={['/caretaker/history']}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            <History />
          </CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => { localStorage.clear() })

describe('CaretakerHistory', () => {
  it('renders caretaker completed records sorted by scheduled time descending', () => {
    renderHistory()

    const cards = screen.getAllByRole('button').filter((button) =>
      button.textContent.includes('服务收入') && button.textContent.includes('查看详情')
    )

    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('喂养+洗护')
    expect(cards[0]).toHaveTextContent('2026-05-20 14:00')
    expect(cards[1]).toHaveTextContent('上门喂养')
    expect(cards[1]).toHaveTextContent('2026-05-16 18:00')
  })

  it('shows filtered count and income', () => {
    renderHistory()
    const summary = screen.getByText('查询结果').closest('.shop-card')

    expect(within(summary).getByText('2')).toBeInTheDocument()
    expect(within(summary).getByText('¥258')).toBeInTheDocument()
  })

  it('filters history by keyword', async () => {
    const user = userEvent.setup()
    renderHistory()

    await user.type(screen.getByPlaceholderText('搜宠物、服务或地址'), '洗护')
    const cards = screen.getAllByRole('button').filter((button) =>
      button.textContent.includes('服务收入') && button.textContent.includes('查看详情')
    )

    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveTextContent('喂养+洗护')
    expect(cards[0]).not.toHaveTextContent('上门喂养')
    expect(screen.getByText('¥169')).toBeInTheDocument()
  })

  it('filters history by service chip', async () => {
    const user = userEvent.setup()
    renderHistory()

    await user.click(screen.getByRole('button', { name: '上门喂养' }))

    expect(screen.getByText('2026-05-16 18:00')).toBeInTheDocument()
    expect(screen.queryByText('2026-05-20 14:00')).not.toBeInTheDocument()
  })
})
