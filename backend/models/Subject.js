const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide subject code'],
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide subject name'],
    trim: true,
  },
  department: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
  },
  category: {
    type: String,
    enum: ['core', 'elective', 'lab', 'project'],
    default: 'core',
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subject', subjectSchema);
