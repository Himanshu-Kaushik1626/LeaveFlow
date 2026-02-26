import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Spinner from '../../components/ui/Spinner'
import { User, Mail, Phone, Building2, Calendar, Lock, Save } from 'lucide-react'
import { format } from 'date-fns'

export default function Profile() {
    const { user, updateUser } = useAuth()
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' })
    const [pwdForm, setPwdForm] = useState({ password: '', confirmPassword: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) { setErrors({ name: 'Name is required' }); return }
        setLoading(true)
        try {
            const { data } = await api.put('/auth/profile', form)
            updateUser(data.user)
            toast.success('Profile updated! ✅')
        } finally { setLoading(false) }
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        if (pwdForm.password.length < 6) { setErrors({ password: 'Min. 6 characters' }); return }
        if (pwdForm.password !== pwdForm.confirmPassword) { setErrors({ confirmPassword: 'Passwords do not match' }); return }
        setLoading(true)
        try {
            await api.put('/auth/profile', { password: pwdForm.password })
            toast.success('Password updated!')
            setPwdForm({ password: '', confirmPassword: '' })
        } finally { setLoading(false) }
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <h2 className="page-title">My Profile</h2>
                <p className="page-subtitle">Manage your account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl">
                {/* Left — Avatar & Info */}
                <div className="card p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{user?.name}</h3>
                    <p className="text-sm text-gray-500 capitalize mt-1">{user?.role}</p>
                    <div className="w-full mt-6 space-y-3 text-left">
                        {[
                            { icon: Mail, label: 'Email', value: user?.email },
                            { icon: Building2, label: 'Department', value: user?.department?.name || 'N/A' },
                            { icon: Calendar, label: 'Joined', value: user?.joinDate ? format(new Date(user.joinDate), 'MMM dd, yyyy') : 'N/A' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <Icon size={15} className="text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400">{label}</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Edit forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile form */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><User size={18} />Personal Information</h3>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="label">Full Name</label>
                                <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} placeholder="Your full name" />
                                {errors.name && <p className="error-text">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="label">Phone Number</label>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input className="input pl-9" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Email <span className="text-gray-400">(read-only)</span></label>
                                <input className="input opacity-60 cursor-not-allowed" value={user?.email} readOnly />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? <Spinner size="sm" /> : <Save size={15} />}
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Password form */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2"><Lock size={18} />Change Password</h3>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="label">New Password</label>
                                <input type="password" className={`input ${errors.password ? 'input-error' : ''}`} value={pwdForm.password} onChange={(e) => setPwdForm({ ...pwdForm, password: e.target.value })} placeholder="Min. 6 characters" />
                                {errors.password && <p className="error-text">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="label">Confirm Password</label>
                                <input type="password" className={`input ${errors.confirmPassword ? 'input-error' : ''}`} value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} placeholder="Re-enter password" />
                                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? <Spinner size="sm" /> : <Lock size={15} />}
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
