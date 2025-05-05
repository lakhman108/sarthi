const express = require('express');
const router = express.Router();
const Enrollment = require('../models/enrollmentmodel');
const Course = require('../models/coursemodel');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       required:
 *         - studentId
 *         - courseId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         studentId:
 *           type: string
 *           description: ID of the enrolled student
 *         courseId:
 *           type: string
 *           description: ID of the course the student is enrolled in
 *         notes:
 *           type: string
 *           description: Student's personal notes for the course
 *         lecturesWatched:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               lectureId:
 *                 type: string
 *               watchedDuration:
 *                 type: number
 *           description: Tracking data of student's progress through lectures
 *       example:
 *         studentId: 60d21b4667d0d8992e610c85
 *         courseId: 60d21b4667d0d8992e610c86
 *         notes: "Important concepts to remember: variables, functions, and classes."
 */

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Course enrollment management endpoints
 */

/**
 * @swagger
 * /api/enrollments/join:
 *   post:
 *     summary: Join a course using an invite code
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 description: Course invite code
 *     responses:
 *       201:
 *         description: Successfully enrolled in the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 courseId:
 *                   type: string
 *       400:
 *         description: Already enrolled in this course
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invalid invite code
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Create a new enrollment using class code
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classCode
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student to enroll
 *               classCode:
 *                 type: string
 *                 description: Course class code
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments
 *     tags: [Enrollments]
 *     responses:
 *       200:
 *         description: List of all enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get all enrollments for a student
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Student ID
 *     responses:
 *       200:
 *         description: List of enrollments for the student
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: No enrollments found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/enrollments/{id}/notes:
 *   get:
 *     summary: Get course notes for the authenticated user
 *     tags: [Enrollments]
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
 *         description: Enrollment record with notes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/enrollments/{id}/notes:
 *   patch:
 *     summary: Update course notes for the authenticated user
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Updated notes content
 *     responses:
 *       200:
 *         description: Notes updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Delete an enrollment
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Server error
 */
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
