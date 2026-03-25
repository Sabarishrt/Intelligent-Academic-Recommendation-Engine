const express = require('express');
const router = express.Router();
const {
  getCourseRecommendations,
  getRecommendations,
  generateRecommendations,
  markAsViewed,
} = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('student'));

// Get all recommendations for student
router.get('/', getRecommendations);
// Generate and save recommendations
router.post('/generate', generateRecommendations);
// Get course recommendations (doesn't save, just returns recommendations)
router.post('/courses', getCourseRecommendations);
// Mark recommendation as viewed
router.put('/:id/view', markAsViewed);

module.exports = router;
