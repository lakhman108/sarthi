const express = require("express");
const router = express.Router();
const Lecture = require("../models/lecturemodel.js");
const fs = require("fs");
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

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

router.get("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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

router.get("/course/:courseId", async (req, res) => {
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

router.patch("/:id/like", async (req, res) => {
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

router.patch("/:id/view", async (req, res) => {
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

router.get("/:id/comments", async (req, res) => {
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

router.post('/:lectureid/comments', authenticateToken, authorizeRole(['student', 'teacher']), async (req, res) => {
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

router.patch("/:id/update", async (req, res) => {
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
