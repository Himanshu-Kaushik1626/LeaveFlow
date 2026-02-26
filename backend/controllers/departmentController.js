const Department = require('../models/Department');

const getDepartments = async (req, res) => {
    const departments = await Department.find().populate('manager', 'name email');
    res.json({ success: true, departments });
};

const createDepartment = async (req, res) => {
    const { name, description, manager } = req.body;
    const dept = await Department.create({ name, description, manager });
    res.status(201).json({ success: true, message: 'Department created', department: dept });
};

const updateDepartment = async (req, res) => {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department updated', department: dept });
};

const deleteDepartment = async (req, res) => {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department deleted' });
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
