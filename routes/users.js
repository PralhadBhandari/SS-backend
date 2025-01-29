const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Adjust path if needed
const authenticate = require('../middlewares/auth'); // Import middleware

// Public Routes
router.post('/register', userController.register);
router.post('/login', userController.login);
// Protected Routes
router.get('/', authenticate, userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
