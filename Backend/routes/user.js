const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController.js');

router.patch('/:id', authenticateToken, userController.updateUser);
router.patch('/:id/password', authenticateToken, userController.updatePassword);
router.post('/profile-picture', authenticateToken, authorizeRole(['student', 'teacher']), userController.updateProfilePicture);
router.post('/register', register);
router.post('/login', login);
// router.get('/all', userController.getAllUsers);
router.get('/', authenticateToken, authorizeRole(['student', 'teacher']), userController.getLoggedInUser);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
// router.delete('/:id', userController.deleteUser);

module.exports = router;
