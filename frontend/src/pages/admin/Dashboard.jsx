import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api/axios'
import { CardSkeleton } from '../../components/ui/SkeletonLoader'
import { BarChart, PieChart } from '../../components/charts/Charts'
import { Users, UserCheck, ShieldCheck, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
    const [userStats, setUserStats] = useState(null)
    const [leaveStats, setLeaveStats] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetch = useCallback(async () => {
        try {
            const [u, l] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/leaves/stats/system'),
            ])
            setUserStats(u.data.stats)
            setLeaveStats(l.data.stats)
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetch() }, [fetch])

    const monthlyLabels = leaveStats?.monthlyData?.map(m => m.month) || []
    const monthlyValues = leaveStats?.monthlyData?.map(m => m.count) || []
    const byTypeLabels = leaveStats?.byType?.map(t => t._id) || []
    const byTypeValues = leaveStats?.byType?.map(t => t.count) || []

    const statCards = userStats ? [
        { label: 'Total Users', val: userStats.totalUsers, icon: Users, bg: 'bg-primary-100 dark:bg-primary-900/20', color: 'text-primary-600' },
        { label: 'Active Users', val: userStats.activeUsers, icon: UserCheck, bg: 'bg-emerald-100 dark:bg-emerald-900/20', color: 'text-emerald-600' },
        { label: 'Managers', val: userStats.totalManagers, icon: TrendingUp, bg: 'bg-blue-100 dark:bg-blue-900/20', color: 'text-blue-600' },
        { label: 'Admins', val: userStats.totalAdmins, icon: ShieldCheck, bg: 'bg-purple-100 dark:bg-purple-900/20', color: 'text-purple-600' },
    ] : []

    const leaveCards = leaveStats ? [
        { label: 'Total Leaves', val: leaveStats.totalLeaves, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800' },
        { label: 'Pending', val: leaveStats.pending, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
        { label: 'Approved', val: leaveStats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        { label: 'Rejected', val: leaveStats.rejected, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10' },
    ] : []

    return (
        <DashboardLayout>
            <div className="page-header">
                <h2 className="page-title">Admin Dashboard</h2>
                <p className="page-subtitle">System overview and analytics</p>
            </div>

            {/* User stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {loading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) :
                    statCards.map(({ label, val, icon: Icon, bg, color }) => (
                        <div key={label} className="stat-card">
                            <div className={`stat-icon ${bg}`}><Icon size={20} className={color} /></div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{val}</p>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Leave stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {loading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) :
                    leaveCards.map(({ label, val, bg, color }) => (
                        <div key={label} className={`card p-4 flex items-center gap-3 ${bg}`}>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                <p className={`text-2xl font-bold ${color}`}>{val}</p>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Leave Trend</h3>
                    {!loading && <BarChart labels={monthlyLabels} data={monthlyValues} />}
                </div>
                <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Leave Type Breakdown</h3>
                    {!loading && byTypeLabels.length > 0 && <PieChart labels={byTypeLabels} data={byTypeValues} />}
                    {!loading && byTypeLabels.length === 0 && <p className="text-center text-gray-400 py-16 text-sm">No leave data yet</p>}
                </div>
            </div>
        </DashboardLayout>
    )
}
