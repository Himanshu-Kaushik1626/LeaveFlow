import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Receipt, IndianRupee } from 'lucide-react'

const CATEGORIES = [
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food & Meals' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'medical', label: 'Medical' },
    { value: 'other', label: 'Other' },
]

export default function ReimbursementForm({ onSuccess }) {
    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: '',
        expenseDate: '',
        description: '',
        receiptUrl: '',
    })
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title || !form.amount || !form.category || !form.expenseDate) {
            toast.error('Please fill in all required fields')
            return
        }
        if (Number(form.amount) <= 0) {
            toast.error('Amount must be greater than 0')
            return
        }
        setSubmitting(true)
        try {
            await api.post('/reimbursements', form)
            toast.success('Reimbursement request submitted! ✅')
            onSuccess?.()
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Submission failed')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label className="label">Title <span className="text-red-500">*</span></label>
                <input
                    className="input"
                    name="title"
                    placeholder="e.g. Client dinner – Feb 2026"
                    value={form.title}
                    onChange={handleChange}
                />
            </div>

            {/* Amount + Category side by side */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="label">Amount (₹) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="input pl-8"
                            type="number"
                            min="0.01"
                            step="0.01"
                            name="amount"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div>
                    <label className="label">Category <span className="text-red-500">*</span></label>
                    <select className="select" name="category" value={form.category} onChange={handleChange}>
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expense Date */}
            <div>
                <label className="label">Expense Date <span className="text-red-500">*</span></label>
                <input
                    className="input"
                    type="date"
                    name="expenseDate"
                    max={new Date().toISOString().split('T')[0]}
                    value={form.expenseDate}
                    onChange={handleChange}
                />
            </div>

            {/* Description */}
            <div>
                <label className="label">Description <span className="text-gray-400">(optional)</span></label>
                <textarea
                    className="textarea"
                    name="description"
                    rows={3}
                    placeholder="Provide details about the expense..."
                    value={form.description}
                    onChange={handleChange}
                />
            </div>

            {/* Receipt URL */}
            <div>
                <label className="label">
                    <Receipt size={13} className="inline mr-1" />
                    Receipt URL <span className="text-gray-400">(optional)</span>
                </label>
                <input
                    className="input"
                    name="receiptUrl"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={form.receiptUrl}
                    onChange={handleChange}
                />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Reimbursement Request'}
            </button>
        </form>
    )
}
