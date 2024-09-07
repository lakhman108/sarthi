const express = require('express');
const router = express.Router();
const Lecture = require('../models/lecturemodel.js');

// Get all lectures
router.get('/', async (req, res) => {
  try {
    const lectures = await Lecture.find().populate('comments.userId', 'username');
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lecture by ID
router.get('/:id', async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate('comments.userId', 'username');
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' });
    res.json(lecture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lectures by course ID
router.get('/course/:courseId', async (req, res) => {
  try {
    const lectures = await Lecture.find({ courseId: req.params.courseId }).populate('comments.userId', 'username');
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new lecture(s)
router.post('/', async (req, res) => {
  try {
    const savedLectures = [];
    if (Array.isArray(req.body)) {
      const lectures = req.body;
      for (const lectureData of lectures) {
        const lecture = new Lecture(lectureData);
        await lecture.save();
        savedLectures.push(lecture);
      }
    } else {
      const lecture = new Lecture(req.body);
      await lecture.save();
      savedLectures.push(lecture);
    }
    res.status(201).json(savedLectures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
