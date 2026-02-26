import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react'
import Spinner from '../../components/ui/Spinner'

const DEMO_CREDENTIALS = [
    { role: 'Admin', email: 'admin@company.com', password: 'Admin@123', color: 'purple' },
    { role: 'Manager', email: 'manager@company.com', password: 'Manager@123', color: 'blue' },
    { role: 'Employee', email: 'alice@company.com', password: 'Employee@123', color: 'emerald' },
]

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', password: '' })
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validate = () => {
        const e = {}
        if (!form.email) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
        if (!form.password) e.password = 'Password is required'
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            const user = await login(form.email, form.password)
            if (user.role === 'admin') navigate('/admin')
            else if (user.role === 'manager') navigate('/manager')
            else navigate('/dashboard')
        } catch {
            // handled by axios interceptor
        } finally {
            setLoading(false)
        }
    }

    const fillDemo = (cred) => setForm({ email: cred.email, password: cred.password })

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 items-center justify-center p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

                <div className="relative z-10 text-white text-center">
                    <div className="inline-flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3 mb-8">
                        <ShieldCheck size={28} className="text-white" />
                        <span className="font-bold text-xl">LeaveFlow</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 leading-tight">
                        Manage Leave<br />Seamlessly
                    </h2>
                    <p className="text-primary-200 text-lg max-w-sm">
                        A modern HR leave management platform for employees, managers, and administrators.
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                        {[['Employees', '2,400+'], ['Leaves Managed', '18,000+'], ['Companies', '150+']].map(([label, val]) => (
                            <div key={label} className="bg-white/10 rounded-xl p-4">
                                <p className="text-2xl font-bold">{val}</p>
                                <p className="text-xs text-primary-200 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="bg-primary-600 rounded-xl p-2">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl text-gray-900 dark:text-gray-100">LeaveFlow</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your account to continue</p>
                    </div>

                    {/* Demo credentials */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quick Demo Login</p>
                        <div className="flex gap-2 flex-wrap">
                            {DEMO_CREDENTIALS.map((c) => (
                                <button
                                    key={c.role}
                                    onClick={() => fillDemo(c)}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border
                    ${c.color === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' :
                                            c.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                        }`}
                                >
                                    {c.role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label className="label">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="you@company.com"
                                    value={form.email}
                                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <p className="error-text">{errors.email}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="label mb-0">Password</label>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }}
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="error-text">{errors.password}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                            {loading ? <><Spinner size="sm" /><span>Signing in…</span></> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
