const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/coursemodel.js');
const Lecture = require('../models/lecturemodel.js');
const Enrollment = require('../models/enrollmentmodel.js');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const fs = require('fs/promises');



  router.get('/', authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
    try {
      // Finding enrollments for the authenticated user
      const enrollments = await Enrollment.find({ studentId: req.user.userId } )

      const teachercourses=await Course.find({teacherId:req.user.userId}).populate('teacherId', 'username');
      let courses=[...teachercourses];
      //   console.log(teachercourses);
      // getting all courseId and populating the course with teacherId and username
      const courseIds=enrollments.map(enrollment => enrollment.courseId);
      console.log(courseIds);


     for(let id in courseIds){
        const course=await Course.findById(courseIds[id]).populate('teacherId', 'username');
        courses.push(course);
     }
     let updatedCourse=courses.filter((course, index, self) =>
        index === self.findIndex((t) => t._id.toString() === course._id.toString())
      );

      console.log(updatedCourse);
      console.log("\n\n\n")
      if (!updatedCourse) return res.status(404).json({ error: 'Course not found' });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
// Get a course by ID

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacherId', 'username');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new course(s)
router.post('/',authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
  try {
    const savedCourses = [];
    if (Array.isArray(req.body)) {
      const courses = req.body;
      for (const courseData of courses) {
        const course = new Course(courseData);
        course.classCode = Course.generateClassCode();
        await course.save();
        savedCourses.push(course);
      }
    } else {
      console.log(req.body);

      const course = new Course(req.body);
      course.classCode = Course.generateClassCode();
      const coursedata=await course.save();
      const payload={
        studentId:req.user.userId,
        courseId:coursedata._id
      }
      const enrollment=new Enrollment(payload);
      const response=await enrollment.save();
      console.log("\n\n\n")
      console.log(coursedata);
      console.log(response);
      console.log("\n\n\n")
      savedCourses.push(course);
    }
    res.status(201).json(savedCourses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//this request is for update information of a course
//we need to give id and fields to update
//it will return updated course information or error
router.patch('/:id', async (req, res) => {
    try {
      // Log the request body to ensure values are being sent correctly
      console.log('Request body:', req.body);

      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Log the course details before updating
      console.log('Course before update:', course);

      // Update fields only if provided in the request body
      course.courseName = req.body.courseName ?? course.courseName;
      course.teacherId = req.body.teacherId ?? course.teacherId;
      course.semester = req.body.semester ?? course.semester;
      course.lectures = req.body.lectures ?? course.lectures;

      // Save the updated course
      const updatedCourse = await course.save();

      // Log the course details after updating
      console.log('Course after update:', updatedCourse);

      // Respond with the updated course data
      res.status(200).json(updatedCourse);
    } catch (error) {
      console.error('Error updating course:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

//   It uses MongoDB transactions to ensure all operations are atomic. If any operation fails, all changes will be rolled back.
//   It first deletes the course using findByIdAndDelete.
//   If the course is found, it then deletes all lectures associated with the course using Lecture.deleteMany().
//   It also deletes all enrollments associated with the course using Enrollment.deleteMany().
//   If all operations are successful, it commits the transaction and sends a success response.
//   If any error occurs during the process, it aborts the transaction and sends an error response.
router.delete('/:id', authenticateToken, authorizeRole(['student', 'teacher']),async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const courseId = req.params.id;
      console.log('Course ID:', courseId);

      // Find the course
      const course = await Course.findById(courseId).session(session);
      if (!course) {
        if(course.teacherId.toString()===req.user.userId){
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ error: 'Course not found' });
        }
        console.log('Course not found');
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Course not found' });
      }

      // Find all lectures associated with the course
      const lectures = await Lecture.find({ courseId: courseId }).session(session);
      console.log('Lectures:', lectures);

      // Delete folders for each lecture
      for (const lecture of lectures) {
        const str = lecture.videoLink;
        const finalString = str
          .replace("http://localhost:3000/api", "public")
          .replace("master.m3u8", "");

        try {
          await fs.rm(finalString, { recursive: true, force: true }); // Use promises
          console.log(`${finalString} is deleted!`);
        } catch (err) {
          console.error(`Error deleting folder: ${finalString}`, err);
          throw err; // If deletion fails, abort the transaction
        }
      }

      // Delete the course
      await Course.findByIdAndDelete(courseId).session(session);

      // Delete all lectures associated with the course
      await Lecture.deleteMany({ courseId: courseId }).session(session);

      // Delete all enrollments associated with the course
      await Enrollment.deleteMany({ courseId: courseId }).session(session);

      // Commit the transaction
      await session.commitTransaction();
      console.log('Transaction committed successfully');
      session.endSession();

      res.json({ message: 'Course, associated data, and folders deleted', course });
    } catch (error) {
      console.error('Error in deletion process:', error);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ error: error.message });
    }
  });



module.exports = router;
