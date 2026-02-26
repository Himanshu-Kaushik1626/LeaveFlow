import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Spinner from '../../components/ui/Spinner'
import { CalendarDays, FileText, AlertCircle } from 'lucide-react'

const LEAVE_TYPES = [
    { value: 'annual', label: 'Annual Leave', desc: 'Planned vacation or personal time' },
    { value: 'sick', label: 'Sick Leave', desc: 'Medical illness or recovery' },
    { value: 'casual', label: 'Casual Leave', desc: 'Short unplanned absences' },
    { value: 'unpaid', label: 'Unpaid Leave', desc: 'Leave without pay' },
    { value: 'maternity', label: 'Maternity Leave', desc: 'For new mothers' },
    { value: 'paternity', label: 'Paternity Leave', desc: 'For new fathers' },
]

export default function ApplyLeave({ isModal = false, onSuccess }) {
    const navigate = useNavigate()
    const today = new Date().toISOString().split('T')[0]

    const [form, setForm] = useState({
        leaveType: 'annual', startDate: today, endDate: today, reason: '', emergency: false,
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const totalDays = form.startDate && form.endDate
        ? Math.ceil(Math.abs(new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1
        : 0

    const set = (field) => (e) => {
        const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm({ ...form, [field]: v })
        setErrors({ ...errors, [field]: '' })
    }

    const validate = () => {
        const e = {}
        if (!form.startDate) e.startDate = 'Start date required'
        if (!form.endDate) e.endDate = 'End date required'
        else if (new Date(form.endDate) < new Date(form.startDate)) e.endDate = 'End date must be after start date'
        if (!form.reason.trim()) e.reason = 'Reason is required'
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            await api.post('/leaves', form)
            toast.success('Leave application submitted! ✅')
            if (onSuccess) onSuccess()
            else navigate('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const content = (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Leave Type */}
            <div>
                <label className="label">Leave Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LEAVE_TYPES.map((lt) => (
                        <button
                            type="button"
                            key={lt.value}
                            onClick={() => setForm({ ...form, leaveType: lt.value })}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${form.leaveType === lt.value
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <p className={`text-xs font-semibold ${form.leaveType === lt.value ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>{lt.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{lt.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label"><CalendarDays size={13} className="inline mr-1" />Start Date</label>
                    <input type="date" className={`input ${errors.startDate ? 'input-error' : ''}`} value={form.startDate} min={today} onChange={set('startDate')} />
                    {errors.startDate && <p className="error-text">{errors.startDate}</p>}
                </div>
                <div>
                    <label className="label"><CalendarDays size={13} className="inline mr-1" />End Date</label>
                    <input type="date" className={`input ${errors.endDate ? 'input-error' : ''}`} value={form.endDate} min={form.startDate || today} onChange={set('endDate')} />
                    {errors.endDate && <p className="error-text">{errors.endDate}</p>}
                </div>
            </div>

            {/* Duration badge */}
            {totalDays > 0 && (
                <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2.5 rounded-lg">
                    <CalendarDays size={16} className="text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                        Duration: <strong>{totalDays} {totalDays === 1 ? 'day' : 'days'}</strong>
                    </span>
                </div>
            )}

            {/* Reason */}
            <div>
                <label className="label"><FileText size={13} className="inline mr-1" />Reason</label>
                <textarea className={`textarea ${errors.reason ? 'input-error' : ''}`} rows={3} placeholder="Describe the purpose of your leave..." value={form.reason} onChange={set('reason')} />
                {errors.reason && <p className="error-text">{errors.reason}</p>}
            </div>

            {/* Emergency */}
            <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary-600" checked={form.emergency} onChange={set('emergency')} />
                <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as Emergency</span>
                    <p className="text-xs text-gray-400">Flagged for urgent attention</p>
                </div>
                {form.emergency && <AlertCircle size={16} className="text-red-500 ml-auto" />}
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <><Spinner size="sm" /> Submitting…</> : 'Submit Application'}
            </button>
        </form>
    )

    if (isModal) return content

    return (
        <DashboardLayout>
            <div className="page-header">
                <h2 className="page-title">Apply for Leave</h2>
                <p className="page-subtitle">Fill in the details for your leave application</p>
            </div>
            <div className="max-w-2xl">
                <div className="card p-6">{content}</div>
            </div>
        </DashboardLayout>
    )
}
