import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api/axios'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import SkeletonLoader, { CardSkeleton } from '../../components/ui/SkeletonLoader'
import SearchFilter from '../../components/ui/SearchFilter'
import Modal from '../../components/ui/Modal'
import { BarChart } from '../../components/charts/Charts'
import { CheckCircle2, XCircle, Clock, Users, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ManagerDashboard() {
    const [leaves, setLeaves] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('pending')
    const [systemStats, setSystemStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [statsLoading, setStatsLoading] = useState(true)
    const [reviewModal, setReviewModal] = useState({ open: false, leave: null, action: '' })
    const [reviewNote, setReviewNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [selected, setSelected] = useState([])

    const fetchLeaves = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page, limit: 10, search }
            if (statusFilter) params.status = statusFilter
            const { data } = await api.get('/leaves', { params })
            setLeaves(data.leaves)
            setTotal(data.total)
            setPages(data.pages)
        } finally { setLoading(false) }
    }, [page, statusFilter, search])

    const fetchStats = useCallback(async () => {
        setStatsLoading(true)
        try {
            const { data } = await api.get('/leaves/stats/system')
            setSystemStats(data.stats)
        } finally { setStatsLoading(false) }
    }, [])

    useEffect(() => { fetchLeaves() }, [fetchLeaves])
    useEffect(() => { fetchStats() }, [fetchStats])

    const openReview = (leave, action) => {
        setReviewModal({ open: true, leave, action })
        setReviewNote('')
    }

    const handleReview = async () => {
        setSubmitting(true)
        try {
            await api.put(`/leaves/${reviewModal.leave._id}/status`, { status: reviewModal.action, reviewNote })
            toast.success(`Leave ${reviewModal.action}! ✅`)
            setReviewModal({ open: false, leave: null, action: '' })
            fetchLeaves()
            fetchStats()
        } finally { setSubmitting(false) }
    }

    const handleBulk = async (status) => {
        if (!selected.length) { toast.error('Select at least one leave'); return }
        try {
            await api.put('/leaves/bulk-status', { leaveIds: selected, status })
            toast.success(`${selected.length} leaves ${status}`)
            setSelected([])
            fetchLeaves()
            fetchStats()
        } catch { }
    }

    const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    const toggleAll = () => setSelected(selected.length === leaves.length ? [] : leaves.map(l => l._id))

    const monthlyLabels = systemStats?.monthlyData?.map(m => m.month) || []
    const monthlyValues = systemStats?.monthlyData?.map(m => m.count) || []

    return (
        <DashboardLayout>
            <div className="page-header">
                <h2 className="page-title">Leave Management</h2>
                <p className="page-subtitle">Review and action employee leave requests</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsLoading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : (
                    <>
                        {[
                            { label: 'Total Requests', val: systemStats?.totalLeaves, icon: Users, bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-600 dark:text-gray-300' },
                            { label: 'Pending', val: systemStats?.pending, icon: Clock, bg: 'bg-amber-100 dark:bg-amber-900/20', color: 'text-amber-600' },
                            { label: 'Approved', val: systemStats?.approved, icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-900/20', color: 'text-emerald-600' },
                            { label: 'Rejected', val: systemStats?.rejected, icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/20', color: 'text-red-600' },
                        ].map(({ label, val, icon: Icon, bg, color }) => (
                            <div key={label} className="stat-card">
                                <div className={`stat-icon ${bg}`}><Icon size={20} className={color} /></div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{val ?? 0}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Monthly chart */}
            {!statsLoading && monthlyLabels.length > 0 && (
                <div className="card p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Leave Trend</h3>
                    <BarChart labels={monthlyLabels} data={monthlyValues} label="Leave Requests" />
                </div>
            )}

            {/* Table */}
            <div className="card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Leave Requests <span className="text-xs text-gray-400 ml-1">({total})</span></h3>
                    {selected.length > 0 && (
                        <div className="flex gap-2">
                            <button onClick={() => handleBulk('approved')} className="btn-success btn-sm"><Check size={13} /> Approve ({selected.length})</button>
                            <button onClick={() => handleBulk('rejected')} className="btn-danger btn-sm"><X size={13} /> Reject ({selected.length})</button>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <SearchFilter value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by employee name...">
                        <select className="select w-auto min-w-[130px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </SearchFilter>
                </div>

                {loading ? <SkeletonLoader rows={6} cols={6} /> : (
                    <>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th><input type="checkbox" checked={selected.length === leaves.length && leaves.length > 0} onChange={toggleAll} className="rounded accent-primary-600" /></th>
                                        <th>Employee</th>
                                        <th>Type</th>
                                        <th>Dates</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-10 text-gray-400">No leave requests found</td></tr>
                                    ) : leaves.map((l) => (
                                        <tr key={l._id}>
                                            <td>
                                                {l.status === 'pending' && (
                                                    <input type="checkbox" checked={selected.includes(l._id)} onChange={() => toggleSelect(l._id)} className="rounded accent-primary-600" />
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {l.employee?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{l.employee?.name}</p>
                                                        <p className="text-xs text-gray-400">{l.employee?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="capitalize font-medium">{l.leaveType}</span></td>
                                            <td className="text-xs">
                                                {format(new Date(l.startDate), 'MMM dd')} — {format(new Date(l.endDate), 'MMM dd, yyyy')}
                                            </td>
                                            <td><span className="font-semibold">{l.totalDays}d</span></td>
                                            <td><span className="text-xs text-gray-500 max-w-[120px] block truncate">{l.reason}</span></td>
                                            <td><StatusBadge status={l.status} /></td>
                                            <td>
                                                {l.status === 'pending' && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => openReview(l, 'approved')} className="btn-success btn-sm"><Check size={13} /></button>
                                                        <button onClick={() => openReview(l, 'rejected')} className="btn-danger btn-sm"><X size={13} /></button>
                                                    </div>
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
            <Modal isOpen={reviewModal.open} onClose={() => setReviewModal({ open: false, leave: null, action: '' })} title={`${reviewModal.action === 'approved' ? 'Approve' : 'Reject'} Leave Request`} size="sm">
                <div className="space-y-4">
                    {reviewModal.leave && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                            <p className="font-medium">{reviewModal.leave.employee?.name}</p>
                            <p className="text-gray-500 capitalize">{reviewModal.leave.leaveType} · {reviewModal.leave.totalDays} days</p>
                        </div>
                    )}
                    <div>
                        <label className="label">Review Note <span className="text-gray-400">(optional)</span></label>
                        <textarea className="textarea" rows={3} placeholder="Add a note for the employee..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setReviewModal({ open: false, leave: null, action: '' })} className="btn-outline flex-1">Cancel</button>
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
