const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const isAdmin = require('../../../middleware/isAdmin');

router.patch('/:id/activate', isAdmin, permissionController.activateUser);
router.patch('/:id/deactivate', isAdmin, permissionController.deactivateUser);
router.patch('/:id/make-admin', isAdmin, permissionController.makeAdmin);
router.patch('/:id/remove-admin', isAdmin, permissionController.removeAdmin);

module.exports = router;