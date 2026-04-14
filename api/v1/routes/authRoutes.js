const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const isAuthenticated = require('../../../middleware/isAuthenticated');

router.post('/register', authController.userRegistration);
router.post('/login', authController.userLogin);
router.get('/me', isAuthenticated, authController.getMyProfile);
router.put('/me', isAuthenticated, authController.updateMyProfile);

module.exports = router;