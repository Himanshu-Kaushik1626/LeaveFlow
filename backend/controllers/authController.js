const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'employee' });

    await AuditLog.create({
        action: 'USER_REGISTERED',
        performedBy: user._id,
        details: `User ${name} registered with role ${user.role}`,
        ipAddress: req.ip,
    });

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token: generateToken(user._id),
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            leaveBalance: user.leaveBalance,
            isActive: user.isActive,
        },
    });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('department', 'name');

    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
    }

    await AuditLog.create({
        action: 'USER_LOGIN',
        performedBy: user._id,
        details: `User ${user.name} logged in`,
        ipAddress: req.ip,
    });

    res.json({
        success: true,
        message: 'Login successful',
        token: generateToken(user._id),
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            leaveBalance: user.leaveBalance,
            isActive: user.isActive,
            avatar: user.avatar,
            phone: user.phone,
            joinDate: user.joinDate,
        },
    });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).populate('department', 'name');
    res.json({ success: true, user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    const { name, phone, avatar } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    if (req.body.password) {
        user.password = req.body.password;
    }

    await user.save();

    res.json({
        success: true,
        message: 'Profile updated',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            leaveBalance: user.leaveBalance,
            isActive: user.isActive,
            avatar: user.avatar,
            phone: user.phone,
        },
    });
};

module.exports = { register, login, getMe, updateProfile };
