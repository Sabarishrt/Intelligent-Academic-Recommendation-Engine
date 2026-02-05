const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  generateRecommendations,
  markAsViewed,
} = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('student'));

router.get('/', getRecommendations);
router.post('/generate', generateRecommendations);
router.put('/:id/view', markAsViewed);

module.exports = router;
