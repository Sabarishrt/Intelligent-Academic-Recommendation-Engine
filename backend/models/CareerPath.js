const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  requiredSubjects: [{
    type: String,
  }],
  requiredSkills: [{
    type: String,
  }],
  minMarks: {
    type: Number,
    default: 60,
  },
  category: {
    type: String,
    enum: ['engineering', 'data-science', 'research', 'business', 'design', 'other'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CareerPath', careerPathSchema);
