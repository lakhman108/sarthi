const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/coursemodel.js');
const Lecture = require('../models/lecturemodel.js');
const Enrollment = require('../models/enrollmentmodel.js');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { checkCourseAccess, checkTeacherAccess } = require('../middleware/enrollmentMiddleware');
const fs = require('fs/promises');

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - courseName
 *         - teacherId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         courseName:
 *           type: string
 *           description: Name of the course
 *         teacherId:
 *           type: string
 *           description: ID of the teacher who created the course
 *         semester:
 *           type: string
 *           description: Semester information
 *         lectures:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of lecture IDs associated with this course
 *         classCode:
 *           type: string
 *           description: Unique code for joining the course
 *       example:
 *         courseName: Introduction to Computer Science
 *         teacherId: 60d21b4667d0d8992e610c85
 *         semester: Fall 2025
 *         classCode: ABC123
 */

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses for authenticated user
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
  try {
    console.log(`[AUTH] User ${req.user.userId} requesting all courses`);

    const enrollments = await Enrollment.find({ studentId: req.user.userId });
    console.log(`[DB] Found ${enrollments.length} enrollments for user ${req.user.userId}`);

    const teachercourses = await Course.find({teacherId: req.user.userId}).populate('teacherId', 'username');
    console.log(`[DB] Found ${teachercourses.length} courses where user is teacher`);

    let courses = [...teachercourses];
    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    console.log(`[DB] Processing courseIds:`, courseIds);

    for(let id in courseIds) {
      const course = await Course.findById(courseIds[id]).populate('teacherId', 'username');
      courses.push(course);
    }

    let updatedCourse = courses.filter((course, index, self) =>
      index === self.findIndex((t) => t._id.toString() === course._id.toString())
    );
    console.log(`[DB] Final filtered courses count: ${updatedCourse.length}`);

    if (!updatedCourse) return res.status(404).json({ error: 'Course not found' });
    res.json(updatedCourse);
  } catch (error) {
    console.error(`[ERROR] Get courses failed:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, authorizeRole(['student', 'teacher']), checkCourseAccess, async (req, res) => {
  try {
    console.log(`[DB] Fetching course ID: ${req.params.id}`);
    const course = await Course.findById(req.params.id).populate('teacherId', 'username');

    if (!course) {
      console.log(`[DB] Course not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log(`[DB] Course found: ${course._id}`);
    res.json(course);
  } catch (error) {
    console.error(`[ERROR] Get course by ID failed:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Course'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
  try {
    console.log(`[AUTH] User ${req.user.userId} creating new course`);
    const savedCourses = [];

    if (Array.isArray(req.body)) {
      console.log(`[DB] Creating multiple courses: ${req.body.length}`);
      const courses = req.body;
      for (const courseData of courses) {
        const course = new Course(courseData);
        course.classCode = Course.generateClassCode();
        await course.save();
        savedCourses.push(course);
        console.log(`[DB] Course created: ${course._id}`);
      }
    } else {
      console.log(`[DB] Creating single course:`, req.body);
      const course = new Course(req.body);
      course.classCode = Course.generateClassCode();
      const coursedata = await course.save();
      console.log(`[DB] Course created: ${coursedata._id}`);

      const payload = {
        studentId: req.user.userId,
        courseId: coursedata._id
      };
      const enrollment = new Enrollment(payload);
      const response = await enrollment.save();
      console.log(`[DB] Enrollment created: ${response._id}`);

      savedCourses.push(course);
    }
    res.status(201).json(savedCourses);
  } catch (error) {
    console.error(`[ERROR] Create course failed:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   patch:
 *     summary: Update a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseName:
 *                 type: string
 *               teacherId:
 *                 type: string
 *               semester:
 *                 type: string
 *               lectures:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', authenticateToken, authorizeRole(['teacher']), checkTeacherAccess, async (req, res) => {
  try {
    console.log(`[DB] Updating course ${req.params.id}`);
    console.log(`[DB] Update payload:`, req.body);

    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log(`[DB] Course not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log(`[DB] Course before update:`, course);

    course.courseName = req.body.courseName ?? course.courseName;
    course.teacherId = req.body.teacherId ?? course.teacherId;
    course.semester = req.body.semester ?? course.semester;
    course.lectures = req.body.lectures ?? course.lectures;

    const updatedCourse = await course.save();
    console.log(`[DB] Course after update:`, updatedCourse);

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error(`[ERROR] Update course failed:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course and related resources
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course and associated data deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, authorizeRole(['teacher']), checkTeacherAccess, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log(`[TX] Starting deletion transaction for course ${req.params.id}`);

  try {
    const courseId = req.params.id;
    console.log(`[AUTH] User ${req.user.userId} attempting course deletion`);

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      console.log(`[DB] Course not found: ${courseId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Course not found' });
    }

    const lectures = await Lecture.find({ courseId: courseId }).session(session);
    console.log(`[DB] Found ${lectures.length} lectures to delete`);

    for (const lecture of lectures) {
      const str = lecture.videoLink;
      const finalString = str
        .replace("${process.env.HOST}/api", "public")
        .replace("master.m3u8", "");

      try {
        console.log(`[FS] Deleting folder: ${finalString}`);
        await fs.rm(finalString, { recursive: true, force: true });
        console.log(`[FS] Folder deleted successfully`);
      } catch (err) {
        console.error(`[ERROR] Folder deletion failed:`, err);
        throw err;
      }
    }

    await Course.findByIdAndDelete(courseId).session(session);
    console.log(`[DB] Course deleted: ${courseId}`);

    await Lecture.deleteMany({ courseId: courseId }).session(session);
    console.log(`[DB] Lectures deleted for course: ${courseId}`);

    await Enrollment.deleteMany({ courseId: courseId }).session(session);
    console.log(`[DB] Enrollments deleted for course: ${courseId}`);

    await session.commitTransaction();
    console.log(`[TX] Transaction committed successfully`);
    session.endSession();

    res.json({ message: 'Course and associated data deleted', course });
  } catch (error) {
    console.error(`[ERROR] Course deletion failed:`, error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
