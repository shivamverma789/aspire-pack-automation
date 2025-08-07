const express = require('express');
const passport = require('passport');
const router = express.Router();
const ensureAdmin = require('../middlewares/ensureAdmin');
const authController = require('../controllers/authController');


// Register (only for setup)
router.post('/register', authController.postRegister);

// Dashboard (protected)
router.get('/dashboard', ensureAdmin, authController.adminDashboard);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
