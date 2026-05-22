import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '../../../data/store';
import { RoleProvider } from '../../../hooks/useRole';
import { CartProvider } from '../../../hooks/useCart';
import Shop from '../Shop';

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/owner/shop']}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>{children}</CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('Shop', () => {
  it('renders page title', () => {
    render(<Shop />, { wrapper });
    expect(screen.getByText('宠管家商城')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<Shop />, { wrapper });
    expect(screen.getByPlaceholderText('搜索猫粮、狗粮、玩具...')).toBeInTheDocument();
  });

  it('renders product categories', () => {
    render(<Shop />, { wrapper });
    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('猫粮')).toBeInTheDocument();
    expect(screen.getByText('狗粮')).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    render(<Shop />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('皇家猫粮 室内成猫粮 2kg')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('filters products by category', async () => {
    render(<Shop />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('皇家猫粮 室内成猫粮 2kg')).toBeInTheDocument();
    }, { timeout: 2000 });
    fireEvent.click(screen.getByText('猫粮'));
    expect(screen.getByText('皇家猫粮 室内成猫粮 2kg')).toBeInTheDocument();
    expect(screen.getByText('渴望六种鱼全猫粮 1.8kg')).toBeInTheDocument();
  });

  it('shows add-to-cart animation feedback', async () => {
    render(<Shop />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('皇家猫粮 室内成猫粮 2kg')).toBeInTheDocument();
    }, { timeout: 2000 });

    fireEvent.click(screen.getByLabelText('添加皇家猫粮 室内成猫粮 2kg'));

    expect(document.querySelector('.shop-cart-fly-item')).toBeInTheDocument();
    expect(screen.getByLabelText('购物车')).toHaveTextContent('1');
  });
});
