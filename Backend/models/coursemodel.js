const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
  courseName: { type: String, required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, min: 1, max: 8, required: true },
  lectures: [{ type: Schema.Types.ObjectId, ref: 'Lecture' }],
  classCode: { type: String, unique: true, required: true },

});



courseSchema.statics.generateClassCode = function() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  courseSchema.pre('save', async function(next) {
    if (!this.classCode) {
      let classCode;
      let isUnique = false;
      while (!isUnique) {
        classCode = this.constructor.generateClassCode();
        const existingCourse = await this.constructor.findOne({ classCode });
        if (!existingCourse) {
          isUnique = true;
        }
      }
      this.classCode = classCode;
    }
    next();
  });



module.exports = mongoose.model('Course', courseSchema);
