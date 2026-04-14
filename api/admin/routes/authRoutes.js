const express = require('express');
const router = express.Router();
const userController = require('../controllers/authController');
const isAdmin = require('../../../middleware/isAdmin');

router.get('', isAdmin, userController.getUsers);
router.get('/:id', isAdmin, userController.getUserById);
router.put('/:id', isAdmin, userController.updateUser);
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;