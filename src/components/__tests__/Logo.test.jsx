import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from '../Logo';

describe('Logo', () => {
  it('renders SVG element', () => {
    render(<Logo />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies md size by default', () => {
    const { container } = render(<Logo />);
    expect(container.firstChild.className).toContain('w-9');
    expect(container.firstChild.className).toContain('h-9');
  });

  it('applies sm size', () => {
    const { container } = render(<Logo size="sm" />);
    expect(container.firstChild.className).toContain('w-7');
    expect(container.firstChild.className).toContain('h-7');
  });

  it('applies lg size', () => {
    const { container } = render(<Logo size="lg" />);
    expect(container.firstChild.className).toContain('w-12');
    expect(container.firstChild.className).toContain('h-12');
  });
});