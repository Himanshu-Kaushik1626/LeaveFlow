const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
        },
        category: {
            type: String,
            enum: ['travel', 'food', 'accommodation', 'equipment', 'medical', 'other'],
            required: [true, 'Category is required'],
        },
        expenseDate: {
            type: Date,
            required: [true, 'Expense date is required'],
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        receiptUrl: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
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
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
