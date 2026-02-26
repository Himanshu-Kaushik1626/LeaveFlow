const express = require('express');
const router = express.Router();
const {
    applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, cancelLeave,
    getMyStats, getSystemStats, bulkUpdateStatus,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { restrict } = require('../middleware/roleMiddleware');

router.post('/', protect, applyLeave);
router.get('/my', protect, getMyLeaves);
router.get('/stats/my', protect, getMyStats);
router.get('/stats/system', protect, restrict('admin', 'manager'), getSystemStats);
router.get('/', protect, restrict('admin', 'manager'), getAllLeaves);
router.put('/bulk-status', protect, restrict('admin', 'manager'), bulkUpdateStatus);
router.put('/:id/status', protect, restrict('admin', 'manager'), updateLeaveStatus);
router.put('/:id/cancel', protect, cancelLeave);

module.exports = router;
