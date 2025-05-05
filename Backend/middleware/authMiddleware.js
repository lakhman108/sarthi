const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');


// Middleware to authenticate JWT tokens and authorize user roles
exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if user exists and is verified
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        error: 'Account not verified',
        requiresVerification: true
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to authorize user roles
// This middleware checks if the user's role is in the allowed roles array
// If the user's role is not in the array, it returns a 403 Forbidden response
// The roles parameter should be an array of allowed roles
exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
