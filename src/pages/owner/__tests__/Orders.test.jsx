import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '../../../data/store';
import { RoleProvider } from '../../../hooks/useRole';
import { CartProvider } from '../../../hooks/useCart';
import OwnerOrders from '../Orders';

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/owner/orders']}>
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

describe('OwnerOrders', () => {
  it('renders status tabs', () => {
    render(<OwnerOrders />, { wrapper });
    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('待接单')).toBeInTheDocument();
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<OwnerOrders />, { wrapper });
    expect(screen.getByPlaceholderText('搜索宠物名称或订单号')).toBeInTheDocument();
  });

  it('renders orders after loading', async () => {
    render(<OwnerOrders />, { wrapper });
    await waitFor(() => {
      const tuanzi = screen.getAllByText('团子');
      expect(tuanzi.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 2000 });
  });

  it('filters by status tab', async () => {
    render(<OwnerOrders />, { wrapper });
    await waitFor(() => {
      const tuanzi = screen.getAllByText('团子');
      expect(tuanzi.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 2000 });
    // "待接单" appears as both a tab button and a status badge - click the tab button specifically
    const tabButtons = screen.getAllByText('待接单');
    fireEvent.click(tabButtons[0]);
    // Only pending orders should show - 旺财 is the pending order pet
    const wangcai = screen.getAllByText('旺财');
    expect(wangcai.length).toBeGreaterThanOrEqual(1);
  });
});