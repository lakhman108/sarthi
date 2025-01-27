const express = require('express');
const router = express.Router();
const Enrollment = require('../models/enrollmentmodel');
const Course = require('../models/coursemodel');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/join', authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
    try {
        console.log(`[AUTH] User ${req.user.userId} attempting to join course`);
        const { inviteCode } = req.body;
        console.log(`[ENROLL] Processing invite code: ${inviteCode}`);

        const course = await Course.findOne({ classCode: inviteCode });
        console.log(`[DB] Course lookup result for code ${inviteCode}:`, course ? course._id : 'not found');

        if (!course) {
            console.log(`[ERROR] Invalid invite code: ${inviteCode}`);
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        const existingEnrollment = await Enrollment.findOne({
            studentId: req.user.userId,
            courseId: course._id
        });
        console.log(`[DB] Existing enrollment check:`, existingEnrollment ? 'found' : 'not found');

        if (existingEnrollment) {
            console.log(`[ENROLL] User ${req.user.userId} already enrolled in course ${course._id}`);
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        const enrollment = new Enrollment({
            studentId: req.user.userId,
            courseId: course._id
        });

        await enrollment.save();
        console.log(`[DB] New enrollment created: ${enrollment._id}`);

        res.status(201).json({
            message: 'Successfully enrolled',
            courseId: course._id
        });
    } catch (error) {
        console.error(`[ERROR] Course join failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        console.log(`[ENROLL] Creating enrollment with class code: ${req.body.classCode}`);

        const course = await Course.findOne({ classCode: req.body.classCode });
        console.log(`[DB] Found course:`, course ? course._id : 'not found');

        const payload = {
            studentId: req.body.studentId,
            courseId: course._id
        };

        const enrollment = new Enrollment(payload);
        const response = await enrollment.save();
        console.log(`[DB] Enrollment created: ${response._id}`);

        res.status(201).json(response);
    } catch (error) {
        console.error(`[ERROR] Create enrollment failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        console.log(`[DB] Fetching all enrollments`);
        const enrollments = await Enrollment.find().populate('studentId courseId lecturesWatched.lectureId');
        console.log(`[DB] Found ${enrollments.length} enrollments`);
        res.json(enrollments);
    } catch (error) {
        console.error(`[ERROR] Fetch enrollments failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        console.log(`[DB] Fetching enrollments for student: ${req.params.id}`);
        const enrollment = await Enrollment.find({studentId:req.params.id})
            .populate('studentId courseId lecturesWatched.lectureId');
        console.log(`[DB] Found ${enrollment ? enrollment.length : 0} enrollments`);

        if (!enrollment) {
            console.log(`[DB] No enrollments found for student: ${req.params.id}`);
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json(enrollment);
    } catch (error) {
        console.error(`[ERROR] Fetch enrollment failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/notes', authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
    try {
        console.log(`[AUTH] User ${req.user.userId} requesting notes for course ${req.params.id}`);
        console.log(`[NOTES] Fetching enrollment notes`);

        const enrollment = await Enrollment.findOne({
            studentId: req.user.userId,
            courseId: req.params.id
        });
        console.log(`[DB] Enrollment lookup result:`, enrollment ? 'found' : 'not found');

        if (!enrollment) {
            console.log(`[ERROR] No enrollment found for user ${req.user.userId} in course ${req.params.id}`);
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json(enrollment);
    } catch (error) {
        console.error(`[ERROR] Fetch notes failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id/notes', authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
    try {
        console.log(`[AUTH] User ${req.user.userId} updating notes for course ${req.params.id}`);
        console.log(`[NOTES] Updating notes content`);

        const enrollment = await Enrollment.findOne({
            studentId: req.user.userId,
            courseId: req.params.id
        });
        console.log(`[DB] Found enrollment to update:`, enrollment ? enrollment._id : 'not found');

        enrollment.notes = req.body.notes;
        const updatedEnrollment = await enrollment.save();
        console.log(`[DB] Notes updated for enrollment: ${updatedEnrollment._id}`);

        res.json(updatedEnrollment);
    } catch (error) {
        console.error(`[ERROR] Update notes failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        console.log(`[DB] Attempting to delete enrollment: ${req.params.id}`);
        const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

        if (!enrollment) {
            console.log(`[ERROR] Enrollment not found: ${req.params.id}`);
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        console.log(`[DB] Successfully deleted enrollment: ${req.params.id}`);
        res.status(200).json({ message: 'Enrollment deleted' });
    } catch (error) {
        console.error(`[ERROR] Delete enrollment failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
