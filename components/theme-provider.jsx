'use client'

import * as React from 'react'

const ThemeContext = React.createContext({
  theme: 'light',
  setTheme: () => {},
})

export function ThemeProvider({ children, ...props }) {
  const [theme, setTheme] = React.useState('light')

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}