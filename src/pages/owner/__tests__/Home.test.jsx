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

  it('does not render duplicate booking hero CTA', () => {
    render(<OwnerHome />, { wrapper });
    expect(screen.queryByText('给团子预约上门护理')).not.toBeInTheDocument();
    expect(screen.queryByText('立即下单')).not.toBeInTheDocument();
  });

  it('renders a brand trust card without binding to one pet', () => {
    render(<OwnerHome />, { wrapper });
    expect(screen.getByText('宠管家上门护理')).toBeInTheDocument();
    expect(screen.getByText('上门放心，过程看得见')).toBeInTheDocument();
    expect(screen.getByText('护理师身份核验，按流程服务，完成后留下图文记录。')).toBeInTheDocument();
    expect(screen.getByText('身份核验')).toBeInTheDocument();
    expect(screen.getByText('过程追踪')).toBeInTheDocument();
    expect(screen.getByText('图文记录')).toBeInTheDocument();
  });

  it('renders service types after loading', async () => {
    render(<OwnerHome />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('选择上门服务')).toBeInTheDocument();
      expect(screen.getByText('先选服务，下一步确认宠物、地址和上门时间')).toBeInTheDocument();
      expect(screen.getByText('上门喂养')).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(screen.getByText('喂养+遛狗')).toBeInTheDocument();
    expect(screen.getByText('喂养+洗护')).toBeInTheDocument();
  });

  it('renders order progress section', async () => {
    render(<OwnerHome />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('订单进度')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
