const Enrollment = require('../models/enrollmentmodel');
const Course = require('../models/coursemodel');
const Lecture = require('../models/lecturemodel');

/**
 * Middleware to check if user has access to a specific lecture
 * User has access if they are:
 * 1. The teacher of the course
 * 2. Enrolled as a student in the course
 */
const checkLectureAccess = async (req, res, next) => {
    try {
        const lectureId = req.params.id || req.params.lectureid;
        const userId = req.user.userId;

        console.log(`[ACCESS] Checking lecture access for user ${userId}, lecture ${lectureId}`);

        // Find the lecture and populate course info
        const lecture = await Lecture.findById(lectureId).populate('courseId');
        
        if (!lecture) {
            console.log(`[ACCESS] Lecture not found: ${lectureId}`);
            return res.status(404).json({ error: 'Lecture not found' });
        }

        const courseId = lecture.courseId._id;
        console.log(`[ACCESS] Lecture belongs to course: ${courseId}`);

        // Check if user is the teacher of the course
        if (lecture.courseId.teacherId.toString() === userId) {
            console.log(`[ACCESS] User is teacher - access granted`);
            return next();
        }

        // Check if user is enrolled in the course
        const enrollment = await Enrollment.findOne({
            studentId: userId,
            courseId: courseId
        });

        if (enrollment) {
            console.log(`[ACCESS] User is enrolled - access granted`);
            return next();
        }

        console.log(`[ACCESS] Access denied - user not enrolled and not teacher`);
        return res.status(403).json({ 
            error: 'Access denied. You must be enrolled in this course to view this lecture.' 
        });

    } catch (error) {
        console.error(`[ERROR] Lecture access check failed:`, error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Middleware to check if user has access to a specific course
 * User has access if they are:
 * 1. The teacher of the course
 * 2. Enrolled as a student in the course
 */
const checkCourseAccess = async (req, res, next) => {
    try {
        const courseId = req.params.id || req.params.courseId;
        const userId = req.user.userId;

        console.log(`[ACCESS] Checking course access for user ${userId}, course ${courseId}`);

        // Find the course
        const course = await Course.findById(courseId);
        
        if (!course) {
            console.log(`[ACCESS] Course not found: ${courseId}`);
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if user is the teacher of the course
        if (course.teacherId.toString() === userId) {
            console.log(`[ACCESS] User is teacher - access granted`);
            req.userRole = 'teacher';
            return next();
        }

        // Check if user is enrolled in the course
        const enrollment = await Enrollment.findOne({
            studentId: userId,
            courseId: courseId
        });

        if (enrollment) {
            console.log(`[ACCESS] User is enrolled - access granted`);
            req.userRole = 'student';
            return next();
        }

        console.log(`[ACCESS] Access denied - user not enrolled and not teacher`);
        return res.status(403).json({ 
            error: 'Access denied. You must be enrolled in this course to access it.' 
        });

    } catch (error) {
        console.error(`[ERROR] Course access check failed:`, error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Middleware to check if user is the teacher of a course
 * Used for operations that only teachers should perform
 */
const checkTeacherAccess = async (req, res, next) => {
    try {
        const courseId = req.params.id || req.params.courseId;
        const userId = req.user.userId;

        console.log(`[ACCESS] Checking teacher access for user ${userId}, course ${courseId}`);

        const course = await Course.findById(courseId);
        
        if (!course) {
            console.log(`[ACCESS] Course not found: ${courseId}`);
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.teacherId.toString() !== userId) {
            console.log(`[ACCESS] Access denied - user is not the teacher`);
            return res.status(403).json({ 
                error: 'Access denied. Only the course teacher can perform this action.' 
            });
        }

        console.log(`[ACCESS] Teacher access granted`);
        next();

    } catch (error) {
        console.error(`[ERROR] Teacher access check failed:`, error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Middleware to check if user is the teacher of the course that owns a lecture
 * Used for lecture modification operations (delete, update)
 */
const checkLectureTeacherAccess = async (req, res, next) => {
    try {
        const lectureId = req.params.id;
        const userId = req.user.userId;

        console.log(`[ACCESS] Checking lecture teacher access for user ${userId}, lecture ${lectureId}`);

        const lecture = await Lecture.findById(lectureId).populate('courseId');
        
        if (!lecture) {
            console.log(`[ACCESS] Lecture not found: ${lectureId}`);
            return res.status(404).json({ error: 'Lecture not found' });
        }

        if (lecture.courseId.teacherId.toString() !== userId) {
            console.log(`[ACCESS] Access denied - user is not the course teacher`);
            return res.status(403).json({ 
                error: 'Access denied. Only the course teacher can modify lectures.' 
            });
        }

        console.log(`[ACCESS] Lecture teacher access granted`);
        next();

    } catch (error) {
        console.error(`[ERROR] Lecture teacher access check failed:`, error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    checkLectureAccess,
    checkCourseAccess,
    checkTeacherAccess,
    checkLectureTeacherAccess
};
