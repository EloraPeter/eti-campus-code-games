const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../../middleware/isAuthenticated');
const paymentController = require('../controllers/paymentController');

router.get('/my-payments', isAuthenticated, paymentController.getMyPayments);

module.exports = router;
