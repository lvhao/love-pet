import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '../../data/store';
import { RoleProvider } from '../../hooks/useRole';
import { CartProvider } from '../../hooks/useCart';
import Chat from '../../pages/Chat';

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/owner/orders/order_1/chat']}>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            <Routes>
              <Route path="/owner/orders/:id/chat" element={<Chat />} />
            </Routes>
          </CartProvider>
        </RoleProvider>
      </StoreProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('Chat', () => {
  it('renders empty state message', () => {
    render(<div />, { wrapper });
    expect(screen.getByText('暂无消息，发送第一条消息吧')).toBeInTheDocument();
  });

  it('renders input field', () => {
    render(<div />, { wrapper });
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('renders camera button', () => {
    render(<div />, { wrapper });
    expect(screen.getByText('暂无消息，发送第一条消息吧')).toBeInTheDocument();
    // Camera button should exist
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders hidden file input for photos', () => {
    render(<div />, { wrapper });
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.accept).toBe('image/*');
  });

  it('sends a text message and displays it', () => {
    render(<div />, { wrapper });
    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.change(input, { target: { value: '你好，请问什么时候到？' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('你好，请问什么时候到？')).toBeInTheDocument();
    expect(screen.queryByText('暂无消息，发送第一条消息吧')).not.toBeInTheDocument();
  });

  it('sends message on Enter key', () => {
    render(<div />, { wrapper });
    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.change(input, { target: { value: '测试消息' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('测试消息')).toBeInTheDocument();
  });

  it('does not send empty message', () => {
    render(<div />, { wrapper });
    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('暂无消息，发送第一条消息吧')).toBeInTheDocument();
  });

  it('clears input after sending', () => {
    render(<div />, { wrapper });
    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('');
  });

  it('persists messages to localStorage', () => {
    render(<div />, { wrapper });
    const input = screen.getByPlaceholderText('输入消息...');
    fireEvent.change(input, { target: { value: '持久化测试' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    const stored = JSON.parse(localStorage.getItem('love-pet-chat-order_1'));
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe('持久化测试');
  });

  it('loads existing messages from localStorage', () => {
    const messages = [
      { id: 'msg-1', sender: 'caretaker', text: '我已到达', timestamp: 1716000000000 },
    ];
    localStorage.setItem('love-pet-chat-order_1', JSON.stringify(messages));
    render(<div />, { wrapper });
    expect(screen.getByText('我已到达')).toBeInTheDocument();
  });

  it('displays image messages', () => {
    const messages = [
      { id: 'msg-1', sender: 'caretaker', text: '[图片]', image: 'data:image/png;base64,abc', timestamp: 1716000000000 },
    ];
    localStorage.setItem('love-pet-chat-order_1', JSON.stringify(messages));
    render(<div />, { wrapper });
    const img = document.querySelector('img[src="data:image/png;base64,abc"]');
    expect(img).toBeInTheDocument();
  });
});