import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api/axios'
import Pagination from '../../components/ui/Pagination'
import SkeletonLoader from '../../components/ui/SkeletonLoader'
import { format } from 'date-fns'
import { Activity } from 'lucide-react'

const ACTION_COLORS = {
    USER_LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    USER_REGISTERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    USER_CREATED: 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
    USER_UPDATED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    USER_DELETED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    USER_ACTIVATED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    USER_DEACTIVATED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    LEAVE_APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    LEAVE_REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    BULK_LEAVE_APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    BULK_LEAVE_REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

export default function AuditLogs() {
    const [logs, setLogs] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/logs', { params: { page, limit: 15 } })
            setLogs(data.logs)
            setTotal(data.total)
            setPages(data.pages)
        } finally { setLoading(false) }
    }, [page])

    useEffect(() => { fetchLogs() }, [fetchLogs])

    return (
        <DashboardLayout>
            <div className="page-header flex items-center gap-3">
                <Activity size={22} className="text-primary-600" />
                <div>
                    <h2 className="page-title">Audit Logs</h2>
                    <p className="page-subtitle">{total} system events recorded</p>
                </div>
            </div>

            <div className="card p-4 sm:p-6">
                {loading ? <SkeletonLoader rows={8} cols={4} /> : (
                    <>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Performed By</th>
                                        <th>Target User</th>
                                        <th>Details</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-10 text-gray-400">No logs found</td></tr>
                                    ) : logs.map((log) => (
                                        <tr key={log._id}>
                                            <td>
                                                <span className={`badge text-xs font-mono ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.performedBy?.name || '—'}</p>
                                                    <p className="text-xs text-gray-400 capitalize">{log.performedBy?.role}</p>
                                                </div>
                                            </td>
                                            <td className="text-sm text-gray-600 dark:text-gray-300">
                                                {log.targetUser?.name || <span className="text-gray-400">—</span>}
                                            </td>
                                            <td>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] block truncate" title={log.details}>
                                                    {log.details}
                                                </span>
                                            </td>
                                            <td className="text-xs text-gray-500">
                                                {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
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
        </DashboardLayout>
    )
}
