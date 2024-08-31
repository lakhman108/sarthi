const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
  courseName: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, min: 1, max: 8, required: true },
  lectures: [{ type: Schema.Types.ObjectId, ref: 'Lecture' }]
});

module.exports = mongoose.model('Course', courseSchema);
