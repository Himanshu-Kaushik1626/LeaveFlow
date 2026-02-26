const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin/Manager
const getUsers = async (req, res) => {
    const { search, role, isActive, department, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (department) query.department = department;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .populate('department', 'name')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), users });
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).populate('department', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, email, role, department, leaveBalance, phone } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (leaveBalance) user.leaveBalance = { ...user.leaveBalance, ...leaveBalance };
    if (phone !== undefined) user.phone = phone;

    await user.save();

    await AuditLog.create({
        action: 'USER_UPDATED',
        performedBy: req.user._id,
        targetUser: user._id,
        details: `Admin updated user ${user.name}. Fields: ${Object.keys(req.body).join(', ')}`,
        ipAddress: req.ip,
    });

    const updated = await User.findById(req.params.id).populate('department', 'name');
    res.json({ success: true, message: 'User updated', user: updated });
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    await AuditLog.create({
        action: 'USER_DELETED',
        performedBy: req.user._id,
        targetUser: user._id,
        details: `Admin deleted user ${user.name}`,
        ipAddress: req.ip,
    });

    res.json({ success: true, message: 'User deleted successfully' });
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-active
// @access  Admin
const toggleActive = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
        action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        performedBy: req.user._id,
        targetUser: user._id,
        details: `User ${user.name} has been ${user.isActive ? 'activated' : 'deactivated'}`,
        ipAddress: req.ip,
    });

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
};

// @desc    Create user (Admin)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
    const { name, email, password, role, department } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({ name, email, password: password || 'Employee@123', role, department });

    await AuditLog.create({
        action: 'USER_CREATED',
        performedBy: req.user._id,
        details: `Admin created user ${name} with role ${role}`,
        ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'User created', user });
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, toggleActive, createUser };
