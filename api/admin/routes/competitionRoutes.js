const express = require('express');
const router = express.Router();
const compController = require('../controllers/competitionController');
const isAdmin = require('../../../middleware/isAdmin');

// PRIVATE: Must be logged in (Admin check happens inside the controller)
router.post('', isAdmin, compController.createCompetition);
router.put('/:id', isAdmin, compController.updateCompetition);
router.patch('/:id', isAdmin, compController.updateCompetition);
router.delete('/:id', isAdmin, compController.deleteCompetition);

module.exports = router;
