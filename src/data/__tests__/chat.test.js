import { describe, it, expect, beforeEach } from 'vitest';
import { loadChat, saveChat, addMessage, clearChat } from '../chat';

beforeEach(() => {
  localStorage.clear();
});

describe('chat.js', () => {
  it('loadChat returns empty array when no data exists', () => {
    expect(loadChat('order_1')).toEqual([]);
  });

  it('loadChat returns saved messages', () => {
    const messages = [
      { id: 'msg-1', sender: 'owner', text: '你好', timestamp: 1716000000000 },
    ];
    saveChat('order_1', messages);
    expect(loadChat('order_1')).toEqual(messages);
  });

  it('loadChat handles corrupt data gracefully', () => {
    localStorage.setItem('love-pet-chat-order_1', 'not-json');
    expect(loadChat('order_1')).toEqual([]);
  });

  it('saveChat persists messages to localStorage', () => {
    const messages = [
      { id: 'msg-1', sender: 'owner', text: 'hello', timestamp: 1716000000000 },
    ];
    saveChat('order_2', messages);
    const stored = JSON.parse(localStorage.getItem('love-pet-chat-order_2'));
    expect(stored).toEqual(messages);
  });

  it('addMessage appends a message and returns updated list', () => {
    const updated = addMessage('order_3', { sender: 'owner', text: '请问什么时候到？' });
    expect(updated).toHaveLength(1);
    expect(updated[0].sender).toBe('owner');
    expect(updated[0].text).toBe('请问什么时候到？');
    expect(updated[0].id).toMatch(/^msg-/);
    expect(updated[0].timestamp).toBeTypeOf('number');
    // Verify persisted
    expect(loadChat('order_3')).toEqual(updated);
  });

  it('addMessage appends to existing messages', () => {
    addMessage('order_4', { sender: 'owner', text: '第一条' });
    const updated = addMessage('order_4', { sender: 'caretaker', text: '第二条' });
    expect(updated).toHaveLength(2);
    expect(updated[0].sender).toBe('owner');
    expect(updated[1].sender).toBe('caretaker');
  });

  it('clearChat removes chat data', () => {
    addMessage('order_5', { sender: 'owner', text: 'test' });
    clearChat('order_5');
    expect(loadChat('order_5')).toEqual([]);
    expect(localStorage.getItem('love-pet-chat-order_5')).toBeNull();
  });

  it('messages are isolated per order', () => {
    addMessage('order_a', { sender: 'owner', text: 'msg a' });
    addMessage('order_b', { sender: 'caretaker', text: 'msg b' });
    expect(loadChat('order_a')).toHaveLength(1);
    expect(loadChat('order_b')).toHaveLength(1);
    expect(loadChat('order_a')[0].text).toBe('msg a');
    expect(loadChat('order_b')[0].text).toBe('msg b');
  });
});