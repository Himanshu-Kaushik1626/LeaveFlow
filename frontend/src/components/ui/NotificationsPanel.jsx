import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck, CalendarClock, ReceiptText, X, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'

const STORAGE_KEY = 'lms_read_notifications'
function getReadIds() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function saveReadIds(ids) { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) }

/* ── Build notifications based on role ─────────────────── */
function buildManagerAdminNotifs(leaves, reimbursements) {
    const notifs = []
    leaves.forEach((l) => notifs.push({
        id: `leave-${l._id}`,
        type: 'leave',
        icon: CalendarClock,
        color: 'text-amber-500',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        title: `Leave request from ${l.employee?.name}`,
        body: `${l.totalDays}d ${l.leaveType} · ${format(new Date(l.startDate), 'MMM dd')} – ${format(new Date(l.endDate), 'MMM dd, yyyy')}`,
        time: new Date(l.createdAt),
    }))
    reimbursements.forEach((r) => notifs.push({
        id: `reimb-${r._id}`,
        type: 'reimbursement',
        icon: ReceiptText,
        color: 'text-primary-500',
        bg: 'bg-primary-100 dark:bg-primary-900/30',
        title: `Reimbursement from ${r.employee?.name}`,
        body: `"${r.title}" · ₹${r.amount?.toLocaleString('en-IN')}`,
        time: new Date(r.createdAt),
    }))
    return notifs.sort((a, b) => b.time - a.time)
}

function buildEmployeeNotifs(leaves, reimbursements) {
    const notifs = []
    leaves
        .filter((l) => ['approved', 'rejected'].includes(l.status))
        .forEach((l) => notifs.push({
            id: `my-leave-${l._id}`,
            type: l.status,
            icon: l.status === 'approved' ? CheckCircle2 : XCircle,
            color: l.status === 'approved' ? 'text-emerald-500' : 'text-red-500',
            bg: l.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30',
            title: `Leave ${l.status}`,
            body: `${l.totalDays}d ${l.leaveType} · ${format(new Date(l.startDate), 'MMM dd')} – ${format(new Date(l.endDate), 'MMM dd, yyyy')}${l.reviewNote ? ` · "${l.reviewNote}"` : ''}`,
            time: new Date(l.updatedAt || l.createdAt),
        }))
    reimbursements
        .filter((r) => ['approved', 'rejected'].includes(r.status))
        .forEach((r) => notifs.push({
            id: `my-reimb-${r._id}`,
            type: r.status,
            icon: r.status === 'approved' ? CheckCircle2 : XCircle,
            color: r.status === 'approved' ? 'text-emerald-500' : 'text-red-500',
            bg: r.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30',
            title: `Reimbursement ${r.status}`,
            body: `"${r.title}" · ₹${r.amount?.toLocaleString('en-IN')}${r.reviewNote ? ` · "${r.reviewNote}"` : ''}`,
            time: new Date(r.updatedAt || r.createdAt),
        }))
    return notifs.sort((a, b) => b.time - a.time)
}

export default function NotificationsPanel() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [readIds, setReadIds] = useState(getReadIds)
    const [loading, setLoading] = useState(false)
    const panelRef = useRef(null)

    const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin'
    const isEmployee = user?.role === 'employee'

    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        try {
            if (isManagerOrAdmin) {
                const [leavesRes, reimbRes] = await Promise.all([
                    api.get('/leaves', { params: { status: 'pending', limit: 20 } }),
                    api.get('/reimbursements', { params: { status: 'pending', limit: 20 } }),
                ])
                setNotifications(buildManagerAdminNotifs(
                    leavesRes.data.leaves || [],
                    reimbRes.data.reimbursements || []
                ))
            } else if (isEmployee) {
                const [leavesRes, reimbRes] = await Promise.all([
                    api.get('/leaves/my', { params: { limit: 20 } }),
                    api.get('/reimbursements/my', { params: { limit: 20 } }),
                ])
                setNotifications(buildEmployeeNotifs(
                    leavesRes.data.leaves || [],
                    reimbRes.data.reimbursements || []
                ))
            }
        } catch { /* silently fail */ }
        finally { setLoading(false) }
    }, [isManagerOrAdmin, isEmployee])

    useEffect(() => { if (open) fetchNotifications() }, [open, fetchNotifications])

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length

    const markAsRead = (id) => {
        const updated = [...new Set([...readIds, id])]
        setReadIds(updated)
        saveReadIds(updated)
    }

    const markAllRead = () => {
        const allIds = [...new Set([...readIds, ...notifications.map((n) => n.id)])]
        setReadIds(allIds)
        saveReadIds(allIds)
    }

    const emptyMessage = isEmployee
        ? 'No resolved requests yet.'
        : 'No pending requests right now.'

    const emptySubtext = isEmployee
        ? 'Approved/rejected leaves & reimbursements will appear here.'
        : 'All caught up! 🎉'

    const panelTitle = isEmployee ? 'My Updates' : 'Pending Requests'

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="btn-icon btn-secondary relative"
                title="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Bell size={15} className="text-gray-500 dark:text-gray-400" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{panelTitle}</span>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                >
                                    <CheckCheck size={12} /> Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 px-4 text-center">
                                <Bell size={32} className="mb-3 opacity-25" />
                                <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                                <p className="text-xs mt-1">{emptySubtext}</p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((n) => {
                                    const isRead = readIds.includes(n.id)
                                    const Icon = n.icon
                                    return (
                                        <li
                                            key={n.id}
                                            className={`group flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors ${isRead
                                                    ? 'opacity-55 bg-white dark:bg-gray-900'
                                                    : 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${n.bg}`}>
                                                <Icon size={16} className={n.color} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-medium leading-tight ${isRead ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                                                        {n.title}
                                                    </p>
                                                    {!isRead && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                                                <div className="flex items-center justify-between mt-1.5">
                                                    <span className="text-[11px] text-gray-400">{format(n.time, 'MMM dd · hh:mm a')}</span>
                                                    {!isRead && (
                                                        <button
                                                            onClick={() => markAsRead(n.id)}
                                                            className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                            <p className="text-xs text-center text-gray-400">
                                {isEmployee ? `${notifications.length} update${notifications.length !== 1 ? 's' : ''}` : `${notifications.length} pending request${notifications.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
