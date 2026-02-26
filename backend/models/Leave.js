const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        leaveType: {
            type: String,
            enum: ['annual', 'sick', 'casual', 'unpaid', 'maternity', 'paternity'],
            required: [true, 'Leave type is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        totalDays: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: [true, 'Reason is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewNote: {
            type: String,
            default: '',
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        emergency: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Calculate total days before saving
leaveSchema.pre('save', async function () {
    if (this.startDate && this.endDate) {
        const diffTime = Math.abs(this.endDate - this.startDate);
        this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
});

module.exports = mongoose.model('Leave', leaveSchema);
