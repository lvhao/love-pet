import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_STORAGE_KEY = 'love-pet-theme'
const ThemeContext = createContext(null)

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context) return context

  return {
    theme: 'light',
    isDark: false,
    toggleTheme: () => {},
  }
}
