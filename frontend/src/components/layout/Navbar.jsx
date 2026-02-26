import { Menu, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const roleLabel = { admin: 'Admin Panel', manager: 'Manager Dashboard', employee: 'Employee Portal' }

export default function Navbar({ onMenuClick }) {
    const { isDark, toggle } = useTheme()
    const { user } = useAuth()

    return (
        <header className="h-16 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-4 sticky top-0 z-10">
            {/* Mobile menu */}
            <button onClick={onMenuClick} className="btn-icon btn-secondary lg:hidden">
                <Menu size={20} />
            </button>

            {/* Title */}
            <div className="flex-1">
                <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 hidden sm:block">
                    {roleLabel[user?.role] || 'Dashboard'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="flex items-center gap-2">
                {/* Dark mode toggle */}
                <button onClick={toggle} className="btn-icon btn-secondary" title="Toggle theme">
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notification bell (decorative) */}
                <button className="btn-icon btn-secondary relative">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                </button>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    )
}
