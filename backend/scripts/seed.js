require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Leave = require('../models/Leave');
const connectDB = require('../config/db');

const seed = async () => {
    await connectDB();
    console.log('🌱 Starting seed...');

    // Clear existing data
    await User.deleteMany();
    await Department.deleteMany();
    await Leave.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create departments
    const [engineering, hr, marketing] = await Department.insertMany([
        { name: 'Engineering', description: 'Software development team' },
        { name: 'Human Resources', description: 'HR and people operations' },
        { name: 'Marketing', description: 'Marketing and growth team' },
    ]);
    console.log('🏢 Departments created');

    // Create admin
    const admin = await User.create({
        name: 'Super Admin',
        email: 'admin@company.com',
        password: 'Admin@123',
        role: 'admin',
        department: hr._id,
        leaveBalance: { annual: 20, sick: 10, casual: 7 },
    });

    // Create manager
    const manager = await User.create({
        name: 'John Manager',
        email: 'manager@company.com',
        password: 'Manager@123',
        role: 'manager',
        department: engineering._id,
        leaveBalance: { annual: 20, sick: 10, casual: 7 },
    });

    // Create employees
    const emp1 = await User.create({
        name: 'Alice Johnson',
        email: 'alice@company.com',
        password: 'Employee@123',
        role: 'employee',
        department: engineering._id,
        leaveBalance: { annual: 18, sick: 8, casual: 5 },
    });

    const emp2 = await User.create({
        name: 'Bob Smith',
        email: 'bob@company.com',
        password: 'Employee@123',
        role: 'employee',
        department: marketing._id,
        leaveBalance: { annual: 15, sick: 10, casual: 7 },
    });

    // Update departments with manager
    await Department.findByIdAndUpdate(engineering._id, { manager: manager._id });

    // Create sample leaves
    await Leave.create([
        {
            employee: emp1._id,
            leaveType: 'annual',
            startDate: new Date('2026-03-01'),
            endDate: new Date('2026-03-05'),
            totalDays: 5,
            reason: 'Family vacation',
            status: 'pending',
        },
        {
            employee: emp1._id,
            leaveType: 'sick',
            startDate: new Date('2026-02-10'),
            endDate: new Date('2026-02-11'),
            totalDays: 2,
            reason: 'Fever and cold',
            status: 'approved',
            reviewedBy: manager._id,
            reviewNote: 'Get well soon',
            reviewedAt: new Date('2026-02-10'),
        },
        {
            employee: emp2._id,
            leaveType: 'casual',
            startDate: new Date('2026-02-20'),
            endDate: new Date('2026-02-20'),
            totalDays: 1,
            reason: 'Personal errand',
            status: 'rejected',
            reviewedBy: manager._id,
            reviewNote: 'Team meeting scheduled',
            reviewedAt: new Date('2026-02-19'),
        },
        {
            employee: emp2._id,
            leaveType: 'annual',
            startDate: new Date('2026-03-15'),
            endDate: new Date('2026-03-19'),
            totalDays: 5,
            reason: 'Travel plans',
            status: 'pending',
        },
    ]);

    console.log('✅ Seed complete!\n');
    console.log('📋 Login Credentials:');
    console.log('  Admin    → admin@company.com    / Admin@123');
    console.log('  Manager  → manager@company.com  / Manager@123');
    console.log('  Employee → alice@company.com    / Employee@123');
    console.log('  Employee → bob@company.com      / Employee@123');

    process.exit(0);
};

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
