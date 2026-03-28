const express = require('express');
const router = express.Router();
const { initializePayment } = require('../controllers/paymentController');

router.post('/register/initialize', initializePayment);

module.exports = router;