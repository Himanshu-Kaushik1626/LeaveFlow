const statusClasses = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    cancelled: 'badge-cancelled',
    admin: 'badge-admin',
    manager: 'badge-manager',
    employee: 'badge-employee',
}

const dots = {
    pending: 'bg-amber-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
    cancelled: 'bg-gray-400',
}

export default function StatusBadge({ status }) {
    return (
        <span className={statusClasses[status] || 'badge bg-gray-100 text-gray-600'}>
            {dots[status] && <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />}
            {status}
        </span>
    )
}
