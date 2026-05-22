import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../useTheme'
import ThemeToggle from '../../components/ThemeToggle'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeProvider', () => {
  it('toggles dark mode and persists the preference', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    const toggle = screen.getByRole('button', { name: '夜间模式' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('love-pet-theme')).toBe('dark')
  })

  it('restores dark mode from localStorage', () => {
    localStorage.setItem('love-pet-theme', 'dark')

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: '夜间模式' })).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
