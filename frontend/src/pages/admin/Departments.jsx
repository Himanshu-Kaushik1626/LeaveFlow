import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api/axios'
import SkeletonLoader from '../../components/ui/SkeletonLoader'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Departments() {
    const [departments, setDepartments] = useState([])
    const [managers, setManagers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState({ open: false, mode: 'create', dept: null })
    const [form, setForm] = useState({ name: '', description: '', manager: '' })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [deleteModal, setDeleteModal] = useState({ open: false, dept: null })

    const fetchDepts = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/departments')
            setDepartments(data.departments)
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchDepts() }, [fetchDepts])
    useEffect(() => {
        api.get('/users', { params: { role: 'manager', limit: 50 } }).then(({ data }) => setManagers(data.users))
    }, [])

    const openCreate = () => { setForm({ name: '', description: '', manager: '' }); setErrors({}); setModal({ open: true, mode: 'create', dept: null }) }
    const openEdit = (d) => { setForm({ name: d.name, description: d.description || '', manager: d.manager?._id || '' }); setErrors({}); setModal({ open: true, mode: 'edit', dept: d }) }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) { setErrors({ name: 'Department name required' }); return }
        setSubmitting(true)
        try {
            if (modal.mode === 'create') {
                await api.post('/departments', form)
                toast.success('Department created!')
            } else {
                await api.put(`/departments/${modal.dept._id}`, form)
                toast.success('Department updated!')
            }
            setModal({ open: false, mode: 'create', dept: null })
            fetchDepts()
        } finally { setSubmitting(false) }
    }

    const handleDelete = async () => {
        try {
            await api.delete(`/departments/${deleteModal.dept._id}`)
            toast.success('Department deleted')
            setDeleteModal({ open: false, dept: null })
            fetchDepts()
        } catch { }
    }

    return (
        <DashboardLayout>
            <div className="page-header flex items-center justify-between">
                <div>
                    <h2 className="page-title">Departments</h2>
                    <p className="page-subtitle">Manage organizational departments</p>
                </div>
                <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Department</button>
            </div>

            {loading ? <SkeletonLoader rows={4} cols={3} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.length === 0 ? (
                        <div className="col-span-3 card p-12 text-center text-gray-400">
                            <Building2 size={40} className="mx-auto mb-3 opacity-40" />
                            <p>No departments yet. Create one!</p>
                        </div>
                    ) : departments.map((d) => (
                        <div key={d._id} className="card-hover p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                        <Building2 size={18} className="text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{d.name}</h3>
                                        {d.manager && <p className="text-xs text-gray-400 mt-0.5">Mgr: {d.manager.name}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(d)} className="btn-icon btn-secondary"><Pencil size={14} /></button>
                                    <button onClick={() => setDeleteModal({ open: true, dept: d })} className="btn-icon btn-secondary text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            {d.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{d.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', dept: null })} title={`${modal.mode === 'create' ? 'New' : 'Edit'} Department`} size="sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Name</label>
                        <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Engineering" />
                        {errors.name && <p className="error-text">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea className="textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this department do?" />
                    </div>
                    <div>
                        <label className="label">Manager <span className="text-gray-400">(optional)</span></label>
                        <select className="select" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}>
                            <option value="">No manager assigned</option>
                            {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setModal({ open: false, mode: 'create', dept: null })} className="btn-outline flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1">
                            {submitting ? <><Spinner size="sm" />Saving…</> : modal.mode === 'create' ? 'Create' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirm */}
            <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, dept: null })} title="Delete Department" size="sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Delete <strong>{deleteModal.dept?.name}</strong>? This cannot be undone.</p>
                <div className="flex gap-2">
                    <button onClick={() => setDeleteModal({ open: false, dept: null })} className="btn-outline flex-1">Cancel</button>
                    <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
                </div>
            </Modal>
        </DashboardLayout>
    )
}
