const Recommendation = require('../models/Recommendation');
const Marks = require('../models/Marks');
const Skills = require('../models/Skills');
const User = require('../models/User');
const CareerPath = require('../models/CareerPath');
const Subject = require('../models/Subject');
const recommendationService = require('../services/recommendationService');

// @desc    Get course recommendations based on student performance
// @route   POST /api/recommendations/courses
// @access  Private (Student)
exports.getCourseRecommendations = async (req, res, next) => {
  try {
    const { marks, skills, interests } = req.body;

    // Validate input
    if (!marks || typeof marks !== 'object' || Object.keys(marks).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Marks object is required and cannot be empty'
      });
    }

    // Ensure skills is an array, filter out empty values
    const skillsArray = Array.isArray(skills) 
      ? skills.filter(s => s && typeof s === 'string').map(s => s.trim()).filter(Boolean)
      : [];

    // Ensure interests is an array, filter out empty values
    const interestsArray = Array.isArray(interests)
      ? interests.filter(i => i && typeof i === 'string').map(i => i.trim()).filter(Boolean)
      : [];

    console.log('Course recommendation request:', { marksKeys: Object.keys(marks), skillsCount: skillsArray.length, interestsCount: interestsArray.length });

    // Generate course recommendations
    const recommendations = await recommendationService.generateCourseRecommendations(
      marks,
      skillsArray,
      interestsArray
    );

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error in getCourseRecommendations:', error);
    next(error);
  }
};

// @desc    Get recommendations for student
// @route   GET /api/recommendations
// @access  Private (Student)
exports.getRecommendations = async (req, res, next) => {
  try {
    // Use lean() for read-only data and limit fields for better performance
    const recommendations = await Recommendation.find({ student: req.user.id })
      .select('title description priority type subjects careerPath reasoning generatedAt isViewed')
      .populate('subjects', 'name code')
      .populate('careerPath', 'name description')
      .sort('-generatedAt')
      .limit(50)  // Limit to prevent loading too much data
      .lean();    // Return plain JavaScript objects for better performance

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    next(error);
  }
};

// @desc    Generate recommendations for student
// @route   POST /api/recommendations/generate
// @access  Private (Student)
exports.generateRecommendations = async (req, res, next) => {
  try {
    // Get student data
    const student = await User.findById(req.user.id);
    const marks = await Marks.find({ student: req.user.id }).populate('subject', 'name code');
    const skills = await Skills.findOne({ student: req.user.id });
    const careerPaths = await CareerPath.find();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Prepare data for recommendation service
    const studentData = {
      studentId: student._id.toString(),
      marks: marks.map(m => ({
        subject: m.subject.name,
        code: m.subject.code,
        marks: m.marks,
        maxMarks: m.maxMarks,
        percentage: (m.marks / m.maxMarks) * 100,
        semester: m.semester,
      })),
      skills: skills ? {
        technical: skills.technical || [],
        soft: skills.soft || [],
      } : { technical: [], soft: [] },
      interests: student.interests || [],
      department: student.department,
    };

    // Delete previous recommendations for this student
    await Recommendation.deleteMany({ student: req.user.id });

    // Call Node.js service
    const result = await recommendationService.generate(student, marks, skills, careerPaths);

    // Validate recommendations before saving
    if (result.recommendations && Array.isArray(result.recommendations)) {
      // Ensure all recommendations have valid types
      result.recommendations.forEach(rec => {
        if (!rec.type) rec.type = 'academic-plan';
        rec.type = rec.type.toLowerCase().trim();
      });
    }

    // Save recommendations to database
    const savedRecommendations = await Recommendation.insertMany(result.recommendations).catch(err => {
      console.error('Error saving recommendations:', err);
      throw new Error(`Failed to save recommendations: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      weakSubjects: result.weakSubjects,
      strongSubjects: result.strongSubjects,
      recommendedSubjects: savedRecommendations,
      message: result.message
    });
  } catch (error) {
    console.error('Error in generateRecommendations:', error);
    next(error);
  }
};

// @desc    Mark recommendation as viewed
// @route   PUT /api/recommendations/:id/view
// @access  Private (Student)
exports.markAsViewed = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findByIdAndUpdate(
      req.params.id,
      { isViewed: true },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    next(error);
  }
};
