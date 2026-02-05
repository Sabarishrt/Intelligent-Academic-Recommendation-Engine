const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  technical: [{
    skill: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
  }],
  soft: [{
    skill: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Skills', skillsSchema);
