const Reimbursement = require('../models/Reimbursement');
const AuditLog = require('../models/AuditLog');

// @desc    Submit a reimbursement request
// @route   POST /api/reimbursements
// @access  Employee
const submitReimbursement = async (req, res) => {
    const { title, amount, category, expenseDate, description, receiptUrl } = req.body;

    if (!title || !amount || !category || !expenseDate) {
        return res.status(400).json({ success: false, message: 'Title, amount, category and expense date are required' });
    }

    if (Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const reimbursement = await Reimbursement.create({
        employee: req.user._id,
        title,
        amount: Number(amount),
        category,
        expenseDate: new Date(expenseDate),
        description: description || '',
        receiptUrl: receiptUrl || '',
    });

    await reimbursement.populate('employee', 'name email department');
    res.status(201).json({ success: true, message: 'Reimbursement request submitted', reimbursement });
};

// @desc    Get my reimbursements (paginated)
// @route   GET /api/reimbursements/my
// @access  Employee
const getMyReimbursements = async (req, res) => {
    const { status, page = 1, limit = 8 } = req.query;
    const query = { employee: req.user._id };
    if (status) query.status = status;

    const total = await Reimbursement.countDocuments(query);
    const reimbursements = await Reimbursement.find(query)
        .populate('reviewedBy', 'name')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), reimbursements });
};

// @desc    Get my reimbursement stats
// @route   GET /api/reimbursements/stats/my
// @access  Employee
const getMyReimbursementStats = async (req, res) => {
    const [pending, approved, rejected] = await Promise.all([
        Reimbursement.countDocuments({ employee: req.user._id, status: 'pending' }),
        Reimbursement.countDocuments({ employee: req.user._id, status: 'approved' }),
        Reimbursement.countDocuments({ employee: req.user._id, status: 'rejected' }),
    ]);

    const approvedAmountAgg = await Reimbursement.aggregate([
        { $match: { employee: req.user._id, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const approvedAmount = approvedAmountAgg[0]?.total || 0;

    const pendingAmountAgg = await Reimbursement.aggregate([
        { $match: { employee: req.user._id, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingAmount = pendingAmountAgg[0]?.total || 0;

    res.json({ success: true, stats: { pending, approved, rejected, approvedAmount, pendingAmount } });
};

// @desc    Get all reimbursements (Manager/Admin)
// @route   GET /api/reimbursements
// @access  Manager/Admin
const getAllReimbursements = async (req, res) => {
    const { status, page = 1, limit = 10, search } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Reimbursement.countDocuments(query);
    let reimbursements = await Reimbursement.find(query)
        .populate('employee', 'name email department avatar')
        .populate('reviewedBy', 'name')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    if (search) {
        reimbursements = reimbursements.filter((r) =>
            r.employee && r.employee.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Aggregate total approved amount
    const approvedAmountAgg = await Reimbursement.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalApprovedAmount = approvedAmountAgg[0]?.total || 0;

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), reimbursements, totalApprovedAmount });
};

// @desc    Get system-wide reimbursement stats
// @route   GET /api/reimbursements/stats/system
// @access  Manager/Admin
const getSystemReimbursementStats = async (req, res) => {
    const [total, pending, approved, rejected] = await Promise.all([
        Reimbursement.countDocuments(),
        Reimbursement.countDocuments({ status: 'pending' }),
        Reimbursement.countDocuments({ status: 'approved' }),
        Reimbursement.countDocuments({ status: 'rejected' }),
    ]);

    const approvedAmountAgg = await Reimbursement.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalApprovedAmount = approvedAmountAgg[0]?.total || 0;

    res.json({ success: true, stats: { total, pending, approved, rejected, totalApprovedAmount } });
};

// @desc    Approve or reject a reimbursement
// @route   PUT /api/reimbursements/:id/status
// @access  Manager/Admin
const updateReimbursementStatus = async (req, res) => {
    const { status, reviewNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const reimbursement = await Reimbursement.findById(req.params.id).populate('employee');
    if (!reimbursement) return res.status(404).json({ success: false, message: 'Reimbursement not found' });
    if (reimbursement.status !== 'pending') {
        return res.status(400).json({ success: false, message: `Reimbursement is already ${reimbursement.status}` });
    }

    reimbursement.status = status;
    reimbursement.reviewedBy = req.user._id;
    reimbursement.reviewNote = reviewNote || '';
    reimbursement.reviewedAt = new Date();
    await reimbursement.save();

    await AuditLog.create({
        action: `REIMBURSEMENT_${status.toUpperCase()}`,
        performedBy: req.user._id,
        targetUser: reimbursement.employee._id,
        details: `${status} reimbursement "${reimbursement.title}" (₹${reimbursement.amount}) for ${reimbursement.employee.name}. Note: ${reviewNote || 'None'}`,
        ipAddress: req.ip,
    });

    await reimbursement.populate('reviewedBy', 'name');
    res.json({ success: true, message: `Reimbursement ${status} successfully`, reimbursement });
};

module.exports = {
    submitReimbursement,
    getMyReimbursements,
    getMyReimbursementStats,
    getAllReimbursements,
    getSystemReimbursementStats,
    updateReimbursementStatus,
};
