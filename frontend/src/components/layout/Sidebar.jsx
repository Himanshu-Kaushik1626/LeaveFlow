import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard, CalendarCheck, UserCircle, LogOut,
    Users, ClipboardList, Building2, FileText, ShieldCheck, ReceiptText
} from 'lucide-react'

const employeeLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/apply-leave', icon: CalendarCheck, label: 'Apply Leave' },
    { to: '/profile', icon: UserCircle, label: 'My Profile' },
]

const managerLinks = [
    { to: '/manager', icon: ClipboardList, label: 'Leave Requests' },
    { to: '/profile', icon: UserCircle, label: 'My Profile' },
]

const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/leaves', icon: CalendarCheck, label: 'Leave Management' },
    { to: '/admin/reimbursements', icon: ReceiptText, label: 'Reimbursements' },
    { to: '/admin/logs', icon: FileText, label: 'Audit Logs' },
]

const roleLinks = { employee: employeeLinks, manager: managerLinks, admin: adminLinks }
const roleColors = {
    admin: 'from-purple-600 to-indigo-600',
    manager: 'from-blue-600 to-cyan-600',
    employee: 'from-primary-600 to-indigo-500',
}

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const links = roleLinks[user?.role] || []

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full z-30 w-64 flex flex-col
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
            >
                {/* Logo */}
                <div className="px-6 py-5 flex-shrink-0">
                    <div className={`inline-flex items-center gap-2.5 bg-gradient-to-r ${roleColors[user?.role]} rounded-xl p-2.5`}>
                        <ShieldCheck size={18} className="text-white" />
                        <span className="text-white font-bold text-sm">LeaveFlow</span>
                    </div>
                </div>

                {/* User card */}
                <div className="mx-4 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColors[user?.role]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    <p className="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                        Navigation
                    </p>
                    {links.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end
                            onClick={onClose}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 flex-shrink-0 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
