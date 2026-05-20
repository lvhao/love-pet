import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Skeleton from '../Skeleton';

describe('Skeleton', () => {
  it('renders base skeleton element', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild;
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('skeleton-shimmer');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild.className).toContain('custom-class');
  });

  it('applies inline styles for width and height', () => {
    const { container } = render(<Skeleton width={100} height={20} />);
    expect(container.firstChild.style.width).toBe('100px');
    expect(container.firstChild.style.height).toBe('20px');
  });

  it('applies md border-radius by default', () => {
    const { container } = render(<Skeleton width={100} height={20} />);
    expect(container.firstChild.style.borderRadius).toBe('8px');
  });

  it('applies full border-radius for circles', () => {
    const { container } = render(<Skeleton width={40} height={40} radius="full" />);
    expect(container.firstChild.style.borderRadius).toBe('9999px');
  });

  it('Skeleton.Text renders', () => {
    const { container } = render(<Skeleton.Text />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild.className).toContain('skeleton-shimmer');
  });

  it('Skeleton.Circle renders with full radius', () => {
    const { container } = render(<Skeleton.Circle size={40} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild.style.borderRadius).toBe('9999px');
    expect(container.firstChild.style.width).toBe('40px');
    expect(container.firstChild.style.height).toBe('40px');
  });

  it('Skeleton.Card renders', () => {
    const { container } = render(<Skeleton.Card />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('Skeleton.OrderRow renders', () => {
    const { container } = render(<Skeleton.OrderRow />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('Skeleton.ProductCard renders', () => {
    const { container } = render(<Skeleton.ProductCard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});