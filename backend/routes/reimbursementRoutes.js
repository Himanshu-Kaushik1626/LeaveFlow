const express = require('express');
const router = express.Router();
const {
    submitReimbursement,
    getMyReimbursements,
    getMyReimbursementStats,
    getAllReimbursements,
    getSystemReimbursementStats,
    updateReimbursementStatus,
} = require('../controllers/reimbursementController');
const { protect } = require('../middleware/authMiddleware');
const { restrict } = require('../middleware/roleMiddleware');

router.post('/', protect, submitReimbursement);
router.get('/my', protect, getMyReimbursements);
router.get('/stats/my', protect, getMyReimbursementStats);
router.get('/stats/system', protect, restrict('admin', 'manager'), getSystemReimbursementStats);
router.get('/', protect, restrict('admin', 'manager'), getAllReimbursements);
router.put('/:id/status', protect, restrict('admin', 'manager'), updateReimbursementStatus);

module.exports = router;
