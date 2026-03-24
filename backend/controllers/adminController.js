const User = require('../models/User');
const Subject = require('../models/Subject');
const Marks = require('../models/Marks');
const Skills = require('../models/Skills');
const Recommendation = require('../models/Recommendation');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboard = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSubjects = await Subject.countDocuments();
    const totalMarks = await Marks.countDocuments();
    const totalRecommendations = await Recommendation.countDocuments();

    // Get recent students
    const recentStudents = await User.find({ role: 'student' })
      .sort('-createdAt')
      .limit(5)
      .select('name email studentId department year createdAt');

    // Get students with low performance
    const allMarks = await Marks.find().populate('student', 'name email');
    const studentPerformance = {};

    // Guard against orphaned marks (marks without a populated student)
    allMarks.forEach(mark => {
      if (!mark.student) {
        console.warn('Warning: Found mark record with null student reference');
        return; // skip orphaned record
      }

      const studentId = mark.student._id.toString();
      if (!studentPerformance[studentId]) {
        studentPerformance[studentId] = {
          student: mark.student,
          marks: [],
          average: 0,
        };
      }
      studentPerformance[studentId].marks.push((mark.marks / mark.maxMarks) * 100);
    });

    // Calculate averages (only when marks exist)
    Object.keys(studentPerformance).forEach(studentId => {
      const marks = studentPerformance[studentId].marks;
      if (marks.length > 0) {
        studentPerformance[studentId].average = marks.reduce((a, b) => a + b, 0) / marks.length;
      }
    });

    const lowPerformers = Object.values(studentPerformance)
      .filter(sp => sp.average < 50)
      .slice(0, 5)
      .map(sp => ({
        student: sp.student,
        average: Math.round(sp.average * 100) / 100,
      }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalSubjects,
          totalMarks,
          totalRecommendations,
        },
        recentStudents,
        lowPerformers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
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

// @desc    Get students filtered by year and department
// @route   GET /api/admin/students-filter
// @access  Private (Admin)
exports.getStudentsByYearAndDepartment = async (req, res, next) => {
  try {
    const { year, department } = req.query;
    const filter = { role: 'student' };

    if (year) filter.year = year;
    if (department) filter.department = department;

    const students = await User.find(filter).select('name email studentId department year');
    const count = students.length;

    res.status(200).json({
      success: true,
      count,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
exports.getStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const marks = await Marks.find({ student: req.params.id })
      .populate('subject', 'name code');
    
    const skills = await Skills.findOne({ student: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        student,
        marks,
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subject
// @route   POST /api/admin/subjects
// @access  Private (Admin)
exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);

    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private (Admin)
exports.getAllSubjects = async (req, res, next) => {
  try {
    const features = new APIFeatures(Subject.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const subjects = await features.query;

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/admin/subjects/:id
// @access  Private (Admin)
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private (Admin)
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' });
    const marks = await Marks.find().populate('subject', 'name');
    const subjects = await Subject.find();

    // Subject-wise performance
    const subjectStats = {};
    marks.forEach(mark => {
      const subjectName = mark.subject.name;
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          name: subjectName,
          totalStudents: 0,
          totalMarks: 0,
          average: 0,
          passCount: 0,
          failCount: 0,
        };
      }
      subjectStats[subjectName].totalStudents++;
      const percentage = (mark.marks / mark.maxMarks) * 100;
      subjectStats[subjectName].totalMarks += percentage;
      if (percentage >= 50) {
        subjectStats[subjectName].passCount++;
      } else {
        subjectStats[subjectName].failCount++;
      }
    });

    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.average = stats.totalMarks / stats.totalStudents;
    });

    // Department distribution
    const departmentStats = {};
    students.forEach(student => {
      const dept = student.department || 'Unknown';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });

    // Year distribution
    const yearStats = {};
    students.forEach(student => {
      const year = student.year || 'Unknown';
      yearStats[year] = (yearStats[year] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        subjectStats: Object.values(subjectStats),
        departmentStats,
        yearStats,
        totalStudents: students.length,
        totalSubjects: subjects.length,
        totalMarks: marks.length,
      },
    });
  } catch (error) {
    next(error);
  }
  exports.getStudentsByYearAndDepartment = async (req, res, next) => {
  try {
    const { year, department } = req.query;
    const filter = { role: 'student' };

    if (year) filter.year = year;
    if (department) filter.department = department;

    const students = await User.find(filter).select('name email studentId department year');
    const count = students.length;

    res.status(200).json({
      success: true,
      count,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};
};
