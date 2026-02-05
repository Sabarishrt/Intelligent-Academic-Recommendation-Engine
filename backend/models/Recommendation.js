const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['subject-improvement', 'career-path', 'skill-development', 'academic-plan'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  careerPath: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
  },
  reasoning: {
    type: String,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  isViewed: {
    type: Boolean,
    default: false,
  },
});

recommendationSchema.index({ student: 1, generatedAt: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
