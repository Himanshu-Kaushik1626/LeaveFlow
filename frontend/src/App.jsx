import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import EmployeeDashboard from './pages/employee/Dashboard'
import ApplyLeave from './pages/employee/ApplyLeave'
import Profile from './pages/employee/Profile'
import ManagerDashboard from './pages/manager/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import AuditLogs from './pages/admin/AuditLogs'
import Departments from './pages/admin/Departments'
import NotFound from './pages/NotFound'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import Spinner from './components/ui/Spinner'

export default function App() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: { borderRadius: '12px', fontSize: '14px' },
                    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
            />
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Employee */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<RoleRoute roles={['employee']} />}>
                        <Route path="/dashboard" element={<EmployeeDashboard />} />
                        <Route path="/apply-leave" element={<ApplyLeave />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>

                    {/* Manager */}
                    <Route element={<RoleRoute roles={['manager']} />}>
                        <Route path="/manager" element={<ManagerDashboard />} />
                    </Route>

                    {/* Admin */}
                    <Route element={<RoleRoute roles={['admin']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/admin/logs" element={<AuditLogs />} />
                        <Route path="/admin/departments" element={<Departments />} />
                    </Route>
                </Route>

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}
