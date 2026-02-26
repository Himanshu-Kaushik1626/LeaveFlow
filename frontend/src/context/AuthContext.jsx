import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('lms_token'))
    const [loading, setLoading] = useState(true)

    // Attach token to axios if exists
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            fetchMe()
        } else {
            setLoading(false)
        }
    }, [token])

    const fetchMe = async () => {
        try {
            const { data } = await api.get('/auth/me')
            setUser(data.user)
        } catch {
            logout()
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('lms_token', data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setToken(data.token)
        setUser(data.user)
        toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`)
        return data.user
    }

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData)
        localStorage.setItem('lms_token', data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setToken(data.token)
        setUser(data.user)
        toast.success('Account created successfully! 🎉')
        return data.user
    }

    const logout = useCallback(() => {
        localStorage.removeItem('lms_token')
        delete api.defaults.headers.common['Authorization']
        setToken(null)
        setUser(null)
    }, [])

    const updateUser = (updated) => setUser((prev) => ({ ...prev, ...updated }))

    const value = { user, token, loading, login, register, logout, updateUser }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
