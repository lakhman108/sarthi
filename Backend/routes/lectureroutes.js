const express = require("express");
const router = express.Router();
const Lecture = require("../models/lecturemodel.js");
const fs = require("fs");
// Get all lectures
router.get("/", async (req, res) => {
	try {
		const lectures = await Lecture.find().populate(
			"comments.userId",
			"username",
		);
		res.json(lectures);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Get lecture by ID
router.get("/:id", async (req, res) => {
	try {
		const lecture = await Lecture.findById(req.params.id).populate(
			"comments.userId",
			"username",
		);
		if (!lecture) return res.status(404).json({ error: "Lecture not found" });
		res.json(lecture);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const lecture = await Lecture.findByIdAndDelete(req.params.id);

		if (!lecture) return res.status(404).json({ error: "Lecture not found" });
		console.log(lecture);

		const str = lecture.videoLink;
		const finalString = str
			.replace("http://localhost:3000/api", "public")
			.replace("master.m3u8", "");
		fs.rm(finalString, { recursive: true, force: true }, (err) => {
			if (err) {
				throw err;
			}
			console.log(`${finalString} is deleted!`);
		});

		console.log(finalString);

		res.status(200).json({ message: "Lecture deleted" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});
// Get lectures by course ID
router.get("/course/:courseId", async (req, res) => {
	try {
		const lectures = await Lecture.find({
			courseId: req.params.courseId,
		}).populate("comments.userId", "username");
		res.json(lectures);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Create new lecture(s)
router.post("/", async (req, res) => {
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

// Increment like count for a lecture
router.patch("/:id/like", async (req, res) => {
	try {
		const lecture = await Lecture.findById(req.params.id);
		if (!lecture) return res.status(404).json({ error: "Lecture not found" });
		console.log(lecture.noOfLikes);
		lecture.noOfLikes = (lecture.noOfLikes || 0) + 1;
		console.log(lecture.noOfLikes);
		await lecture.save();

		res.json(lecture);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.patch('/:id/comment', async (req, res) => {

    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

        lecture.comments.push(req.body);
        await lecture.save();

        res.json(lecture);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/:id/update", async (req, res) => {
	try {
		const lecture = await Lecture.findById(req.params.id);

		if (!lecture) return res.status(404).json({ error: "Lecture not found" });
		lecture.nameOfTopic = req.body.nameOfTopic || lecture.nameOfTopic;
		lecture.videoLink = req.body.videoLink || lecture.videoLink;

		await lecture.save();

		res.status(200).json({ message: "Lecture edited" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
