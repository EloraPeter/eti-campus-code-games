const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/paystack', webhookController.handlePaystackWebhook);

module.exports = router;