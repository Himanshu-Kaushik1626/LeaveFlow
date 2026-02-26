const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, toggleActive, createUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { restrict } = require('../middleware/roleMiddleware');

router.get('/', protect, restrict('admin', 'manager'), getUsers);
router.post('/', protect, restrict('admin'), createUser);
router.get('/:id', protect, restrict('admin', 'manager'), getUserById);
router.put('/:id', protect, restrict('admin'), updateUser);
router.delete('/:id', protect, restrict('admin'), deleteUser);
router.put('/:id/toggle-active', protect, restrict('admin'), toggleActive);

module.exports = router;
