const express = require('express');
const router = express.Router();
const User = require('../models/usermodel.js');
const { register, login } = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController.js');


router.patch('/:id', authenticateToken, userController.updateUser);
router.patch('/:id/password', authenticateToken, userController.updatePassword);
router.patch('/:id/profile-picture', authenticateToken, userController.updateProfilePicture);


router.post('/register', register);
router.post('/login', login);

// Protected routes example
router.get('/student-profile', authenticateToken, authorizeRole(['student']), (req, res) => {
  res.json({ message: 'Student profile accessed' });
});

router.get('/teacher-profile', authenticateToken, authorizeRole(['teacher']), (req, res) => {
  res.json({ message: 'Teacher profile accessed' });
});
// Create User
// In This code first we are checking if the request body is an array or not. If it is an array, we are iterating over each user data and saving it to the database. If it is not an array, we are directly saving the user data to the database. Finally, we are sending the saved users as a response.

// Read all Users
router.get('/all', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get logged in user info
router.get('/',authenticateToken, authorizeRole(['student','teacher']), async (req, res) => {




      try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  });

// Read a single User
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User
router.patch('/:id', async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete User
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
