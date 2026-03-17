import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api/axios'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import SkeletonLoader, { CardSkeleton } from '../../components/ui/SkeletonLoader'
import SearchFilter from '../../components/ui/SearchFilter'
import Modal from '../../components/ui/Modal'
import { CheckCircle2, XCircle, Clock, ReceiptText, Wallet, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
    travel: 'Travel', food: 'Food & Meals', accommodation: 'Accommodation',
    equipment: 'Equipment', medical: 'Medical', other: 'Other',
}

export default function AdminReimbursements() {
    const [list, setList] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(true)
    const [reviewModal, setReviewModal] = useState({ open: false, item: null, action: '' })
    const [reviewNote, setReviewNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [totalApproved, setTotalApproved] = useState(0)

    const fetchList = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page, limit: 10, search }
            if (statusFilter) params.status = statusFilter
            const { data } = await api.get('/reimbursements', { params })
            setList(data.reimbursements)
            setTotal(data.total)
            setPages(data.pages)
            setTotalApproved(data.totalApprovedAmount || 0)
        } finally { setLoading(false) }
    }, [page, statusFilter, search])

    const fetchStats = useCallback(async () => {
        setStatsLoading(true)
        try {
            const { data } = await api.get('/reimbursements/stats/system')
            setStats(data.stats)
        } finally { setStatsLoading(false) }
    }, [])

    useEffect(() => { fetchList() }, [fetchList])
    useEffect(() => { fetchStats() }, [fetchStats])

    const openReview = (item, action) => { setReviewModal({ open: true, item, action }); setReviewNote('') }

    const handleReview = async () => {
        setSubmitting(true)
        try {
            await api.put(`/reimbursements/${reviewModal.item._id}/status`, { status: reviewModal.action, reviewNote })
            toast.success(`Reimbursement ${reviewModal.action}! ✅`)
            setReviewModal({ open: false, item: null, action: '' })
            fetchList(); fetchStats()
        } finally { setSubmitting(false) }
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Reimbursements</h2>
                    <p className="page-subtitle">Manage all employee reimbursement requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsLoading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : (
                    <>
                        {[
                            { label: 'Total Requests', val: stats?.total, icon: ReceiptText, bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-600 dark:text-gray-300' },
                            { label: 'Pending', val: stats?.pending, icon: Clock, bg: 'bg-amber-100 dark:bg-amber-900/20', color: 'text-amber-600' },
                            { label: 'Approved', val: stats?.approved, icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-900/20', color: 'text-emerald-600' },
                            {
                                label: 'Total Disbursed',
                                val: `₹${(stats?.totalApprovedAmount || 0).toLocaleString('en-IN')}`,
                                icon: Wallet,
                                bg: 'bg-primary-100 dark:bg-primary-900/20',
                                color: 'text-primary-600',
                            },
                        ].map(({ label, val, icon: Icon, bg, color }) => (
                            <div key={label} className="stat-card">
                                <div className={`stat-icon ${bg}`}><Icon size={20} className={color} /></div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{val ?? 0}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Table */}
            <div className="card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        All Requests <span className="text-xs text-gray-400 ml-1">({total})</span>
                    </h3>
                </div>

                <div className="mb-4">
                    <SearchFilter value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by employee name...">
                        <select className="select w-auto min-w-[130px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </SearchFilter>
                </div>

                {loading ? <SkeletonLoader rows={6} cols={7} /> : (
                    <>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                        <th>Expense Date</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-10 text-gray-400">No reimbursement requests found</td></tr>
                                    ) : list.map((r) => (
                                        <tr key={r._id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {r.employee?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{r.employee?.name}</p>
                                                        <p className="text-xs text-gray-400">{r.employee?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{r.title}</p>
                                                {r.receiptUrl && (
                                                    <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">View receipt</a>
                                                )}
                                            </td>
                                            <td><span className="capitalize text-sm">{CATEGORY_LABELS[r.category] || r.category}</span></td>
                                            <td><span className="font-semibold text-gray-900 dark:text-gray-100">₹{r.amount.toLocaleString('en-IN')}</span></td>
                                            <td className="text-xs text-gray-500">{format(new Date(r.expenseDate), 'MMM dd, yyyy')}</td>
                                            <td className="max-w-[140px]">
                                                <span className="text-xs text-gray-500 truncate block">{r.description || '—'}</span>
                                            </td>
                                            <td><StatusBadge status={r.status} /></td>
                                            <td>
                                                {r.status === 'pending' && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => openReview(r, 'approved')} className="btn-success btn-sm"><Check size={13} /></button>
                                                        <button onClick={() => openReview(r, 'rejected')} className="btn-danger btn-sm"><X size={13} /></button>
                                                    </div>
                                                )}
                                                {r.status !== 'pending' && (
                                                    <span className="text-xs text-gray-400">{r.reviewNote || '—'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination page={page} pages={pages} onPageChange={setPage} />
                    </>
                )}
            </div>

            {/* Review Modal */}
            <Modal
                isOpen={reviewModal.open}
                onClose={() => setReviewModal({ open: false, item: null, action: '' })}
                title={`${reviewModal.action === 'approved' ? 'Approve' : 'Reject'} Reimbursement`}
                size="sm"
            >
                <div className="space-y-4">
                    {reviewModal.item && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                            <p className="font-medium">{reviewModal.item.employee?.name}</p>
                            <p className="text-gray-500">
                                {reviewModal.item.title} ·{' '}
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    ₹{reviewModal.item.amount?.toLocaleString('en-IN')}
                                </span>
                            </p>
                        </div>
                    )}
                    <div>
                        <label className="label">Review Note <span className="text-gray-400">(optional)</span></label>
                        <textarea className="textarea" rows={3} placeholder="Add a note for the employee..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setReviewModal({ open: false, item: null, action: '' })} className="btn-outline flex-1">Cancel</button>
                        <button
                            onClick={handleReview}
                            disabled={submitting}
                            className={`flex-1 ${reviewModal.action === 'approved' ? 'btn-success' : 'btn-danger'}`}
                        >
                            {submitting ? '...' : reviewModal.action === 'approved' ? '✓ Approve' : '✗ Reject'}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    )
}
