import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '../../../data/store';
import { RoleProvider } from '../../../hooks/useRole';
import { CartProvider } from '../../../hooks/useCart';
import OwnerProfile from '../Profile';

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/owner/profile']}>
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

describe('OwnerProfile', () => {
  it('renders user name', () => {
    render(<OwnerProfile />, { wrapper });
    expect(screen.getByText('小明')).toBeInTheDocument();
  });

  it('renders menu items', () => {
    render(<OwnerProfile />, { wrapper });
    expect(screen.getByText('我的订单')).toBeInTheDocument();
    expect(screen.getByText('我的宠物')).toBeInTheDocument();
    expect(screen.getByText('地址管理')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<OwnerProfile />, { wrapper });
    expect(screen.getByText('退出登录')).toBeInTheDocument();
  });
});