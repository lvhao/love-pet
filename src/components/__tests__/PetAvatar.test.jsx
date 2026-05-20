import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PetAvatar from '../PetAvatar';

describe('PetAvatar', () => {
  it('renders cat type by default', () => {
    const { container } = render(<PetAvatar />);
    expect(container.firstChild.className).toContain('bg-cat-50');
  });

  it('renders dog type', () => {
    const { container } = render(<PetAvatar type="dog" />);
    expect(container.firstChild.className).toContain('bg-dog-50');
  });

  it('renders bird type', () => {
    const { container } = render(<PetAvatar type="bird" />);
    expect(container.firstChild.className).toContain('bg-grooming-50');
  });

  it('renders fish type', () => {
    const { container } = render(<PetAvatar type="fish" />);
    expect(container.firstChild.className).toContain('bg-primary-50');
  });

  it('falls back to PawPrint for unknown type', () => {
    const { container } = render(<PetAvatar type="rabbit" />);
    // Falls back to cat colors
    expect(container.firstChild.className).toContain('bg-cat-50');
  });

  it('applies md size by default', () => {
    const { container } = render(<PetAvatar />);
    expect(container.firstChild.className).toContain('w-10');
    expect(container.firstChild.className).toContain('h-10');
  });

  it('applies sm size', () => {
    const { container } = render(<PetAvatar size="sm" />);
    expect(container.firstChild.className).toContain('w-8');
    expect(container.firstChild.className).toContain('h-8');
  });

  it('applies lg size', () => {
    const { container } = render(<PetAvatar size="lg" />);
    expect(container.firstChild.className).toContain('w-14');
    expect(container.firstChild.className).toContain('h-14');
  });
});