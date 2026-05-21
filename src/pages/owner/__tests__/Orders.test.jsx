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
    expect(screen.getByPlaceholderText('搜索服务或宠物')).toBeInTheDocument();
  });

  it('renders orders after loading', async () => {
    render(<OwnerOrders />, { wrapper });
    await waitFor(() => {
      const feedingOrders = screen.getAllByText('上门喂养');
      expect(feedingOrders.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 2000 });
  });

  it('shows user-friendly progress text instead of duplicate internal status copy', async () => {
    render(<OwnerOrders />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('直播中，可进入查看')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getAllByText('正在等待护理师接单').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('服务已完成，可查看报告')).toBeInTheDocument();
  });

  it('filters by status tab', async () => {
    render(<OwnerOrders />, { wrapper });
    await waitFor(() => {
      const feedingOrders = screen.getAllByText('上门喂养');
      expect(feedingOrders.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 2000 });
    // "待接单" appears as both a tab button and a status badge - click the tab button specifically
    const tabButtons = screen.getAllByText('待接单');
    fireEvent.click(tabButtons[0]);
    // Only pending orders should show - 旺财's pending order is a feeding + walk service.
    const pendingService = screen.getAllByText('喂养+遛狗');
    expect(pendingService.length).toBeGreaterThanOrEqual(1);
  });

  it('filters by search text', async () => {
    render(<OwnerOrders />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('喂养+洗护')).toBeInTheDocument();
    }, { timeout: 2000 });

    fireEvent.change(screen.getByPlaceholderText('搜索服务或宠物'), {
      target: { value: '洗护' },
    });

    await waitFor(() => {
      expect(screen.getByText('喂养+洗护')).toBeInTheDocument();
      expect(screen.queryByText('直播中，可进入查看')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
