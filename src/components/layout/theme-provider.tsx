import { createContext, use, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export const themes = [
  { value: 'original', label: 'Original' },
  { value: 'crank-night', label: 'Crank Night' },
  { value: 'minty', label: 'Minty' },
  { value: 'grape-soda', label: 'Grape Soda' },
  { value: 'tomato', label: 'Tomato' },
] as const

export type Theme = (typeof themes)[number]['value']

const STORAGE_KEY = 'warptv:theme'

/**
 * Runs before first paint so a theme never flashes. Crank Night is the dark scheme and uses
 * the `.dark` class, the others set `data-flavor-scheme`. With nothing saved yet it starts
 * from the OS preference, and the old light/dark values map onto Original and Crank Night.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light')t='original';if(t==='dark')t='crank-night';if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'crank-night':'original';var e=document.documentElement;e.classList.toggle('dark',t==='crank-night');if(t==='crank-night'||t==='original')e.removeAttribute('data-flavor-scheme');else e.setAttribute('data-flavor-scheme',t)}catch(e){}})()`

const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null)

const isTheme = (value: string | null): value is Theme => themes.some((t) => t.value === value)

function storedTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light') return 'original'
  if (saved === 'dark') return 'crank-night'
  if (isTheme(saved)) return saved
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'crank-night' : 'original'
}

function apply(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'crank-night')
  if (theme === 'original' || theme === 'crank-night') root.removeAttribute('data-flavor-scheme')
  else root.setAttribute('data-flavor-scheme', theme)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('original')

  useEffect(() => {
    setThemeState(storedTheme())
  }, [])

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
    apply(next)
  }, [])

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
}

export function useTheme() {
  const context = use(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
