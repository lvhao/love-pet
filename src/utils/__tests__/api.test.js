import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiError, API_BASE, TIMEOUT_MS } from '../api';

describe('ApiError', () => {
  it('creates an error with message, status, and data', () => {
    const err = new ApiError('test error', 400, { detail: 'bad' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('test error');
    expect(err.status).toBe(400);
    expect(err.data).toEqual({ detail: 'bad' });
  });

  it('defaults data to null when not provided', () => {
    const err = new ApiError('fail', 500);
    expect(err.data).toBeUndefined();
  });
});

describe('api constants', () => {
  it('API_BASE defaults to /api', () => {
    expect(API_BASE).toBe('/api');
  });

  it('TIMEOUT_MS defaults to 10000', () => {
    expect(TIMEOUT_MS).toBe(10000);
  });
});

describe('api request', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = '';
  });

  it('api.get makes GET request', async () => {
    const mockJson = { data: 'test' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJson),
    });

    const result = await api.get('/users');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockJson);
  });

  it('api.post sends body as JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.post('/orders', { name: 'test' });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    );
  });

  it('api.put sends PUT request with body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.put('/orders/1', { status: 'done' });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'done' }),
      })
    );
  });

  it('api.delete sends DELETE request without body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.delete('/orders/1');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'DELETE', body: null })
    );
  });

  it('does not stringify null body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.get('/test');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: null })
    );
  });

  it('adds CSRF token header when meta tag exists', async () => {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'csrf-value-123';
    document.head.appendChild(meta);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.get('/test');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-CSRF-Token': 'csrf-value-123' }),
      })
    );
  });

  it('does not add CSRF header when meta tag is absent', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.get('/test');
    const call = fetch.mock.calls[0][1];
    expect(call.headers).not.toHaveProperty('X-CSRF-Token');
  });

  it('throws ApiError on non-ok response with server message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ message: '参数错误' }),
    });

    await expect(api.post('/test', {})).rejects.toThrow(ApiError);
    await expect(api.post('/test', {})).rejects.toMatchObject({
      message: '参数错误',
      status: 422,
    });
  });

  it('throws ApiError with status code when server message is missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    await expect(api.get('/test')).rejects.toMatchObject({
      message: '请求失败 (500)',
      status: 500,
    });
  });

  it('handles non-JSON error response body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(api.get('/test')).rejects.toMatchObject({
      message: '请求失败 (502)',
      status: 502,
      data: null,
    });
  });

  it('throws timeout ApiError on AbortError', async () => {
    const abortErr = new DOMException('The operation was aborted', 'AbortError');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(abortErr);

    await expect(api.get('/test')).rejects.toMatchObject({
      message: '请求超时，请检查网络后重试',
      status: 0,
      data: null,
    });
  });

  it('throws network ApiError on generic fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.get('/test')).rejects.toMatchObject({
      message: '网络异常，请检查网络连接',
      status: 0,
      data: null,
    });
  });

  it('re-throws ApiError as-is', async () => {
    const apiErr = new ApiError('custom', 418, null);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(apiErr);

    await expect(api.get('/test')).rejects.toBe(apiErr);
  });

  it('sends credentials: same-origin', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api.get('/test');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'same-origin' })
    );
  });
});
