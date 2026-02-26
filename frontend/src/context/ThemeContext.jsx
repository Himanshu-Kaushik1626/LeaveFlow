import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('lms_theme')
        return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('lms_theme', isDark ? 'dark' : 'light')
    }, [isDark])

    const toggle = () => setIsDark((d) => !d)

    return (
        <ThemeContext.Provider value={{ isDark, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}
