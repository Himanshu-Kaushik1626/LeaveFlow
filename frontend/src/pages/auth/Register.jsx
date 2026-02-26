import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck } from 'lucide-react'
import Spinner from '../../components/ui/Spinner'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'employee' })
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.email) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 6) e.password = 'Minimum 6 characters'
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
        return e
    }

    const set = (field) => (e) => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }) }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role })
            if (user.role === 'admin') navigate('/admin')
            else if (user.role === 'manager') navigate('/manager')
            else navigate('/dashboard')
        } catch {
            // handled by axios interceptor
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-primary-600 rounded-2xl px-4 py-2.5 mb-4">
                        <ShieldCheck size={22} className="text-white" />
                        <span className="text-white font-bold text-lg">LeaveFlow</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Join your team on LeaveFlow</p>
                </div>

                <div className="card p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Name */}
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" className={`input pl-9 ${errors.name ? 'input-error' : ''}`} placeholder="John Doe" value={form.name} onChange={set('name')} />
                            </div>
                            {errors.name && <p className="error-text">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="label">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" className={`input pl-9 ${errors.email ? 'input-error' : ''}`} placeholder="you@company.com" value={form.email} onChange={set('email')} />
                            </div>
                            {errors.email && <p className="error-text">{errors.email}</p>}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="label">Role</label>
                            <select className="select" value={form.role} onChange={set('role')}>
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={showPwd ? 'text' : 'password'} className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="error-text">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="label">Confirm Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type={showPwd ? 'text' : 'password'} className={`input pl-9 ${errors.confirmPassword ? 'input-error' : ''}`} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} />
                            </div>
                            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
                            {loading ? <><Spinner size="sm" /><span>Creating account…</span></> : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
