import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import SkeletonLoader, { CardSkeleton } from '../../components/ui/SkeletonLoader'
import SearchFilter from '../../components/ui/SearchFilter'
import Modal from '../../components/ui/Modal'
import ApplyLeaveForm from './ApplyLeave'
import ReimbursementForm from './ReimbursementForm'
import {
    CalendarClock, CheckCircle2, XCircle, Clock,
    TrendingUp, Plus, XSquare, AlertTriangle,
    ReceiptText, IndianRupee, Wallet
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${bg}`}>
                <Icon size={22} className={color} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value ?? '—'}</p>
            </div>
        </div>
    )
}

const CATEGORY_LABELS = {
    travel: 'Travel', food: 'Food & Meals', accommodation: 'Accommodation',
    equipment: 'Equipment', medical: 'Medical', other: 'Other',
}

export default function EmployeeDashboard() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('leaves')

    // --- Leaves State ---
    const [stats, setStats] = useState(null)
    const [leaves, setLeaves] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [loadingStats, setLoadingStats] = useState(true)
    const [loadingLeaves, setLoadingLeaves] = useState(true)
    const [applyOpen, setApplyOpen] = useState(false)
    const [cancelling, setCancelling] = useState(null)

    // --- Reimbursement State ---
    const [rStats, setRStats] = useState(null)
    const [rList, setRList] = useState([])
    const [rTotal, setRTotal] = useState(0)
    const [rPage, setRPage] = useState(1)
    const [rPages, setRPages] = useState(1)
    const [rStatusFilter, setRStatusFilter] = useState('')
    const [loadingRStats, setLoadingRStats] = useState(true)
    const [loadingR, setLoadingR] = useState(true)
    const [reimbOpen, setReimbOpen] = useState(false)

    // ===== LEAVE FETCHERS =====
    const fetchStats = useCallback(async () => {
        try {
            setLoadingStats(true)
            const { data } = await api.get('/leaves/stats/my')
            setStats(data)
        } finally { setLoadingStats(false) }
    }, [])

    const fetchLeaves = useCallback(async () => {
        try {
            setLoadingLeaves(true)
            const params = { page, limit: 8 }
            if (statusFilter) params.status = statusFilter
            const { data } = await api.get('/leaves/my', { params })
            setLeaves(data.leaves)
            setTotal(data.total)
            setPages(data.pages)
        } finally { setLoadingLeaves(false) }
    }, [page, statusFilter])

    // ===== REIMBURSEMENT FETCHERS =====
    const fetchRStats = useCallback(async () => {
        try {
            setLoadingRStats(true)
            const { data } = await api.get('/reimbursements/stats/my')
            setRStats(data.stats)
        } finally { setLoadingRStats(false) }
    }, [])

    const fetchReimbursements = useCallback(async () => {
        try {
            setLoadingR(true)
            const params = { page: rPage, limit: 8 }
            if (rStatusFilter) params.status = rStatusFilter
            const { data } = await api.get('/reimbursements/my', { params })
            setRList(data.reimbursements)
            setRTotal(data.total)
            setRPages(data.pages)
        } finally { setLoadingR(false) }
    }, [rPage, rStatusFilter])

    useEffect(() => { fetchStats() }, [fetchStats])
    useEffect(() => { fetchLeaves() }, [fetchLeaves])
    useEffect(() => { fetchRStats() }, [fetchRStats])
    useEffect(() => { fetchReimbursements() }, [fetchReimbursements])

    const handleCancel = async (id) => {
        setCancelling(id)
        try {
            await api.put(`/leaves/${id}/cancel`)
            toast.success('Leave cancelled')
            fetchLeaves()
            fetchStats()
        } finally { setCancelling(null) }
    }

    const filteredLeaves = search
        ? leaves.filter(l => l.leaveType.includes(search.toLowerCase()) || l.reason.toLowerCase().includes(search.toLowerCase()))
        : leaves

    const lb = stats?.leaveBalance
    const totalBalance = lb ? lb.annual + lb.sick + lb.casual : 0

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="page-header flex items-center justify-between">
                <div>
                    <h2 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h2>
                    <p className="page-subtitle">Your leave & reimbursement overview</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => activeTab === 'leaves' ? setApplyOpen(true) : setReimbOpen(true)}
                >
                    <Plus size={16} />
                    {activeTab === 'leaves' ? 'Apply Leave' : 'New Request'}
                </button>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('leaves')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'leaves'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    <CalendarClock size={15} /> Leaves
                </button>
                <button
                    onClick={() => setActiveTab('reimbursements')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'reimbursements'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    <ReceiptText size={15} /> Reimbursements
                </button>
            </div>

            {/* ============ LEAVES TAB ============ */}
            {activeTab === 'leaves' && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {loadingStats ? (
                            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                        ) : (
                            <>
                                <StatCard icon={Clock} label="Pending" value={stats?.stats.pending} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/20" />
                                <StatCard icon={CheckCircle2} label="Approved" value={stats?.stats.approved} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/20" />
                                <StatCard icon={XCircle} label="Rejected" value={stats?.stats.rejected} color="text-red-600" bg="bg-red-100 dark:bg-red-900/20" />
                                <StatCard icon={TrendingUp} label="Total Balance" value={totalBalance} color="text-primary-600" bg="bg-primary-100 dark:bg-primary-900/20" />
                            </>
                        )}
                    </div>

                    {/* Balance breakdown */}
                    {!loadingStats && lb && (
                        <div className="card p-4 mb-6">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Leave Balance</p>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                {[['Annual', lb.annual, 20, 'primary'], ['Sick', lb.sick, 10, 'blue'], ['Casual', lb.casual, 7, 'purple']].map(([label, val, max, color]) => (
                                    <div key={label}>
                                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{val}<span className="text-sm text-gray-400">/{max}</span></p>
                                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-${color}-500`}
                                                style={{ width: `${Math.min((val / max) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Leave History */}
                    <div className="card p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Leave History</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{total} records total</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <SearchFilter value={search} onChange={setSearch} placeholder="Search by type or reason...">
                                <select className="select w-auto min-w-[130px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </SearchFilter>
                        </div>

                        {loadingLeaves ? <SkeletonLoader rows={5} cols={5} /> : (
                            <>
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Start Date</th>
                                                <th>End Date</th>
                                                <th>Days</th>
                                                <th>Status</th>
                                                <th>Reviewer Note</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLeaves.length === 0 ? (
                                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No leaves found</td></tr>
                                            ) : filteredLeaves.map((l) => (
                                                <tr key={l._id}>
                                                    <td><span className="capitalize font-medium">{l.leaveType}</span></td>
                                                    <td>{format(new Date(l.startDate), 'MMM dd, yyyy')}</td>
                                                    <td>{format(new Date(l.endDate), 'MMM dd, yyyy')}</td>
                                                    <td><span className="font-semibold">{l.totalDays}d</span></td>
                                                    <td><StatusBadge status={l.status} /></td>
                                                    <td className="max-w-[160px]">
                                                        <span className="text-xs text-gray-500 truncate block">{l.reviewNote || '—'}</span>
                                                    </td>
                                                    <td>
                                                        {l.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleCancel(l._id)}
                                                                disabled={cancelling === l._id}
                                                                className="btn-danger btn-sm"
                                                            >
                                                                {cancelling === l._id ? '...' : <><XSquare size={13} /> Cancel</>}
                                                            </button>
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
                </>
            )}

            {/* ============ REIMBURSEMENTS TAB ============ */}
            {activeTab === 'reimbursements' && (
                <>
                    {/* Reimb Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {loadingRStats ? (
                            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                        ) : (
                            <>
                                <StatCard icon={Clock} label="Pending" value={rStats?.pending} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-900/20" />
                                <StatCard icon={CheckCircle2} label="Approved" value={rStats?.approved} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/20" />
                                <StatCard icon={XCircle} label="Rejected" value={rStats?.rejected} color="text-red-600" bg="bg-red-100 dark:bg-red-900/20" />
                                <StatCard
                                    icon={Wallet}
                                    label="Total Approved"
                                    value={rStats?.approvedAmount != null ? `₹${rStats.approvedAmount.toLocaleString('en-IN')}` : '₹0'}
                                    color="text-primary-600"
                                    bg="bg-primary-100 dark:bg-primary-900/20"
                                />
                            </>
                        )}
                    </div>

                    {/* Pending amount note */}
                    {!loadingRStats && rStats?.pendingAmount > 0 && (
                        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                You have <strong>₹{rStats.pendingAmount.toLocaleString('en-IN')}</strong> in pending reimbursements awaiting review.
                            </p>
                        </div>
                    )}

                    {/* Reimbursement History */}
                    <div className="card p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Reimbursement History</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{rTotal} records total</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <select
                                className="select w-auto min-w-[140px]"
                                value={rStatusFilter}
                                onChange={(e) => { setRStatusFilter(e.target.value); setRPage(1) }}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {loadingR ? <SkeletonLoader rows={5} cols={5} /> : (
                            <>
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Amount</th>
                                                <th>Expense Date</th>
                                                <th>Status</th>
                                                <th>Reviewer Note</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rList.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No reimbursement requests found</td></tr>
                                            ) : rList.map((r) => (
                                                <tr key={r._id}>
                                                    <td>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{r.title}</p>
                                                            {r.receiptUrl && (
                                                                <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">View receipt</a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td><span className="capitalize">{CATEGORY_LABELS[r.category] || r.category}</span></td>
                                                    <td><span className="font-semibold text-gray-900 dark:text-gray-100">₹{r.amount.toLocaleString('en-IN')}</span></td>
                                                    <td>{format(new Date(r.expenseDate), 'MMM dd, yyyy')}</td>
                                                    <td><StatusBadge status={r.status} /></td>
                                                    <td className="max-w-[160px]">
                                                        <span className="text-xs text-gray-500 truncate block">{r.reviewNote || '—'}</span>
                                                    </td>
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

            {/* Apply Leave Modal */}
            <Modal isOpen={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for Leave" size="md">
                <ApplyLeaveForm
                    isModal
                    onSuccess={() => { setApplyOpen(false); fetchLeaves(); fetchStats() }}
                />
            </Modal>

            {/* Submit Reimbursement Modal */}
            <Modal isOpen={reimbOpen} onClose={() => setReimbOpen(false)} title="Submit Reimbursement Request" size="md">
                <ReimbursementForm
                    onSuccess={() => { setReimbOpen(false); fetchReimbursements(); fetchRStats() }}
                />
            </Modal>
        </DashboardLayout>
    )
}
