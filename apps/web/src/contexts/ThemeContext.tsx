import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'claro' | 'escuro' | 'automatico'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme) {
  const dark = theme === 'escuro' || (theme === 'automatico' && getSystemDark())
  document.documentElement.classList.toggle('dark', dark)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('chua_theme') as Theme) || 'claro'
  })

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('chua_theme', t)
    applyTheme(t)
  }

  useEffect(() => {
    applyTheme(theme)
    if (theme === 'automatico') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('automatico')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}
