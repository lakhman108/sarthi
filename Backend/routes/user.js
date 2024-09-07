const express = require('express');
const router = express.Router();
const User = require('../models/usermodel.js');

// Create User
// In This code first we are checking if the request body is an array or not. If it is an array, we are iterating over each user data and saving it to the database. If it is not an array, we are directly saving the user data to the database. Finally, we are sending the saved users as a response.
router.post('/', async (req, res) => {
  try {
    let savedUsers = [];
    if (Array.isArray(req.body)) {
      const users = req.body;
      for (const userData of users) {
        const user = new User(userData);
        await user.save();
        savedUsers.push(user);
      }
    } else {
      const user = new User(req.body);
      await user.save();
      savedUsers.push(user);
    }
    res.status(201).json(savedUsers);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// Read all Users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
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
router.put('/:id', async (req, res) => {
  try {
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
