const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getMarks,
  addMarks,
  getPerformance,
  getSkills,
  updateSkills,
  getAllStudents,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student routes
router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);
router.get('/marks', protect, authorize('student'), getMarks);
router.post('/marks', protect, authorize('student'), addMarks);
router.get('/performance', protect, authorize('student'), getPerformance);
router.get('/skills', protect, authorize('student'), getSkills);
router.put('/skills', protect, authorize('student'), updateSkills);

// Public route for students to get all subjects
const { getAllSubjectsForStudents } = require('../controllers/studentController');
router.get('/subjects', getAllSubjectsForStudents);

// Admin route to get all students
router.get('/', protect, authorize('admin'), getAllStudents);

module.exports = router;
