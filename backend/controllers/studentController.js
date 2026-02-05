// @desc    Get all subjects (for students)
// @route   GET /api/students/subjects
// @access  Public (Student)
exports.getAllSubjectsForStudents = async (req, res, next) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};
const User = require('../models/User');
const Marks = require('../models/Marks');
const Skills = require('../models/Skills');
const Subject = require('../models/Subject');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Student)
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      department: req.body.department,
      year: req.body.year,
      interests: req.body.interests,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student marks
// @route   GET /api/students/marks
// @access  Private (Student)
exports.getMarks = async (req, res, next) => {
  try {
    const marks = await Marks.find({ student: req.user.id })
      .populate('subject', 'name code credits')
      .sort('-semester -year');

    res.status(200).json({
      success: true,
      count: marks.length,
      data: marks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add marks
// @route   POST /api/students/marks
// @access  Private (Student)
exports.addMarks = async (req, res, next) => {
  try {
    const { subject, marks, maxMarks, semester, year, examType } = req.body;

    // Check if subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check if marks entry already exists
    const existingMarks = await Marks.findOne({
      student: req.user.id,
      subject,
      semester,
      examType,
    });

    if (existingMarks) {
      existingMarks.marks = marks;
      existingMarks.maxMarks = maxMarks || 100;
      existingMarks.year = year;
      await existingMarks.save();

      return res.status(200).json({
        success: true,
        data: existingMarks,
      });
    }

    const marksEntry = await Marks.create({
      student: req.user.id,
      subject,
      marks,
      maxMarks: maxMarks || 100,
      semester,
      year,
      examType: examType || 'final',
    });

    res.status(201).json({
      success: true,
      data: marksEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student performance analysis
// @route   GET /api/students/performance
// @access  Private (Student)
exports.getPerformance = async (req, res, next) => {
  try {
    const marks = await Marks.find({ student: req.user.id }).populate('subject', 'name code');

    // Calculate statistics
    const totalMarks = marks.length;
    const averageMarks = marks.length > 0
      ? marks.reduce((sum, m) => sum + (m.marks / m.maxMarks) * 100, 0) / marks.length
      : 0;

    // Group by subject
    const subjectPerformance = {};
    marks.forEach(mark => {
      const subjectName = mark.subject.name;
      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = {
          subject: subjectName,
          code: mark.subject.code,
          marks: [],
          average: 0,
        };
      }
      subjectPerformance[subjectName].marks.push({
        marks: mark.marks,
        maxMarks: mark.maxMarks,
        percentage: (mark.marks / mark.maxMarks) * 100,
        semester: mark.semester,
        examType: mark.examType,
      });
    });

    // Calculate average for each subject
    Object.keys(subjectPerformance).forEach(subject => {
      const subjectMarks = subjectPerformance[subject].marks;
      const avg = subjectMarks.reduce((sum, m) => sum + m.percentage, 0) / subjectMarks.length;
      subjectPerformance[subject].average = avg;
    });

    // Weak subjects (below 50%)
    const weakSubjects = Object.values(subjectPerformance)
      .filter(sub => sub.average < 50)
      .map(sub => ({ name: sub.subject, code: sub.code, average: sub.average }));

    // Strong subjects (above 80%)
    const strongSubjects = Object.values(subjectPerformance)
      .filter(sub => sub.average >= 80)
      .map(sub => ({ name: sub.subject, code: sub.code, average: sub.average }));

    res.status(200).json({
      success: true,
      data: {
        totalMarks,
        averageMarks: Math.round(averageMarks * 100) / 100,
        subjectPerformance: Object.values(subjectPerformance),
        weakSubjects,
        strongSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create student skills
// @route   GET /api/students/skills
// @access  Private (Student)
exports.getSkills = async (req, res, next) => {
  try {
    let skills = await Skills.findOne({ student: req.user.id });

    if (!skills) {
      skills = await Skills.create({ student: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student skills
// @route   PUT /api/students/skills
// @access  Private (Student)
exports.updateSkills = async (req, res, next) => {
  try {
    let skills = await Skills.findOne({ student: req.user.id });

    if (!skills) {
      skills = await Skills.create({
        student: req.user.id,
        technical: req.body.technical || [],
        soft: req.body.soft || [],
      });
    } else {
      skills.technical = req.body.technical || skills.technical;
      skills.soft = req.body.soft || skills.soft;
      skills.updatedAt = Date.now();
      await skills.save();
    }

    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (for admin)
// @route   GET /api/students
// @access  Private (Admin)
exports.getAllStudents = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find({ role: 'student' }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const students = await features.query;

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};
