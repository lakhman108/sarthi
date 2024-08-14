const mongoose = require('mongoose');
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  lecturesWatched: [{
    lectureId: { type: Schema.Types.ObjectId, ref: 'Lecture' },
    watchedAt: { type: Date, default: Date.now }
  }],
  notes: String
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
