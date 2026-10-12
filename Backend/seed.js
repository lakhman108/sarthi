/**
 * Local sample data: a verified teacher, a verified student, two classes,
 * lectures, comments, and notes.
 *
 * Safe to run more than once. It only updates the sample emails and the
 * classes with codes SEED01 and SEED02.
 *
 * Usage (from Backend/, after MongoDB is running and .env exists):
 *   npm run seed
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./models/usermodel');
const Course = require('./models/coursemodel');
const Lecture = require('./models/lecturemodel');
const Enrollment = require('./models/enrollmentmodel');

const SAMPLE_VIDEO = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

const ACCOUNTS = [
  {
    username: 'teacher',
    email: 'teacher@sarthi.local',
    password: 'teacher123',
    role: 'teacher',
    profilePictureImageLink: 'https://ui-avatars.com/api/?name=Teacher&background=1c1917&color=fafaf9'
  },
  {
    username: 'student',
    email: 'student@sarthi.local',
    password: 'student123',
    role: 'student',
    profilePictureImageLink: 'https://ui-avatars.com/api/?name=Student&background=44403c&color=fafaf9'
  }
];

async function upsertUser(account) {
  let user = await User.findOne({ email: account.email });
  if (!user) {
    user = new User(account);
  } else {
    user.username = account.username;
    user.password = account.password;
    user.role = account.role;
    user.profilePictureImageLink = account.profilePictureImageLink;
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  return user;
}

async function upsertCourse({ classCode, courseName, teacherId, semester }) {
  let course = await Course.findOne({ classCode });
  if (!course) {
    course = new Course({ classCode, courseName, teacherId, semester, lectures: [] });
  } else {
    course.courseName = courseName;
    course.teacherId = teacherId;
    course.semester = semester;
  }
  await course.save();
  return course;
}

async function upsertLecture(course, lecture) {
  let doc = await Lecture.findOne({ courseId: course._id, nameOfTopic: lecture.nameOfTopic });
  if (!doc) {
    doc = new Lecture({ courseId: course._id, nameOfTopic: lecture.nameOfTopic });
  }
  doc.videoLink = lecture.videoLink;
  doc.videoName = 'seed-sample';
  doc.processingStatus = 'completed';
  doc.processingError = undefined;
  doc.jobId = undefined;
  doc.noOfViews = lecture.noOfViews;
  doc.noOfLikes = lecture.noOfLikes;
  doc.comments = lecture.comments;
  await doc.save();
  return doc;
}

async function upsertEnrollment({ studentId, courseId, notes, lecturesWatched }) {
  let enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) {
    enrollment = new Enrollment({ studentId, courseId });
  }
  enrollment.notes = notes;
  enrollment.lecturesWatched = lecturesWatched;
  await enrollment.save();
  return enrollment;
}

async function seedAccounts() {
  const users = {};
  for (const account of ACCOUNTS) {
    users[account.role] = await upsertUser(account);
  }
  return users;
}

async function main() {
  if (process.env.ENVIRONMENT === 'production') {
    console.error('Refusing to seed while ENVIRONMENT is production.');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Copy Backend/.env.example to Backend/.env first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const { teacher, student } = await seedAccounts();

  const programming = await upsertCourse({
    classCode: 'SEED01',
    courseName: 'Introduction to Programming',
    teacherId: teacher._id,
    semester: 1
  });

  const intro = await upsertLecture(programming, {
    nameOfTopic: 'How a program runs',
    videoLink: SAMPLE_VIDEO,
    noOfViews: 12,
    noOfLikes: 3,
    comments: [
      {
        userId: student._id,
        text: 'The part about the program starting from main() was the useful bit.',
        createdAt: new Date('2026-03-02T10:15:00Z')
      }
    ]
  });

  const variables = await upsertLecture(programming, {
    nameOfTopic: 'Variables and types',
    videoLink: SAMPLE_VIDEO,
    noOfViews: 7,
    noOfLikes: 1,
    comments: [
      {
        userId: teacher._id,
        text: 'Try changing the sample values and watch what the program prints.',
        createdAt: new Date('2026-03-04T08:00:00Z')
      }
    ]
  });

  programming.lectures = [intro._id, variables._id];
  await programming.save();

  await upsertEnrollment({
    studentId: teacher._id,
    courseId: programming._id,
    notes: 'Office hours are on Friday. Bring one question from the variables lecture.',
    lecturesWatched: []
  });

  await upsertEnrollment({
    studentId: student._id,
    courseId: programming._id,
    notes: 'Rewatch how a program starts, then redo the variables example on paper.',
    lecturesWatched: [{ lectureId: intro._id, watchedAt: new Date('2026-03-03T18:30:00Z') }]
  });

  const structures = await upsertCourse({
    classCode: 'SEED02',
    courseName: 'Data Structures',
    teacherId: teacher._id,
    semester: 2
  });

  const arrays = await upsertLecture(structures, {
    nameOfTopic: 'Arrays and lists',
    videoLink: SAMPLE_VIDEO,
    noOfViews: 4,
    noOfLikes: 0,
    comments: []
  });

  structures.lectures = [arrays._id];
  await structures.save();

  await upsertEnrollment({
    studentId: teacher._id,
    courseId: structures._id,
    notes: 'Next week: stacks. The student account is not in this class yet.',
    lecturesWatched: []
  });

  // Keep SEED02 as a class the student can join, even after an earlier try.
  await Enrollment.deleteOne({ studentId: student._id, courseId: structures._id });

  console.log('');
  console.log('Sample data is ready. Sign in at http://localhost:3000/login');
  console.log('');
  console.log('  Teacher   teacher@sarthi.local   teacher123');
  console.log('  Student   student@sarthi.local   student123');
  console.log('');
  console.log('  SEED01  Introduction to Programming  (both accounts)');
  console.log('  SEED02  Data Structures              (teacher only)');
  console.log('');
  console.log('Lecture video is a public sample stream, so playback needs internet.');
  console.log('Running this again updates the same accounts and classes.');

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
