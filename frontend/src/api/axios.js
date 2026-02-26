import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

// Response interceptor — handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong'
        if (error.response?.status === 401) {
            localStorage.removeItem('lms_token')
            window.location.href = '/login'
        } else if (error.response?.status !== 404) {
            toast.error(message)
        }
        return Promise.reject(error)
    }
)

export default api
