import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders known status label', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('待接单')).toBeInTheDocument();
  });

  it('renders all known statuses', () => {
    const statuses = ['pending', 'accepted', 'in_progress', 'streaming', 'completed', 'cancelled'];
    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(/./)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders raw status string for unknown status', () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText('unknown_status')).toBeInTheDocument();
  });

  it('applies color styling', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const span = container.querySelector('span');
    // jsdom converts hex to rgb
    expect(span.style.color).toBe('rgb(245, 166, 35)');
  });

  it('falls back to pending color for unknown status', () => {
    const { container } = render(<StatusBadge status="xyz" />);
    const span = container.querySelector('span');
    expect(span.style.color).toBe('rgb(245, 166, 35)');
  });
});