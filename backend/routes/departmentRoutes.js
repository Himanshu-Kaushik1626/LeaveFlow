const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { restrict } = require('../middleware/roleMiddleware');

router.get('/', protect, getDepartments);
router.post('/', protect, restrict('admin'), createDepartment);
router.put('/:id', protect, restrict('admin'), updateDepartment);
router.delete('/:id', protect, restrict('admin'), deleteDepartment);

module.exports = router;
