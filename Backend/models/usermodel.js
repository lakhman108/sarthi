const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateJoined: { type: Date, default: Date.now },
  profilePictureImageLink: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'teacher'], required: true }
  
});

module.exports = mongoose.model('User', userSchema);
