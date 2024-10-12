const express = require('express');
const router = express.Router();
const Course = require('../models/coursemodel.js');

// Get all courses
router.get('/', async (req, res) => {
    try {
      const courses = await Course.find()
        .populate('teacherId', 'username');
        // console.log(courses);
      res.json(courses);
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
router.post('/', async (req, res) => {
  try {
    const savedCourses = [];
    if (Array.isArray(req.body)) {
      const courses = req.body;
      for (const courseData of courses) {
        const course = new Course(courseData);
        await course.save();
        savedCourses.push(course);
      }
    } else {
      const course = new Course(req.body);
      await course.save();
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



router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
