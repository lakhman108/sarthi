const mongoose = require('mongoose');
const { Schema } = mongoose;

const lectureSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  nameOfTopic: { type: String, required: true },
  videoLink: { type: String },
  videoName: { type: String },  // Sanitized folder name for cleanup
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  jobId: { type: String },
  processingError: { type: String },
  noOfViews: { type: Number, default: 0 },
  noOfLikes: { type: Number, default: 0 },
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Lecture', lectureSchema);
