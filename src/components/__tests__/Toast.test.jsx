import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider, useStore } from '../../data/store';
import ToastContainer from '../Toast';

function wrapper({ children }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe('ToastContainer', () => {
  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders toast messages', () => {
    function TestComponent() {
      const { addToast } = useStore();
      return (
        <div>
          <button onClick={() => addToast('Hello', 'info')}>add</button>
          <ToastContainer />
        </div>
      );
    }
    render(<TestComponent />, { wrapper });
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders success toast with check icon', () => {
    function TestComponent() {
      const { addToast } = useStore();
      return (
        <div>
          <button onClick={() => addToast('Success!', 'success')}>add</button>
          <ToastContainer />
        </div>
      );
    }
    render(<TestComponent />, { wrapper });
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders error toast with X icon', () => {
    function TestComponent() {
      const { addToast } = useStore();
      return (
        <div>
          <button onClick={() => addToast('Error!', 'error')}>add</button>
          <ToastContainer />
        </div>
      );
    }
    render(<TestComponent />, { wrapper });
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('removes toast on click', () => {
    vi.useFakeTimers();
    function TestComponent() {
      const { addToast } = useStore();
      return (
        <div>
          <button onClick={() => addToast('Click me', 'info')}>add</button>
          <ToastContainer />
        </div>
      );
    }
    render(<TestComponent />, { wrapper });
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByText('Click me')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Click me'));
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});