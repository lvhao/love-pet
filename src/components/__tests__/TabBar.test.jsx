import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoleProvider } from '../../hooks/useRole';
import TabBar from '../TabBar';

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/owner']}>
      <RoleProvider>{children}</RoleProvider>
    </MemoryRouter>
  );
}

describe('TabBar', () => {
  it('renders owner tabs by default', () => {
    render(<TabBar />, { wrapper });
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('商城')).toBeInTheDocument();
    expect(screen.getByText('订单')).toBeInTheDocument();
    expect(screen.getByText('我的')).toBeInTheDocument();
  });

  it('renders 4 owner tabs', () => {
    render(<TabBar />, { wrapper });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});