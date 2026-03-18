import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  toggleMode: () => void
}

const getInitialMode = (): ThemeMode => {
  const stored = localStorage.getItem('theme-mode')
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getInitialMode(),
  toggleMode: () =>
    set((state) => {
      const next = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme-mode', next)
      return { mode: next }
    }),
}))
