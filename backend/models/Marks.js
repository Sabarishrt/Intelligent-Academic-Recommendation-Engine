const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  maxMarks: {
    type: Number,
    default: 100,
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
  },
  semester: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  examType: {
    type: String,
    enum: ['midterm', 'final', 'assignment', 'project'],
    default: 'final',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate grade before saving
marksSchema.pre('save', function (next) {
  const percentage = (this.marks / this.maxMarks) * 100;
  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C+';
  else if (percentage >= 40) this.grade = 'C';
  else if (percentage >= 30) this.grade = 'D';
  else this.grade = 'F';
  next();
});

// Index for efficient queries
marksSchema.index({ student: 1, subject: 1, semester: 1 });

module.exports = mongoose.model('Marks', marksSchema);
