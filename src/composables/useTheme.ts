import { ref } from 'vue'

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('theme')
  if (saved !== null) {
    return saved === 'dark'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitialTheme())

const applyTheme = (dark: boolean) => {
  isDark.value = dark
  if (typeof document !== 'undefined') {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }
}

// Apply initial theme immediately
if (typeof window !== 'undefined') {
  applyTheme(isDark.value)
}

export function useTheme() {
  const toggleDark = () => {
    applyTheme(!isDark.value)
  }

  return {
    isDark,
    toggleDark
  }
}
