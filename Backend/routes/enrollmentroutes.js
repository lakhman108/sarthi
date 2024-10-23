const express = require('express');
const router = express.Router();
const Enrollment = require('../models/enrollmentmodel');
const Course = require('../models/coursemodel');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');


router.post('/join', authenticateToken,authorizeRole(['student', 'teacher']), async (req, res) => {
    try {
        console.log("join request called ");
      const { inviteCode } = req.body;
      console.log("invite code is ",inviteCode);

      // Find the course with the invite code
      const course = await Course.findOne({ classCode : inviteCode });
      console.log("course is ",course);
      if (!course) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }

      // Check if user is already enrolled
      const existingEnrollment = await Enrollment.findOne({
        studentId: req.user.userId,
        courseId: course._id
      });

      if (existingEnrollment) {
        return res.status(400).json({ error: 'Already enrolled in this course' });
      }

      // Create new enrollment
      const enrollment = new Enrollment({
        studentId: req.user.userId,
        courseId: course._id
      });

      await enrollment.save();
      res.status(201).json({
        message: 'Successfully enrolled',
        courseId: course._id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
// Create a new enrollment or enrollments
router.post('/', async (req, res) => {

  try{
    const payload={
        studentId:req.body.studentId
    };
    const course=await Course.findOne({classCode:req.body.classCode});
    console.log(course);

    payload.courseId=course._id;

    const enrollment=new Enrollment(payload);
    const response=await enrollment.save();
    console.log("\n\n\n")
    console.log(response);
    console.log("\n\n\n")

    res.status(201).json(response);
  }
catch(error){
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
        const enrollment = await Enrollment.find({studentId:req.params.id}).populate('studentId courseId lecturesWatched.lectureId');

        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//get notes of enrrollment
router.get('/:id/notes',authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
    try {
        console.log("\n\n\n")
        console.log("finding enrolled classes notes");
        console.log("\n\n\n")
        const enrollment = await Enrollment.findOne({studentId: req.user.userId,courseId: req.params.id});
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
//to save notes
router.patch('/:id/notes',authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({studentId: req.user.userId,courseId: req.params.id});
        enrollment.notes=req.body.notes;
        const updatedEnrollment = await enrollment.save();
        if (!updatedEnrollment) return res.status(404).json({ error: 'Enrollment not found' });
        res.json(updatedEnrollment);
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
