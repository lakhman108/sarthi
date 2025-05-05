const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');
const { sendOTPEmail } = require('../middleware/emailService');
const crypto = require('crypto');

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//Register a new user (For Normal users)
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
        // If user exists but is not verified, we can update the OTP
        if (!user.isVerified) {
          const otp = generateOTP();
          const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

          user.otp = otp;
          user.otpExpires = otpExpires;
          await user.save();

          // Send OTP email
          await sendOTPEmail(email, otp);

          return res.status(200).json({
            message: 'User already exists but not verified. New OTP has been sent to your email.',
            requiresVerification: true
          });
        }
        return res.status(400).json({ error: 'A user with this email already exists' });
      }

      // Create a new user with OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      user = new User({
        username,
        email,
        password,
        role,
        otp,
        otpExpires,
        isVerified: false
      });
      await user.save();

      // Send OTP email
      await sendOTPEmail(email, otp);

      res.status(201).json({
        message: 'User registered successfully. Please verify your email with the OTP sent.',
        requiresVerification: true
      });
    } catch (error) {
      console.error('[ERROR] Registration failed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};

// Verify OTP and activate user account
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token for automatic login
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '720h' });

    res.status(200).json({
      message: 'Email verified successfully',
      token
    });
  } catch (error) {
    console.error('[ERROR] OTP verification failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Resend OTP for verification
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If already verified
    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.otp = otp;
    console.log(otp);
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'New OTP has been sent to your email' });
  } catch (error) {
    console.error('[ERROR] Resend OTP failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//Login a user and generate a JWT token
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

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      // Send OTP email
      await sendOTPEmail(email, otp);

      return res.status(401).json({
        error: 'Account not verified',
        message: 'A new verification OTP has been sent to your email',
        requiresVerification: true
      });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '720h' });

    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
