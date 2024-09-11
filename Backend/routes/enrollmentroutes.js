const express = require('express');
const router = express.Router();
const Enrollment = require('../models/enrollmentmodel'); 

// Create a new enrollment or enrollments
router.post('/', async (req, res) => {
    try{
        console.log("api called");
        const savedEnrollments = [];
        if (Array.isArray(req.body)) {
            const enrollments = req.body;
            for (const enrollmentData of enrollments) {
                console.log(enrollmentData);
                const enrollment = new Enrollment(enrollmentData);
                await enrollment.save();
                savedEnrollments.push(enrollment);
            }
        } else {
            const enrollment = new Enrollment(req.body);
            await enrollment.save();
            savedEnrollments.push(enrollment);
        }
        res.status(201).json(savedEnrollments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all enrollments
router.get('/', async (req, res) => {
    try {
        const enrollments = await Enrollment.find().populate('studentId courseId lecturesWatched.lectureId');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific enrollment by ID
router.get('/:id', async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id).populate('studentId courseId lecturesWatched.lectureId');
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an enrollment by ID
router.patch('/:id', async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an enrollment by ID
router.delete('/:id', async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        res.status(200).json({ message: 'Enrollment deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
