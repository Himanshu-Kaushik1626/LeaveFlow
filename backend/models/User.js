const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['employee', 'manager', 'admin'],
            default: 'employee',
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        leaveBalance: {
            annual: { type: Number, default: 20 },
            sick: { type: Number, default: 10 },
            casual: { type: Number, default: 7 },
        },
        avatar: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            default: '',
        },
        joinDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
