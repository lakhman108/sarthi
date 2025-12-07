const express = require("express");
const router = express.Router();
const Lecture = require("../models/lecturemodel.js");
const fs = require("fs");
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { checkLectureAccess, checkCourseAccess, checkLectureTeacherAccess } = require('../middleware/enrollmentMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         userId:
 *           type: string
 *           description: ID of the user who made the comment
 *         text:
 *           type: string
 *           description: Comment content
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Comment creation timestamp
 *       example:
 *         userId: 60d21b4667d0d8992e610c85
 *         text: This lecture was very informative!
 *         createdAt: 2025-05-05T12:00:00Z
 * 
 *     Lecture:
 *       type: object
 *       required:
 *         - nameOfTopic
 *         - courseId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         nameOfTopic:
 *           type: string
 *           description: Name/title of the lecture
 *         courseId:
 *           type: string
 *           description: ID of the course this lecture belongs to
 *         videoLink:
 *           type: string
 *           description: URL to the lecture video
 *         noOfLikes:
 *           type: number
 *           description: Number of likes for this lecture
 *         noOfViews:
 *           type: number
 *           description: Number of views for this lecture
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *           description: Comments made on this lecture
 *       example:
 *         nameOfTopic: Introduction to Variables
 *         courseId: 60d21b4667d0d8992e610c85
 *         videoLink: http://example.com/api/hls/videos/lecture1/master.m3u8
 *         noOfLikes: 42
 *         noOfViews: 156
 */

/**
 * @swagger
 * tags:
 *   name: Lectures
 *   description: Lecture management endpoints
 */

/**
 * @swagger
 * /api/lectures:
 *   get:
 *     summary: Get all lectures
 *     tags: [Lectures]
 *     responses:
 *       200:
 *         description: List of all lectures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lecture'
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
    try {
        console.log(`[DB] Fetching all lectures`);
        const lectures = await Lecture.find().populate("comments.userId", "username");
        console.log(`[DB] Found ${lectures.length} lectures`);
        res.json(lectures);
    } catch (error) {
        console.error(`[ERROR] Fetch lectures failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures/{id}:
 *   get:
 *     summary: Get lecture by ID
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lecture ID
 *     responses:
 *       200:
 *         description: Lecture details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lecture'
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authenticateToken, authorizeRole(['student', 'teacher']), checkLectureAccess, async (req, res) => {
    try {
        console.log(`[DB] Fetching lecture: ${req.params.id}`);
        const lecture = await Lecture.findById(req.params.id).populate("comments.userId", "username");

        if (!lecture) {
            console.log(`[DB] Lecture not found: ${req.params.id}`);
            return res.status(404).json({ error: "Lecture not found" });
        }
        console.log(`[DB] Found lecture: ${lecture.nameOfTopic}`);
        res.json(lecture);
    } catch (error) {
        console.error(`[ERROR] Fetch lecture failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures/{id}:
 *   delete:
 *     summary: Delete a lecture
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lecture ID
 *     responses:
 *       200:
 *         description: Lecture successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticateToken, authorizeRole(['teacher']), checkLectureTeacherAccess, async (req, res) => {
    try {
        console.log(`[DB] Attempting to delete lecture: ${req.params.id}`);
        const lecture = await Lecture.findByIdAndDelete(req.params.id);

        if (!lecture) {
            console.log(`[DB] Lecture not found: ${req.params.id}`);
            return res.status(404).json({ error: "Lecture not found" });
        }

        const str = lecture.videoLink;
        const finalString = str
            .replace(`${process.env.HOST}/api`, "public")
            .replace("master.m3u8", "");

        console.log(`[FS] Deleting lecture files: ${finalString}`);
        fs.rm(finalString, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error(`[ERROR] File deletion failed:`, err);
                throw err;
            }
            console.log(`[FS] Successfully deleted: ${finalString}`);
        });

        console.log(`[DB] Lecture deleted: ${req.params.id}`);
        res.status(200).json({ message: "Lecture deleted" });
    } catch (error) {
        console.error(`[ERROR] Delete lecture failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures/course/{courseId}:
 *   get:
 *     summary: Get all lectures for a specific course
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of lectures for the specified course
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lecture'
 *       500:
 *         description: Server error
 */
router.get("/course/:courseId", authenticateToken, authorizeRole(['student', 'teacher']), checkCourseAccess, async (req, res) => {
    try {
        console.log(`[DB] Fetching lectures for course: ${req.params.courseId}`);
        const lectures = await Lecture.find({courseId: req.params.courseId})
            .populate("comments.userId", "username");
        console.log(`[DB] Found ${lectures.length} lectures`);
        res.json(lectures);
    } catch (error) {
        console.error(`[ERROR] Fetch course lectures failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures:
 *   post:
 *     summary: Create one or more lectures
 *     tags: [Lectures]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Lecture'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/Lecture'
 *     responses:
 *       201:
 *         description: Lecture(s) created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lecture'
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
    try {
        console.log(`[LECTURE] Creating new lecture(s)`);
        const savedLectures = [];

        if (Array.isArray(req.body)) {
            console.log(`[DB] Creating ${req.body.length} lectures`);
            for (const lectureData of req.body) {
                const lecture = new Lecture(lectureData);
                await lecture.save();
                savedLectures.push(lecture);
                console.log(`[DB] Lecture created: ${lecture._id}`);
            }
        } else {
            console.log(`[DB] Creating single lecture`);
            const lecture = new Lecture(req.body);
            await lecture.save();
            savedLectures.push(lecture);
            console.log(`[DB] Lecture created: ${lecture._id}`);
        }
        res.status(201).json(savedLectures);
    } catch (error) {
        console.error(`[ERROR] Create lecture failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures/{id}/like:
 *   patch:
 *     summary: Increment the like count for a lecture
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lecture ID
 *     responses:
 *       200:
 *         description: Like count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lecture'
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/like", authenticateToken, authorizeRole(['student', 'teacher']), checkLectureAccess, async (req, res) => {
    try {
        console.log(`[LIKE] Processing like for lecture: ${req.params.id}`);
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            console.log(`[DB] Lecture not found: ${req.params.id}`);
            return res.status(404).json({ error: "Lecture not found" });
        }

        console.log(`[LIKE] Current likes: ${lecture.noOfLikes}`);
        lecture.noOfLikes = (lecture.noOfLikes || 0) + 1;
        console.log(`[LIKE] Updated likes: ${lecture.noOfLikes}`);

        await lecture.save();
        console.log(`[DB] Likes updated for lecture: ${req.params.id}`);
        res.json(lecture);
    } catch (error) {
        console.error(`[ERROR] Like update failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures/{id}/view:
 *   patch:
 *     summary: Increment the view count for a lecture
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lecture ID
 *     responses:
 *       200:
 *         description: View count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lecture'
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/view", authenticateToken, authorizeRole(['student', 'teacher']), checkLectureAccess, async (req, res) => {
    try {
        console.log(`[VIEW] Processing view for lecture: ${req.params.id}`);
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            console.log(`[DB] Lecture not found: ${req.params.id}`);
            return res.status(404).json({ error: "Lecture not found" });
        }

        console.log(`[VIEW] Current views: ${lecture.noOfViews}`);
        lecture.noOfViews = (lecture.noOfViews || 0) + 1;
        console.log(`[VIEW] Updated views: ${lecture.noOfViews}`);

        await lecture.save();
        console.log(`[DB] Views updated for lecture: ${req.params.id}`);
        res.json(lecture);
    } catch (error) {
        console.error(`[ERROR] View update failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures/{id}/comments:
 *   get:
 *     summary: Get all comments for a lecture
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lecture ID
 *     responses:
 *       200:
 *         description: List of comments for the lecture
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Server error
 */
router.get("/:id/comments", authenticateToken, authorizeRole(['student', 'teacher']), checkLectureAccess, async (req, res) => {
    try {
        console.log(`[COMMENT] Fetching comments for lecture: ${req.params.id}`);
        const lecture = await Lecture.findById(req.params.id)
            .populate({
                path: "comments.userId",
                select: "username profilePictureImageLink"
            });

        if (!lecture) {
            console.log(`[DB] Lecture not found: ${req.params.id}`);
            return res.status(404).json({ error: "Lecture not found" });
        }

        console.log(`[COMMENT] Found ${lecture.comments.length} comments`);
        res.json(lecture.comments);
    } catch (error) {
        console.error(`[ERROR] Fetch comments failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures/{lectureid}/comments:
 *   post:
 *     summary: Add a comment to a lecture
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lectureid
 *         schema:
 *           type: string
 *         required: true
 *         description: Lecture ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The comment text
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Server error
 */
router.post('/:lectureid/comments', authenticateToken, authorizeRole(['student', 'teacher']), checkLectureAccess, async (req, res) => {
    try {
        console.log(`[AUTH] User ${req.user.userId} adding comment to lecture: ${req.params.lectureid}`);
        const lecture = await Lecture.findById(req.params.lectureid)
            .populate("comments.userId", "username");

        if (!lecture) {
            console.log(`[DB] Lecture not found: ${req.params.lectureid}`);
            return res.status(404).json({ error: 'Lecture not found' });
        }

        console.log(`[COMMENT] Adding comment to lecture: ${lecture.nameOfTopic}`);
        const commentdata = {
            userId: req.user.userId,
            text: req.body.text
        };

        lecture.comments.push(commentdata);
        await lecture.save();
        console.log(`[DB] Comment added to lecture: ${req.params.lectureid}`);

        const updatedComments = await Lecture.findById(req.params.lectureid)
            .populate("comments.userId", "username");
        console.log(`[COMMENT] Returning ${updatedComments.comments.length} comments`);

        res.json(updatedComments.comments);
    } catch (error) {
        console.error(`[ERROR] Add comment failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/lectures/{id}/update:
 *   patch:
 *     summary: Update lecture information
 *     tags: [Lectures]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lecture ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameOfTopic:
 *                 type: string
 *                 description: Updated lecture title/topic name
 *               videoLink:
 *                 type: string
 *                 description: Updated video link
 *     responses:
 *       200:
 *         description: Lecture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Lecture not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/update", authenticateToken, authorizeRole(['teacher']), checkLectureTeacherAccess, async (req, res) => {
    try {
        console.log(`[LECTURE] Updating lecture: ${req.params.id}`);
        console.log(`[DB] Update payload:`, req.body);

        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            console.log(`[DB] Lecture not found: ${req.params.id}`);
            return res.status(404).json({ error: "Lecture not found" });
        }

        console.log(`[DB] Current lecture data:`, {
            nameOfTopic: lecture.nameOfTopic,
            videoLink: lecture.videoLink
        });

        lecture.nameOfTopic = req.body.nameOfTopic || lecture.nameOfTopic;
        lecture.videoLink = req.body.videoLink || lecture.videoLink;

        await lecture.save();
        console.log(`[DB] Lecture updated successfully: ${req.params.id}`);

        res.status(200).json({ message: "Lecture edited" });
    } catch (error) {
        console.error(`[ERROR] Update lecture failed:`, error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
