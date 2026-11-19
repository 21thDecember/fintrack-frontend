import { ref, onMounted } from 'vue'

export function useTheme() {
  const isDark = ref(false)

  const applyTheme = (dark: boolean) => {
    isDark.value = dark
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  const toggleDark = () => {
    applyTheme(!isDark.value)
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      applyTheme(saved === 'dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme(true)
    }
  })

  return {
    isDark,
    toggleDark
  }
}
