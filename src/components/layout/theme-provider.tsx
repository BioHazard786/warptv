import { createContext, use, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'warptv:theme'

/**
 * Runs before first paint so a dark theme never flashes light. With nothing saved yet it
 * starts from the OS preference, after that the toggle decides.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null)

const systemTheme = (): Theme => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme((localStorage.getItem(STORAGE_KEY) as Theme | null) ?? systemTheme())
  }, [])

  const toggleTheme = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
    apply(next)
  }, [])

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
}

export function useTheme() {
  const context = use(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
