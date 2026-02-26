const Leave = require('../models/Leave');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Employee
const applyLeave = async (req, res) => {
    const { leaveType, startDate, endDate, reason, emergency } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
        return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const totalDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check balance for non-unpaid leave
    const user = await User.findById(req.user._id);
    if (['annual', 'sick', 'casual'].includes(leaveType)) {
        if (user.leaveBalance[leaveType] < totalDays) {
            return res.status(400).json({ success: false, message: `Insufficient ${leaveType} leave balance` });
        }
    }

    const leave = await Leave.create({
        employee: req.user._id,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        emergency: emergency || false,
    });

    await leave.populate('employee', 'name email department');

    res.status(201).json({ success: true, message: 'Leave application submitted', leave });
};

// @desc    Get my leaves
// @route   GET /api/leaves/my
// @access  Employee
const getMyLeaves = async (req, res) => {
    const { status, leaveType, page = 1, limit = 10 } = req.query;
    const query = { employee: req.user._id };

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
        .populate('reviewedBy', 'name')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), leaves });
};

// @desc    Get all leaves (Manager/Admin)
// @route   GET /api/leaves
// @access  Manager/Admin
const getAllLeaves = async (req, res) => {
    const { status, leaveType, employee, startDate, endDate, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (employee) query.employee = employee;
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };

    const total = await Leave.countDocuments(query);
    let leaves = await Leave.find(query)
        .populate('employee', 'name email department avatar')
        .populate('reviewedBy', 'name')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    // Search by employee name after population
    if (search) {
        leaves = leaves.filter((l) =>
            l.employee && l.employee.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), leaves });
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id/status
// @access  Manager/Admin
const updateLeaveStatus = async (req, res) => {
    const { status, reviewNote } = req.body;
    const leave = await Leave.findById(req.params.id).populate('employee');

    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.status !== 'pending') {
        return res.status(400).json({ success: false, message: `Leave is already ${leave.status}` });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';
    leave.reviewedAt = new Date();
    await leave.save();

    // Deduct balance if approved
    if (status === 'approved' && ['annual', 'sick', 'casual'].includes(leave.leaveType)) {
        await User.findByIdAndUpdate(leave.employee._id, {
            $inc: { [`leaveBalance.${leave.leaveType}`]: -leave.totalDays },
        });
    }

    await AuditLog.create({
        action: `LEAVE_${status.toUpperCase()}`,
        performedBy: req.user._id,
        targetUser: leave.employee._id,
        targetLeave: leave._id,
        details: `${status} leave for ${leave.employee.name}. Note: ${reviewNote || 'None'}`,
        ipAddress: req.ip,
    });

    await leave.populate('reviewedBy', 'name');
    res.json({ success: true, message: `Leave ${status} successfully`, leave });
};

// @desc    Cancel leave
// @route   PUT /api/leaves/:id/cancel
// @access  Employee
const cancelLeave = async (req, res) => {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.employee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (leave.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Only pending leaves can be cancelled' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({ success: true, message: 'Leave cancelled', leave });
};

// @desc    Get leave stats for current user
// @route   GET /api/leaves/stats/my
// @access  Employee
const getMyStats = async (req, res) => {
    const [pending, approved, rejected, cancelled] = await Promise.all([
        Leave.countDocuments({ employee: req.user._id, status: 'pending' }),
        Leave.countDocuments({ employee: req.user._id, status: 'approved' }),
        Leave.countDocuments({ employee: req.user._id, status: 'rejected' }),
        Leave.countDocuments({ employee: req.user._id, status: 'cancelled' }),
    ]);

    const user = await User.findById(req.user._id);

    res.json({
        success: true,
        stats: { pending, approved, rejected, cancelled },
        leaveBalance: user.leaveBalance,
    });
};

// @desc    Get system-wide stats
// @route   GET /api/leaves/stats/system
// @access  Admin/Manager
const getSystemStats = async (req, res) => {
    const [totalLeaves, pending, approved, rejected] = await Promise.all([
        Leave.countDocuments(),
        Leave.countDocuments({ status: 'pending' }),
        Leave.countDocuments({ status: 'approved' }),
        Leave.countDocuments({ status: 'rejected' }),
    ]);

    // Monthly leave counts for last 6 months
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const count = await Leave.countDocuments({ createdAt: { $gte: start, $lte: end } });
        monthlyData.push({
            month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
            count,
        });
    }

    // By type
    const byType = await Leave.aggregate([
        { $group: { _id: '$leaveType', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, stats: { totalLeaves, pending, approved, rejected, monthlyData, byType } });
};

// @desc    Bulk update leave status
// @route   PUT /api/leaves/bulk-status
// @access  Manager/Admin
const bulkUpdateStatus = async (req, res) => {
    const { leaveIds, status, reviewNote } = req.body;
    if (!leaveIds || !leaveIds.length) {
        return res.status(400).json({ success: false, message: 'No leave IDs provided' });
    }

    await Leave.updateMany(
        { _id: { $in: leaveIds }, status: 'pending' },
        { status, reviewedBy: req.user._id, reviewNote: reviewNote || '', reviewedAt: new Date() }
    );

    await AuditLog.create({
        action: `BULK_LEAVE_${status.toUpperCase()}`,
        performedBy: req.user._id,
        details: `Bulk ${status} for ${leaveIds.length} leaves`,
        ipAddress: req.ip,
    });

    res.json({ success: true, message: `${leaveIds.length} leaves ${status} successfully` });
};

module.exports = {
    applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, cancelLeave,
    getMyStats, getSystemStats, bulkUpdateStatus,
};
