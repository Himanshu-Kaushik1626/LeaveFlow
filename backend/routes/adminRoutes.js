const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { restrict } = require('../middleware/roleMiddleware');

// @desc    Get audit logs
// @route   GET /api/admin/logs
router.get('/logs', protect, restrict('admin'), async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
        .populate('performedBy', 'name email role')
        .populate('targetUser', 'name email')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), logs });
});

// @desc    Get system overview stats
// @route   GET /api/admin/stats
router.get('/stats', protect, restrict('admin'), async (req, res) => {
    const [totalUsers, totalAdmins, totalManagers, totalEmployees, activeUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'manager' }),
        User.countDocuments({ role: 'employee' }),
        User.countDocuments({ isActive: true }),
    ]);
    res.json({ success: true, stats: { totalUsers, totalAdmins, totalManagers, totalEmployees, activeUsers } });
});

module.exports = router;
