const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');

exports.register = async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      // Check if the username already exists
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if the email already exists
      user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: 'A user with this email already exists' });
      }

      // Create a new user
      user = new User({ username, email, password, role });
      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email });

    console.log(user);
    if(!user) {
        return res.status(401).json({ error: 'No such user with this email' });
    }
    if (!(await user.comparePassword(password))) {
      console.log("Invalid credentials");
      return res.status(401).json({ error: 'Invalid Password' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '720h' });

    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
