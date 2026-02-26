import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRoute({ roles }) {
    const { user } = useAuth()

    if (!user) return <Navigate to="/login" replace />
    if (!roles.includes(user.role)) {
        // Redirect based on actual role
        if (user.role === 'admin') return <Navigate to="/admin" replace />
        if (user.role === 'manager') return <Navigate to="/manager" replace />
        return <Navigate to="/dashboard" replace />
    }
    return <Outlet />
}
