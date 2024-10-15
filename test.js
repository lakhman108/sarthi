const mongoose = require('mongoose');
const Course = require('./models/Course');

console.log('Migration started');

async function addClassCodes() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect("mongodb+srv://luckyparmar737:69t9YdvC83z1qOgS@cluster0.gqhgc.mongodb.net/?retryWrites=true&w=majority");
  console.log('Connected to MongoDB');

  console.log('Fetching courses...');
  const courses = await Course.find({ classCode: { $exists: false } });
  console.log(`Found ${courses.length} courses without class codes`);

  for (const course of courses) {
    course.classCode = Course.generateClassCode();
    await course.save();
    console.log(`Added class code ${course.classCode} to course ${course._id}`);
  }

  console.log('Migration completed');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}

addClassCodes().catch(error => {
  console.error('Error during migration:', error);
  process.exit(1);
});
