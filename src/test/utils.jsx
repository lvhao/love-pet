import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider } from '../data/store'
import { RoleProvider } from '../hooks/useRole'
import { CartProvider } from '../hooks/useCart'

export function AllProviders({ children, initialEntries = ['/owner'] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>{children}</CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(ui, options = {}) {
  const { initialEntries = ['/owner'], ...renderOptions } = options
  const wrapper = ({ children }) => (
    <AllProviders initialEntries={initialEntries}>{children}</AllProviders>
  )
  return render(ui, { wrapper, ...renderOptions })
}

export { render, screen }
