import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '../../../data/store';
import { RoleProvider } from '../../../hooks/useRole';
import { CartProvider } from '../../../hooks/useCart';
import OwnerHome from '../Home';

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/owner']}>
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

describe('OwnerHome', () => {
  it('renders the page title in header', () => {
    render(<OwnerHome />, { wrapper });
    const titles = screen.getAllByText('宠管家');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the hero section with "立即下单" button', () => {
    render(<OwnerHome />, { wrapper });
    expect(screen.getByText('立即下单')).toBeInTheDocument();
  });

  it('renders trust badges', () => {
    render(<OwnerHome />, { wrapper });
    expect(screen.getByText('实时看护')).toBeInTheDocument();
    expect(screen.getByText('专业SOP服务')).toBeInTheDocument();
  });

  it('renders service types after loading', async () => {
    render(<OwnerHome />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('上门喂养')).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(screen.getByText('喂养+遛狗')).toBeInTheDocument();
    expect(screen.getByText('喂养+洗护')).toBeInTheDocument();
  });

  it('renders active orders section', async () => {
    render(<OwnerHome />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('正在照顾中')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});