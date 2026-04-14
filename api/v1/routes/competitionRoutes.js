const express = require('express');
const router = express.Router();
const compController = require('../controllers/competitionController');

// PUBLIC: Anyone can view
router.get('', compController.listCompetitions);

module.exports = router;
