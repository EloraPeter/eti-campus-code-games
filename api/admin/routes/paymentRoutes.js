const express = require('express');
const router = express.Router();
const txController = require('../controllers/transactionController');
const isAdmin = require('../../../middleware/isAdmin');

router.get('', isAdmin, txController.getAllTransactions);
router.get('/recent', isAdmin, txController.getRecentTransactions);

module.exports = router;