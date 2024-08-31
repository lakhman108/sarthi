const mongoose = require('mongoose');
const { Schema } = mongoose;

const lectureSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  nameOfTopic: { type: String, required: true },
  videoLink: { type: String, required: true },
  noOfViews: { type: Number, default: 0 },
  noOfLikes: { type: Number, default: 0 },
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Lecture', lectureSchema);
