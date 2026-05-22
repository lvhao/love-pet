import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebRTC } from '../useWebRTC';

describe('useWebRTC', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useWebRTC('room1'));
    expect(result.current.localStream).toBeNull();
    expect(result.current.remoteStream).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.wsStatus).toBe('disconnected');
    expect(result.current.cameraError).toBeNull();
  });

  it('stop resets state to defaults', () => {
    const { result } = renderHook(() => useWebRTC('room1'));
    act(() => {
      result.current.stop();
    });
    expect(result.current.localStream).toBeNull();
    expect(result.current.remoteStream).toBeNull();
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.wsStatus).toBe('disconnected');
    expect(result.current.cameraError).toBeNull();
  });

  it('exposes startBroadcast, joinStream, flipCamera, stop functions', () => {
    const { result } = renderHook(() => useWebRTC('room1'));
    expect(typeof result.current.startBroadcast).toBe('function');
    expect(typeof result.current.joinStream).toBe('function');
    expect(typeof result.current.flipCamera).toBe('function');
    expect(typeof result.current.stop).toBe('function');
  });
});
