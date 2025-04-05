const User = require('../models/usermodel');

const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storageEngine = multer.diskStorage({
  destination: './public/hls/profilePictures/',
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// File filter to only accept only jpg,jpeg,png,gif file types
const fileFilter = (req, file, callback) => {
  let pattern = /jpg|jpeg|png|gif/;
  if (pattern.test(path.extname(file.originalname).toLowerCase())) {
    callback(null, true);
  } else {
    callback('Error: not a valid image file');
  }
};

// Initialize multer with the storage engine and file filter
const upload = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
});

// Middleware to handle file uploads
const uploadProfilePicture = (req, res) => {
    console.log(`[FILE] Starting profile picture upload`);
    return new Promise((resolve, reject) => {
      upload.single('profilePicture')(req, res, (err) => {
        if (err) {
          console.error(`[ERROR] File upload failed:`, err);
          reject(err);
        } else if (!req.file) {
          console.error(`[ERROR] No file provided in request`);
          reject(new Error('No file uploaded'));
        } else {
          console.log(`[FILE] Upload successful: ${req.file.filename}`);
          const fileUrl = `${process.env.HOST}/api/hls/profilePictures/${req.file.filename}`;
          console.log(`[FILE] Generated URL: ${fileUrl}`);
          resolve(fileUrl);
        }
      });
    });
};

//update user details
exports.updateUser = async (req, res) => {
  try {
    console.log(`[USER] Processing update for user ID: ${req.params.id}`);
    let user;

    if(req.body.username) {
        user = await User.findOne({ username: req.body.username });
        console.log(`[DB] Username lookup result:`, user ? 'found' : 'not found');

        if(user && user._id == req.user.userId) {
            console.log(`[USER] Username unchanged: ${req.body.username}`);
            return res.status(400).json({ error: 'Username already in use' });
        }
        if(user) {
            console.log(`[USER] Username taken: ${req.body.username}`);
            return res.status(400).json({ error: 'Username already exists' });
        }
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log(`[DB] User update status:`, user ? 'success' : 'not found');

    if (!user) {
        console.log(`[ERROR] User not found: ${req.params.id}`);
        return res.status(404).json({ error: 'User not found' });
    }

    user.password = "";
    res.json(user);
  } catch (error) {
    console.error(`[ERROR] Update user failed:`, error);
    res.status(400).json({ error: error.message });
  }
};

//update user password
exports.updatePassword = async (req, res) => {
  try {
    console.log(`[USER] Processing password update for user: ${req.params.id}`);
    const user = await User.findById(req.params.id);

    if (!user) {
        console.log(`[ERROR] User not found: ${req.params.id}`);
        return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[AUTH] Validating current password`);
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
        console.log(`[AUTH] Invalid current password provided`);
        return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();
    console.log(`[DB] Password updated successfully`);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(`[ERROR] Password update failed:`, error);
    res.status(400).json({ error: error.message });
  }
};

//update user profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    console.log(`[FILE] Processing profile picture update for user: ${req.user.userId}`);
    const fileUrl = await uploadProfilePicture(req, res);
    console.log(`[FILE] Generated URL: ${fileUrl}`);

    const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: { profilePictureImageLink: fileUrl } },
    );
    console.log(`[DB] Profile picture update status:`, user ? 'success' : 'failed');

    const updatedUser = await User.findById(req.user.userId);
    if (!user) {
        console.log(`[ERROR] User not found: ${req.user.userId}`);
        return res.status(404).json({ error: 'User not found' });
    }

    user.password = "";
    res.json(updatedUser);
  } catch (error) {
    console.error(`[ERROR] Profile picture update failed:`, error);
    res.status(400).json({ error: error.message });
  }
};

//get logged in user using req.user.userId
// This assumes that the user ID is stored in req.user.userId by the authentication middleware
exports.getLoggedInUser = async (req, res) => {
    try {
        console.log(`[USER] Fetching logged-in user: ${req.user.userId}`);
        const user = await User.findById(req.user.userId);
        console.log(`[DB] User lookup status:`, user ? 'found' : 'not found');

        if (!user) {
            console.log(`[ERROR] User not found: ${req.user.userId}`);
            return res.status(404).json({ error: 'User not found' });
        }
        user.password = "";
        res.json(user);
    } catch (error) {
        console.error(`[ERROR] Fetch logged-in user failed:`, error);
        res.status(500).json({ error: error.message });
    }
};

// exports.getAllUsers = async (req, res) => {
//     try {
//         console.log(`[USER] Fetching all users`);
//         const users = await User.find();
//         console.log(`[DB] Found ${users.length} users`);
//         users.forEach(user => user.password = "");
//         res.json(users);
//     } catch (error) {
//         console.error(`[ERROR] Fetch all users failed:`, error);
//         res.status(500).json({ error: error.message });
//     }
// };

//get user by id
exports.getUserById = async (req, res) => {
    try {
        console.log(`[USER] Fetching user by ID: ${req.params.id}`);
        const user = await User.findById(req.params.id);
        console.log(`[DB] User lookup status:`, user ? 'found' : 'not found');

        if (!user) {
            console.log(`[ERROR] User not found: ${req.params.id}`);
            return res.status(404).json({ error: 'User not found' });
        }
        user.password = "";
        res.json(user);
    } catch (error) {
        console.error(`[ERROR] Fetch user by ID failed:`, error);
        res.status(500).json({ error: error.message });
    }
};

// exports.deleteUser = async (req, res) => {
//     try {
//         console.log(`[USER] Deleting user: ${req.params.id}`);
//         const user = await User.findByIdAndDelete(req.params.id);
//         console.log(`[DB] User deletion status:`, user ? 'success' : 'not found');

//         if (!user) {
//             console.log(`[ERROR] User not found: ${req.params.id}`);
//             return res.status(404).json({ error: 'User not found' });
//         }
//         user.password = "";
//         res.json({ message: 'User deleted', user });
//     } catch (error) {
//         console.error(`[ERROR] Delete user failed:`, error);
//         res.status(500).json({ error: error.message });
//     }
// };
