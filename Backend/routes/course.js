const express = require('express');
const router = express.Router();
const Course = require('../models/coursemodel.js');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('teacherId', 'username');
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

module.exports = router;
