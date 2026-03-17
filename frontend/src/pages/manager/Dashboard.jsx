import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import SkeletonLoader, { CardSkeleton } from '../../components/ui/SkeletonLoader'
import SearchFilter from '../../components/ui/SearchFilter'
import Modal from '../../components/ui/Modal'
import { BarChart } from '../../components/charts/Charts'
import ApplyLeaveForm from '../employee/ApplyLeave'
import ReimbursementForm from '../employee/ReimbursementForm'
import {
    CheckCircle2, XCircle, Clock, Users, Check, X,
    ReceiptText, Wallet, UserCircle, Plus, CalendarClock,
    TrendingUp, XSquare, AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
    travel: 'Travel', food: 'Food & Meals', accommodation: 'Accommodation',
    equipment: 'Equipment', medical: 'Medical', other: 'Other',
}

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${bg}`}><Icon size={20} className={color} /></div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value ?? 0}</p>
            </div>
        </div>
    )
}

export default function ManagerDashboard() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('leaves')

    /* ---- Review Leaves state ---- */
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

    /* ---- Review Reimbursements state ---- */
    const [rList, setRList] = useState([])
    const [rTotal, setRTotal] = useState(0)
    const [rPage, setRPage] = useState(1)
    const [rPages, setRPages] = useState(1)
    const [rSearch, setRSearch] = useState('')
    const [rStatus, setRStatus] = useState('pending')
    const [rStats, setRStats] = useState(null)
    const [loadingR, setLoadingR] = useState(true)
    const [loadingRStats, setLoadingRStats] = useState(true)
    const [rReviewModal, setRReviewModal] = useState({ open: false, item: null, action: '' })
    const [rReviewNote, setRReviewNote] = useState('')
    const [rSubmitting, setRSubmitting] = useState(false)

    /* ---- My Requests state ---- */
    const [myLeaves, setMyLeaves] = useState([])
    const [myLeavesTotal, setMyLeavesTotal] = useState(0)
    const [myLeavesPage, setMyLeavesPage] = useState(1)
    const [myLeavesPages, setMyLeavesPages] = useState(1)
    const [myLeavesLoading, setMyLeavesLoading] = useState(true)
    const [myReimbs, setMyReimbs] = useState([])
    const [myReimbsTotal, setMyReimbsTotal] = useState(0)
    const [myReimbsPage, setMyReimbsPage] = useState(1)
    const [myReimbsPages, setMyReimbsPages] = useState(1)
    const [myReimbsLoading, setMyReimbsLoading] = useState(true)
    const [myStats, setMyStats] = useState(null)
    const [myRStats, setMyRStats] = useState(null)
    const [applyOpen, setApplyOpen] = useState(false)
    const [reimbOpen, setReimbOpen] = useState(false)
    const [mySubTab, setMySubTab] = useState('leaves')

    /* ===== LEAVE REVIEW FETCHERS ===== */
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

    /* ===== REIMBURSEMENT REVIEW FETCHERS ===== */
    const fetchReimbursements = useCallback(async () => {
        setLoadingR(true)
        try {
            const params = { page: rPage, limit: 10, search: rSearch }
            if (rStatus) params.status = rStatus
            const { data } = await api.get('/reimbursements', { params })
            setRList(data.reimbursements)
            setRTotal(data.total)
            setRPages(data.pages)
        } finally { setLoadingR(false) }
    }, [rPage, rStatus, rSearch])

    const fetchRStats = useCallback(async () => {
        setLoadingRStats(true)
        try {
            const { data } = await api.get('/reimbursements/stats/system')
            setRStats(data.stats)
        } finally { setLoadingRStats(false) }
    }, [])

    /* ===== MY REQUESTS FETCHERS ===== */
    const fetchMyLeaves = useCallback(async () => {
        setMyLeavesLoading(true)
        try {
            const { data } = await api.get('/leaves/my', { params: { page: myLeavesPage, limit: 6 } })
            setMyLeaves(data.leaves)
            setMyLeavesTotal(data.total)
            setMyLeavesPages(data.pages)
        } finally { setMyLeavesLoading(false) }
    }, [myLeavesPage])

    const fetchMyReimbs = useCallback(async () => {
        setMyReimbsLoading(true)
        try {
            const { data } = await api.get('/reimbursements/my', { params: { page: myReimbsPage, limit: 6 } })
            setMyReimbs(data.reimbursements)
            setMyReimbsTotal(data.total)
            setMyReimbsPages(data.pages)
        } finally { setMyReimbsLoading(false) }
    }, [myReimbsPage])

    const fetchMyStats = useCallback(async () => {
        try {
            const [s, rs] = await Promise.all([
                api.get('/leaves/stats/my'),
                api.get('/reimbursements/stats/my'),
            ])
            setMyStats(s.data.stats)
            setMyRStats(rs.data.stats)
        } catch { }
    }, [])

    useEffect(() => { fetchLeaves() }, [fetchLeaves])
    useEffect(() => { fetchStats() }, [fetchStats])
    useEffect(() => { fetchReimbursements() }, [fetchReimbursements])
    useEffect(() => { fetchRStats() }, [fetchRStats])
    useEffect(() => { fetchMyLeaves() }, [fetchMyLeaves])
    useEffect(() => { fetchMyReimbs() }, [fetchMyReimbs])
    useEffect(() => { fetchMyStats() }, [fetchMyStats])

    /* ===== HANDLERS ===== */
    const openReview = (leave, action) => { setReviewModal({ open: true, leave, action }); setReviewNote('') }
    const handleReview = async () => {
        setSubmitting(true)
        try {
            await api.put(`/leaves/${reviewModal.leave._id}/status`, { status: reviewModal.action, reviewNote })
            toast.success(`Leave ${reviewModal.action}! ✅`)
            setReviewModal({ open: false, leave: null, action: '' })
            fetchLeaves(); fetchStats()
        } finally { setSubmitting(false) }
    }

    const handleBulk = async (status) => {
        if (!selected.length) { toast.error('Select at least one leave'); return }
        try {
            await api.put('/leaves/bulk-status', { leaveIds: selected, status })
            toast.success(`${selected.length} leaves ${status}`)
            setSelected([]); fetchLeaves(); fetchStats()
        } catch { }
    }

    const openRReview = (item, action) => { setRReviewModal({ open: true, item, action }); setRReviewNote('') }
    const handleRReview = async () => {
        setRSubmitting(true)
        try {
            await api.put(`/reimbursements/${rReviewModal.item._id}/status`, { status: rReviewModal.action, reviewNote: rReviewNote })
            toast.success(`Reimbursement ${rReviewModal.action}! ✅`)
            setRReviewModal({ open: false, item: null, action: '' })
            fetchReimbursements(); fetchRStats()
        } finally { setRSubmitting(false) }
    }

    const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    const toggleAll = () => setSelected(selected.length === leaves.length ? [] : leaves.map(l => l._id))

    const monthlyLabels = systemStats?.monthlyData?.map(m => m.month) || []
    const monthlyValues = systemStats?.monthlyData?.map(m => m.count) || []

    const tabs = [
        { key: 'leaves', label: 'Leave Requests', icon: Users },
        { key: 'reimbursements', label: 'Reimbursements', icon: ReceiptText },
        { key: 'my', label: 'My Requests', icon: UserCircle },
    ]

    return (
        <DashboardLayout>
            <div className="page-header flex items-center justify-between">
                <div>
                    <h2 className="page-title">Management Dashboard</h2>
                    <p className="page-subtitle">Hello, {user?.name?.split(' ')[0]} 👋 — Manage requests or apply for your own</p>
                </div>
                {activeTab === 'my' && (
                    <div className="flex gap-2">
                        <button className="btn-primary btn-sm" onClick={() => setApplyOpen(true)}>
                            <Plus size={14} /> Apply Leave
                        </button>
                        <button className="btn-secondary btn-sm" onClick={() => setReimbOpen(true)}>
                            <Plus size={14} /> Reimbursement
                        </button>
                    </div>
                )}
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === key
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            {/* ========== LEAVE REVIEW TAB ========== */}
            {activeTab === 'leaves' && (
                <>
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
                    {!statsLoading && monthlyLabels.length > 0 && (
                        <div className="card p-6 mb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Leave Trend</h3>
                            <BarChart labels={monthlyLabels} data={monthlyValues} label="Leave Requests" />
                        </div>
                    )}
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
                                        <thead><tr>
                                            <th><input type="checkbox" checked={selected.length === leaves.length && leaves.length > 0} onChange={toggleAll} className="rounded accent-primary-600" /></th>
                                            <th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {leaves.length === 0 ? (
                                                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No leave requests found</td></tr>
                                            ) : leaves.map((l) => (
                                                <tr key={l._id}>
                                                    <td>{l.status === 'pending' && <input type="checkbox" checked={selected.includes(l._id)} onChange={() => toggleSelect(l._id)} className="rounded accent-primary-600" />}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{l.employee?.name?.charAt(0)}</div>
                                                            <div>
                                                                <p className="font-medium text-sm">{l.employee?.name}</p>
                                                                <p className="text-xs text-gray-400">{l.employee?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="capitalize font-medium">{l.leaveType}</span></td>
                                                    <td className="text-xs">{format(new Date(l.startDate), 'MMM dd')} — {format(new Date(l.endDate), 'MMM dd, yyyy')}</td>
                                                    <td><span className="font-semibold">{l.totalDays}d</span></td>
                                                    <td><span className="text-xs text-gray-500 max-w-[120px] block truncate">{l.reason}</span></td>
                                                    <td><StatusBadge status={l.status} /></td>
                                                    <td>{l.status === 'pending' && (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => openReview(l, 'approved')} className="btn-success btn-sm"><Check size={13} /></button>
                                                            <button onClick={() => openReview(l, 'rejected')} className="btn-danger btn-sm"><X size={13} /></button>
                                                        </div>
                                                    )}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination page={page} pages={pages} onPageChange={setPage} />
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ========== REIMBURSEMENT REVIEW TAB ========== */}
            {activeTab === 'reimbursements' && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {loadingRStats ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : (
                            <>
                                {[
                                    { label: 'Total', val: rStats?.total, icon: ReceiptText, bg: 'bg-gray-100 dark:bg-gray-800', color: 'text-gray-600 dark:text-gray-300' },
                                    { label: 'Pending', val: rStats?.pending, icon: Clock, bg: 'bg-amber-100 dark:bg-amber-900/20', color: 'text-amber-600' },
                                    { label: 'Approved', val: rStats?.approved, icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-900/20', color: 'text-emerald-600' },
                                    { label: 'Total Disbursed', val: `₹${(rStats?.totalApprovedAmount || 0).toLocaleString('en-IN')}`, icon: Wallet, bg: 'bg-primary-100 dark:bg-primary-900/20', color: 'text-primary-600' },
                                ].map(({ label, val, icon: Icon, bg, color }) => (
                                    <div key={label} className="stat-card">
                                        <div className={`stat-icon ${bg}`}><Icon size={20} className={color} /></div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{val ?? 0}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="card p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Reimbursement Requests <span className="text-xs text-gray-400 ml-1">({rTotal})</span></h3>
                        </div>
                        <div className="mb-4">
                            <SearchFilter value={rSearch} onChange={(v) => { setRSearch(v); setRPage(1) }} placeholder="Search by employee name...">
                                <select className="select w-auto min-w-[130px]" value={rStatus} onChange={(e) => { setRStatus(e.target.value); setRPage(1) }}>
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </SearchFilter>
                        </div>
                        {loadingR ? <SkeletonLoader rows={6} cols={6} /> : (
                            <>
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead><tr>
                                            <th>Employee</th><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {rList.length === 0 ? (
                                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No reimbursement requests found</td></tr>
                                            ) : rList.map((r) => (
                                                <tr key={r._id}>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{r.employee?.name?.charAt(0)}</div>
                                                            <div>
                                                                <p className="font-medium text-sm">{r.employee?.name}</p>
                                                                <p className="text-xs text-gray-400">{r.employee?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p className="font-medium text-sm">{r.title}</p>
                                                        {r.receiptUrl && <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">View receipt</a>}
                                                    </td>
                                                    <td><span className="capitalize text-sm">{CATEGORY_LABELS[r.category] || r.category}</span></td>
                                                    <td><span className="font-semibold">₹{r.amount.toLocaleString('en-IN')}</span></td>
                                                    <td className="text-xs text-gray-500">{format(new Date(r.expenseDate), 'MMM dd, yyyy')}</td>
                                                    <td><StatusBadge status={r.status} /></td>
                                                    <td>{r.status === 'pending' && (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => openRReview(r, 'approved')} className="btn-success btn-sm"><Check size={13} /></button>
                                                            <button onClick={() => openRReview(r, 'rejected')} className="btn-danger btn-sm"><X size={13} /></button>
                                                        </div>
                                                    )}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination page={rPage} pages={rPages} onPageChange={setRPage} />
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ========== MY REQUESTS TAB ========== */}
            {activeTab === 'my' && (
                <>
                    {/* My Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={Clock} label="Leaves Pending" value={myStats?.pending} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/20" />
                        <StatCard icon={CheckCircle2} label="Leaves Approved" value={myStats?.approved} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/20" />
                        <StatCard icon={ReceiptText} label="Reimb. Pending" value={myRStats?.pending} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/20" />
                        <StatCard
                            icon={Wallet}
                            label="Reimb. Approved"
                            value={myRStats?.approvedAmount != null ? `₹${myRStats.approvedAmount.toLocaleString('en-IN')}` : '₹0'}
                            color="text-primary-600"
                            bg="bg-primary-100 dark:bg-primary-900/20"
                        />
                    </div>

                    {/* Sub-tab bar */}
                    <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                        {[{ key: 'leaves', label: 'My Leaves', icon: CalendarClock }, { key: 'reimbursements', label: 'My Reimbursements', icon: ReceiptText }].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setMySubTab(key)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mySubTab === key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>

                    {/* My Leaves Table */}
                    {mySubTab === 'leaves' && (
                        <div className="card p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Leave History <span className="text-xs text-gray-400 ml-1">({myLeavesTotal})</span></h3>
                                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full font-medium">Reviewed by Admin</p>
                            </div>
                            {myLeavesLoading ? <SkeletonLoader rows={4} cols={5} /> : (
                                <>
                                    <div className="table-wrapper">
                                        <table className="table">
                                            <thead><tr><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th><th>Note</th></tr></thead>
                                            <tbody>
                                                {myLeaves.length === 0 ? (
                                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">No leave requests yet</td></tr>
                                                ) : myLeaves.map((l) => (
                                                    <tr key={l._id}>
                                                        <td><span className="capitalize font-medium">{l.leaveType}</span></td>
                                                        <td>{format(new Date(l.startDate), 'MMM dd, yyyy')}</td>
                                                        <td>{format(new Date(l.endDate), 'MMM dd, yyyy')}</td>
                                                        <td><span className="font-semibold">{l.totalDays}d</span></td>
                                                        <td><StatusBadge status={l.status} /></td>
                                                        <td className="max-w-[160px]"><span className="text-xs text-gray-500 truncate block">{l.reviewNote || '—'}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination page={myLeavesPage} pages={myLeavesPages} onPageChange={setMyLeavesPage} />
                                </>
                            )}
                        </div>
                    )}

                    {/* My Reimbursements Table */}
                    {mySubTab === 'reimbursements' && (
                        <div className="card p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Reimbursements <span className="text-xs text-gray-400 ml-1">({myReimbsTotal})</span></h3>
                                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full font-medium">Reviewed by Admin</p>
                            </div>
                            {myReimbsLoading ? <SkeletonLoader rows={4} cols={5} /> : (
                                <>
                                    <div className="table-wrapper">
                                        <table className="table">
                                            <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th><th>Note</th></tr></thead>
                                            <tbody>
                                                {myReimbs.length === 0 ? (
                                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">No reimbursement requests yet</td></tr>
                                                ) : myReimbs.map((r) => (
                                                    <tr key={r._id}>
                                                        <td><span className="font-medium text-sm">{r.title}</span></td>
                                                        <td><span className="capitalize text-sm">{CATEGORY_LABELS[r.category] || r.category}</span></td>
                                                        <td><span className="font-semibold">₹{r.amount.toLocaleString('en-IN')}</span></td>
                                                        <td>{format(new Date(r.expenseDate), 'MMM dd, yyyy')}</td>
                                                        <td><StatusBadge status={r.status} /></td>
                                                        <td className="max-w-[160px]"><span className="text-xs text-gray-500 truncate block">{r.reviewNote || '—'}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination page={myReimbsPage} pages={myReimbsPages} onPageChange={setMyReimbsPage} />
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ===== Leave Review Modal ===== */}
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
                        <textarea className="textarea" rows={3} placeholder="Add a note..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setReviewModal({ open: false, leave: null, action: '' })} className="btn-outline flex-1">Cancel</button>
                        <button onClick={handleReview} disabled={submitting} className={`flex-1 ${reviewModal.action === 'approved' ? 'btn-success' : 'btn-danger'}`}>
                            {submitting ? '...' : reviewModal.action === 'approved' ? '✓ Approve' : '✗ Reject'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ===== Reimbursement Review Modal ===== */}
            <Modal isOpen={rReviewModal.open} onClose={() => setRReviewModal({ open: false, item: null, action: '' })} title={`${rReviewModal.action === 'approved' ? 'Approve' : 'Reject'} Reimbursement`} size="sm">
                <div className="space-y-4">
                    {rReviewModal.item && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                            <p className="font-medium">{rReviewModal.item.employee?.name}</p>
                            <p className="text-gray-500">{rReviewModal.item.title} · <span className="font-semibold text-gray-700 dark:text-gray-300">₹{rReviewModal.item.amount?.toLocaleString('en-IN')}</span></p>
                        </div>
                    )}
                    <div>
                        <label className="label">Review Note <span className="text-gray-400">(optional)</span></label>
                        <textarea className="textarea" rows={3} placeholder="Add a note..." value={rReviewNote} onChange={(e) => setRReviewNote(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setRReviewModal({ open: false, item: null, action: '' })} className="btn-outline flex-1">Cancel</button>
                        <button onClick={handleRReview} disabled={rSubmitting} className={`flex-1 ${rReviewModal.action === 'approved' ? 'btn-success' : 'btn-danger'}`}>
                            {rSubmitting ? '...' : rReviewModal.action === 'approved' ? '✓ Approve' : '✗ Reject'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ===== Apply Leave Modal (Manager's own) ===== */}
            <Modal isOpen={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for Leave" size="md">
                <ApplyLeaveForm isModal onSuccess={() => { setApplyOpen(false); fetchMyLeaves(); fetchMyStats() }} />
            </Modal>

            {/* ===== Submit Reimbursement Modal (Manager's own) ===== */}
            <Modal isOpen={reimbOpen} onClose={() => setReimbOpen(false)} title="Submit Reimbursement Request" size="md">
                <ReimbursementForm onSuccess={() => { setReimbOpen(false); fetchMyReimbs(); fetchMyStats() }} />
            </Modal>
        </DashboardLayout>
    )
}
