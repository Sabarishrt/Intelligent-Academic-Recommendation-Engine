const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllStudents,
  getStudent,
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudent);
router.post('/subjects', createSubject);
router.get('/subjects', getAllSubjects);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);
router.get('/analytics', getAnalytics);

module.exports = router;
