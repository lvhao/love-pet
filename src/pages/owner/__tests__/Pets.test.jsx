import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '../../../data/store';
import { RoleProvider } from '../../../hooks/useRole';
import { CartProvider } from '../../../hooks/useCart';
import OwnerPets from '../Pets';

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/owner/pets']}>
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

describe('OwnerPets', () => {
  it('renders existing pets from store', () => {
    render(<OwnerPets />, { wrapper });
    expect(screen.getByText('团子')).toBeInTheDocument();
    expect(screen.getByText('旺财')).toBeInTheDocument();
  });

  it('renders add pet button', () => {
    render(<OwnerPets />, { wrapper });
    const addButtons = screen.getAllByText('添加宠物');
    expect(addButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows pet breed and details', () => {
    render(<OwnerPets />, { wrapper });
    // The breed text is rendered as "英短蓝猫 · 3岁 · 4.5kg"
    expect(screen.getByText(/英短蓝猫/)).toBeInTheDocument();
    expect(screen.getByText(/柯基/)).toBeInTheDocument();
  });

  it('renders vaccine badge text', () => {
    render(<OwnerPets />, { wrapper });
    // The "已免疫" text is inside a div with ShieldCheck SVG
    // Use getAllByText since it appears in both pet cards AND in the form checkbox label
    const badges = screen.getAllByText('已免疫');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
