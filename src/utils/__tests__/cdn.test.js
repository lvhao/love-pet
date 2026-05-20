import { describe, it, expect } from 'vitest';
import { cdnUrl, assetUrl, CDN_BASE } from '../cdn';

describe('cdnUrl', () => {
  it('returns empty string for falsy path', () => {
    expect(cdnUrl(null)).toBe('');
    expect(cdnUrl(undefined)).toBe('');
    expect(cdnUrl('')).toBe('');
    expect(cdnUrl(0)).toBe('');
  });

  it('returns absolute URL as-is', () => {
    expect(cdnUrl('https://example.com/img.png')).toBe('https://example.com/img.png');
    expect(cdnUrl('http://example.com/img.png')).toBe('http://example.com/img.png');
  });

  it('returns data URI as-is', () => {
    expect(cdnUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });

  it('prepends CDN_BASE for relative paths', () => {
    expect(cdnUrl('/images/cat.png')).toBe(`${CDN_BASE}/images/cat.png`);
    expect(cdnUrl('assets/dog.jpg')).toBe(`${CDN_BASE}assets/dog.jpg`);
  });
});

describe('assetUrl', () => {
  it('returns empty string for falsy path', () => {
    expect(assetUrl(null)).toBe('');
    expect(assetUrl('')).toBe('');
  });

  it('returns absolute URL as-is', () => {
    expect(assetUrl('https://cdn.example.com/img.png')).toBe('https://cdn.example.com/img.png');
  });

  it('returns data URI as-is', () => {
    expect(assetUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });

  it('prepends CDN_BASE for relative paths', () => {
    expect(assetUrl('/images/cat.png')).toBe(`${CDN_BASE}/images/cat.png`);
  });
});
