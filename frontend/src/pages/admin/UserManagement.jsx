import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api/axios'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import SkeletonLoader from '../../components/ui/SkeletonLoader'
import SearchFilter from '../../components/ui/SearchFilter'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'employee', department: '' }

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [departments, setDepartments] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState({ open: false, mode: 'create', user: null })
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [toggling, setToggling] = useState(null)
    const [deleteModal, setDeleteModal] = useState({ open: false, user: null })

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page, limit: 10, search }
            if (roleFilter) params.role = roleFilter
            const { data } = await api.get('/users', { params })
            setUsers(data.users)
            setTotal(data.total)
            setPages(data.pages)
        } finally { setLoading(false) }
    }, [page, search, roleFilter])

    useEffect(() => { fetchUsers() }, [fetchUsers])
    useEffect(() => {
        api.get('/departments').then(({ data }) => setDepartments(data.departments))
    }, [])

    const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setModal({ open: true, mode: 'create', user: null }) }
    const openEdit = (u) => {
        setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department?._id || '' })
        setErrors({})
        setModal({ open: true, mode: 'edit', user: u })
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name required'
        if (!form.email) e.email = 'Email required'
        if (modal.mode === 'create' && !form.password) e.password = 'Password required'
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setSubmitting(true)
        try {
            if (modal.mode === 'create') {
                await api.post('/users', form)
                toast.success('User created!')
            } else {
                const payload = { ...form }
                if (!payload.password) delete payload.password
                await api.put(`/users/${modal.user._id}`, payload)
                toast.success('User updated!')
            }
            setModal({ open: false, mode: 'create', user: null })
            fetchUsers()
        } finally { setSubmitting(false) }
    }

    const handleToggle = async (u) => {
        setToggling(u._id)
        try {
            const { data } = await api.put(`/users/${u._id}/toggle-active`)
            toast.success(`User ${data.isActive ? 'activated' : 'deactivated'}`)
            fetchUsers()
        } finally { setToggling(null) }
    }

    const handleDelete = async () => {
        try {
            await api.delete(`/users/${deleteModal.user._id}`)
            toast.success('User deleted')
            setDeleteModal({ open: false, user: null })
            fetchUsers()
        } catch { }
    }

    return (
        <DashboardLayout>
            <div className="page-header flex items-center justify-between">
                <div>
                    <h2 className="page-title">User Management</h2>
                    <p className="page-subtitle">{total} users in system</p>
                </div>
                <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add User</button>
            </div>

            <div className="card p-4 sm:p-6">
                <div className="mb-4">
                    <SearchFilter value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search name or email...">
                        <select className="select w-auto min-w-[120px]" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}>
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="employee">Employee</option>
                        </select>
                    </SearchFilter>
                </div>

                {loading ? <SkeletonLoader rows={7} cols={6} /> : (
                    <>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Leave Balance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-10 text-gray-400">No users found</td></tr>
                                    ) : users.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{u.name}</p>
                                                        <p className="text-xs text-gray-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><StatusBadge status={u.role} /></td>
                                            <td className="text-sm">{u.department?.name || <span className="text-gray-400">—</span>}</td>
                                            <td>
                                                <span className="text-xs text-gray-500">
                                                    A:{u.leaveBalance?.annual} S:{u.leaveBalance?.sick} C:{u.leaveBalance?.casual}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${u.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => openEdit(u)} className="btn-icon btn-secondary" title="Edit"><Pencil size={14} /></button>
                                                    <button onClick={() => handleToggle(u)} disabled={toggling === u._id} className="btn-icon btn-secondary" title={u.isActive ? 'Deactivate' : 'Activate'}>
                                                        {toggling === u._id ? <Spinner size="sm" /> : u.isActive ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
                                                    </button>
                                                    <button onClick={() => setDeleteModal({ open: true, user: u })} className="btn-icon btn-secondary text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete"><Trash2 size={14} /></button>
                                                </div>
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

            {/* Create / Edit Modal */}
            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', user: null })} title={`${modal.mode === 'create' ? 'Create' : 'Edit'} User`} size="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Full Name</label>
                            <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                            {errors.name && <p className="error-text">{errors.name}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="label">Email</label>
                            <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
                            {errors.email && <p className="error-text">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="label">Role</label>
                            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Department</label>
                            <select className="select" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                                <option value="">None</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="label">Password {modal.mode === 'edit' && <span className="text-gray-400">(leave blank to keep current)</span>}</label>
                            <input type="password" className={`input ${errors.password ? 'input-error' : ''}`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                            {errors.password && <p className="error-text">{errors.password}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false, mode: 'create', user: null })} className="btn-outline flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1">
                            {submitting ? <><Spinner size="sm" />Saving…</> : modal.mode === 'create' ? 'Create User' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirm */}
            <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, user: null })} title="Delete User" size="sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete <strong>{deleteModal.user?.name}</strong>? This action cannot be undone.</p>
                <div className="flex gap-2">
                    <button onClick={() => setDeleteModal({ open: false, user: null })} className="btn-outline flex-1">Cancel</button>
                    <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
                </div>
            </Modal>
        </DashboardLayout>
    )
}
