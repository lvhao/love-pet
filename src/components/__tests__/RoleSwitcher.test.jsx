import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoleProvider } from '../../hooks/useRole';
import RoleSwitcher from '../RoleSwitcher';

function wrapper({ children }) {
  return (
    <MemoryRouter>
      <RoleProvider>{children}</RoleProvider>
    </MemoryRouter>
  );
}

describe('RoleSwitcher', () => {
  it('renders three role buttons', () => {
    render(<RoleSwitcher />, { wrapper });
    expect(screen.getByText('宠主')).toBeInTheDocument();
    expect(screen.getByText('护理师')).toBeInTheDocument();
    expect(screen.getByText('运营')).toBeInTheDocument();
  });

  it('switches role directly when clicking a different role', () => {
    render(<RoleSwitcher />, { wrapper });
    fireEvent.click(screen.getByText('护理师'));
    expect(screen.queryByText('切换角色？')).not.toBeInTheDocument();
    expect(screen.queryByText('确认切换')).not.toBeInTheDocument();
    expect(screen.getByText('护理师')).toHaveClass('shop-chip-active');
  });

  it('does not show dialog when clicking current role', () => {
    render(<RoleSwitcher />, { wrapper });
    fireEvent.click(screen.getByText('宠主'));
    expect(screen.queryByText('切换角色？')).not.toBeInTheDocument();
  });

  it('does not render dialog controls after switching', () => {
    render(<RoleSwitcher />, { wrapper });
    fireEvent.click(screen.getByText('护理师'));
    expect(screen.queryByText('切换角色？')).not.toBeInTheDocument();
    expect(screen.queryByText('取消')).not.toBeInTheDocument();
    expect(screen.queryByText('确认切换')).not.toBeInTheDocument();
  });
});
