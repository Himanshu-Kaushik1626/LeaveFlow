import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
    const { user } = useAuth()
    const home = user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager' : '/dashboard'

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-center p-6">
            <div>
                <p className="text-9xl font-black text-primary-600 dark:text-primary-500 opacity-20 select-none">404</p>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 -mt-6">Page not found</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">The page you're looking for doesn't exist or you don't have access.</p>
                <Link to={user ? home : '/login'} className="btn-primary">
                    {user ? 'Back to Dashboard' : 'Go to Login'}
                </Link>
            </div>
        </div>
    )
}
