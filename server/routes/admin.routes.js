const express = require('express');
const router = express.Router();
const { getAllUsers, changeUserMode, getUserDetail } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// All admin routes require authentication + admin role
router.use(protect, requireAdmin);

router.get('/users', getAllUsers);
router.put('/users/:userId/mode', changeUserMode);
router.get('/users/:userId/detail', getUserDetail);

module.exports = router;
