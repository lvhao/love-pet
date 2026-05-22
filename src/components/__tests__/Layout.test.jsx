import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoleProvider } from '../../hooks/useRole';
import Layout from '../Layout';

describe('Layout', () => {
  function wrapper({ children }) {
    return (
      <MemoryRouter>
        <RoleProvider>{children}</RoleProvider>
      </MemoryRouter>
    );
  }

  it('renders title', () => {
    render(<Layout title="测试页面">内容</Layout>, { wrapper });
    expect(screen.getByText('测试页面')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Layout title="测试">子内容</Layout>, { wrapper });
    expect(screen.getByText('子内容')).toBeInTheDocument();
  });

  it('does not show back button by default', () => {
    render(<Layout title="测试">内容</Layout>, { wrapper });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows back button when showBack is true', () => {
    render(<Layout title="测试" showBack>内容</Layout>, { wrapper });
    expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(<Layout title="测试" showBack onBack={onBack}>内容</Layout>, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders right slot content', () => {
    render(<Layout title="测试" right={<span>右侧</span>}>内容</Layout>, { wrapper });
    expect(screen.getByText('右侧')).toBeInTheDocument();
  });
});
