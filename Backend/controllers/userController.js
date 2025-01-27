const User = require('../models/usermodel');

const multer = require('multer');
const path = require('path');

const storageEngine = multer.diskStorage({
  destination: './public/hls/profilePictures/',
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, callback) => {
  let pattern = /jpg|jpeg|png|gif/;
  if (pattern.test(path.extname(file.originalname).toLowerCase())) {
    callback(null, true);
  } else {
    callback('Error: not a valid image file');
  }
};

const upload = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
});

//this function is used to upload the profile picture and generate the user's profile picture url
const uploadProfilePicture = (req, res) => {
    console.log("Starting uploadProfilePicture function");
    return new Promise((resolve, reject) => {
      upload.single('profilePicture')(req, res, (err) => {
        if (err) {
          console.error("Error in file upload:", err);
          reject(err);
        } else if (!req.file) {
          console.error("No file uploaded");
          reject(new Error('No file uploaded'));
        } else {
          console.log("File uploaded successfully:", req.file);
          const fileUrl = `${process.env.HOST}/api/hls/profilePictures/${req.file.filename}`;
        //   console.log("Generated file URL:", fileUrl);
          resolve(fileUrl);
        }
      });
    });
  };



exports.updateUser = async (req, res) => {
  try {

    let user;
    if(req.body.username) {
        user=await User.findOne({ username: req.body.username });
        console.log("User:", user);
        if(user) {
            console.log("Username already exists deer");
            return res.status(400).json({ error: 'Username already exists' });
        }
    }
     user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password="";
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = req.body.newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateProfilePicture = async (req, res) => {
  try {
    console.log("updateProfilePicture method called",req.user.userId);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const fileUrl = await uploadProfilePicture(req, res);
    console.log("File URL received:", fileUrl);

    const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: { profilePictureImageLink: fileUrl } },

      );
  const updatedUser = await User.findById(req.user.userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("Updated user:", user);
    user.password="";
    res.json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfilePicture:", error);
    res.status(400).json({ error: error.message });
  }
};
// In This code first we are checking if the request body is an array or not. If it is an array, we are iterating over each user data and saving it to the database. If it is not an array, we are directly saving the user data to the database. Finally, we are sending the saved users as a response.

exports.getLoggedInUser = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.password="";
      res.json(user);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
      user.password="";
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.password="";
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.password="";
      res.json({ message: 'User deleted', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
