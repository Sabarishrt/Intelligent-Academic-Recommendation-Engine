const Recommendation = require('../models/Recommendation');
const Marks = require('../models/Marks');
const Skills = require('../models/Skills');
const User = require('../models/User');
const CareerPath = require('../models/CareerPath');
const Subject = require('../models/Subject');
const axios = require('axios');

// @desc    Get recommendations for student
// @route   GET /api/recommendations
// @access  Private (Student)
exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.find({ student: req.user.id })
      .populate('subjects', 'name code')
      .populate('careerPath', 'name description')
      .sort('-generatedAt');

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
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

    // Prepare data for Python service
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

    // Call Python recommendation service
    let pythonRecommendations = [];
    try {
      const pythonResponse = await axios.post(
        process.env.PYTHON_SERVICE_URL || 'http://localhost:5000/recommend',
        studentData,
        { timeout: 10000 }
      );
      pythonRecommendations = pythonResponse.data.recommendations || [];
    } catch (error) {
      console.error('Python service error:', error.message);
      // Continue with rule-based recommendations if Python service fails
    }

    // Generate rule-based recommendations (fallback or additional)
    const recommendations = [];

    // 1. Subject improvement recommendations
    marks.forEach(mark => {
      const percentage = (mark.marks / mark.maxMarks) * 100;
      if (percentage < 50) {
        recommendations.push({
          student: req.user.id,
          type: 'subject-improvement',
          title: `Improve Performance in ${mark.subject.name}`,
          description: `Your current score is ${mark.marks}/${mark.maxMarks} (${percentage.toFixed(1)}%). Focus on improving this subject through regular practice and seeking help from instructors.`,
          priority: 'high',
          subjects: [mark.subject._id],
          reasoning: `Marks below 50% indicate weak performance in this subject.`,
        });
      }
    });

    // 2. Career path recommendations based on strong subjects
    const subjectAverages = {};
    marks.forEach(mark => {
      const subjectName = mark.subject.name;
      const percentage = (mark.marks / mark.maxMarks) * 100;
      if (!subjectAverages[subjectName]) {
        subjectAverages[subjectName] = [];
      }
      subjectAverages[subjectName].push(percentage);
    });

    Object.keys(subjectAverages).forEach(subject => {
      const avg = subjectAverages[subject].reduce((a, b) => a + b, 0) / subjectAverages[subject].length;
      subjectAverages[subject] = avg;
    });

    // Check for career paths (marks, skills, interests)
    for (const path of careerPaths) {
      const matchingSubjects = path.requiredSubjects.filter(subject =>
        Object.keys(subjectAverages).some(s => s.toLowerCase().includes(subject.toLowerCase()))
      );

      // Get missing required subjects that student doesn't have marks in
      const missingSubjects = path.requiredSubjects.filter(subject =>
        !Object.keys(subjectAverages).some(s => s.toLowerCase().includes(subject.toLowerCase()))
      );

      // Skill match: at least one required skill in student's technical or soft skills
      const studentSkills = [
        ...(skills?.technical?.map(s => s.skill.toLowerCase()) || []),
        ...(skills?.soft?.map(s => s.skill.toLowerCase()) || [])
      ];
      const matchingSkills = path.requiredSkills.filter(skill =>
        studentSkills.includes(skill.toLowerCase())
      );

      // Interest match: at least one interest matches career path name, category, or required skill
      const studentInterests = (student.interests || []).map(i => i.toLowerCase());
      const interestMatch =
        studentInterests.some(interest =>
          path.name.toLowerCase().includes(interest) ||
          (path.category && path.category.toLowerCase().includes(interest)) ||
          path.requiredSkills.some(skill => skill.toLowerCase().includes(interest))
        );

      // Marks-based recommendation (original logic)
      let avgMarks = 0;
      if (matchingSubjects.length > 0) {
        const relevantMarks = marks.filter(m =>
          matchingSubjects.some(subject => m.subject.name.toLowerCase().includes(subject.toLowerCase()))
        );
        avgMarks = relevantMarks.length > 0
          ? relevantMarks.reduce((sum, m) => sum + (m.marks / m.maxMarks) * 100, 0) / relevantMarks.length
          : 0;
      }

      // UPDATED LOGIC: Recommend career path only if:
      // 1. Strong marks in required subjects AND matched subjects exist, OR
      // 2. Matching skills (skills can compensate for subject marks), OR
      // 3. Interest match with matched subjects (must have at least some relevant subject marks)
      
      const hasStrongMarksInRelevantSubjects = matchingSubjects.length > 0 && avgMarks >= path.minMarks;
      const hasMatchingSkills = matchingSkills.length > 0;
      const hasInterestMatchWithSubjectMarks = interestMatch && matchingSubjects.length > 0;

      if (hasStrongMarksInRelevantSubjects || hasMatchingSkills || hasInterestMatchWithSubjectMarks) {
        let reasoning = [];
        if (matchingSubjects.length > 0 && avgMarks >= path.minMarks) {
          reasoning.push(`Strong performance in relevant subjects (${matchingSubjects.join(', ')}) with average of ${avgMarks.toFixed(1)}%.`);
        }
        if (matchingSkills.length > 0) {
          reasoning.push(`You have relevant skills: ${matchingSkills.join(', ')}.`);
        }
        if (interestMatch && matchingSubjects.length > 0) {
          reasoning.push(`Your interests align with this career path and you have subject knowledge.`);
        }
        recommendations.push({
          student: req.user.id,
          type: 'career-path',
          title: `Consider ${path.name} Career Path`,
          description: path.description,
          priority: 'medium',
          careerPath: path._id,
          reasoning: reasoning.join(' '),
        });
      }
      // If there's an interest match but NO relevant subject marks, recommend those subjects
      else if (interestMatch && missingSubjects.length > 0) {
        // Try to find Subject documents for the missing subject names
        const subjectDocs = await Subject.find({ name: { $in: missingSubjects } });
        const subjectIds = subjectDocs.map(s => s._id);

        recommendations.push({
          student: req.user.id,
          type: 'subject-improvement',
          title: `${path.name} Path - Study Required Subjects`,
          description: `You're interested in ${path.name}, but you haven't taken marks in the required subjects yet. Start with: ${missingSubjects.join(', ')}. Once you build a strong foundation in these subjects, you'll be well-prepared for this career path.`,
          priority: 'high',
          subjects: subjectIds,
          reasoning: `Interest in ${path.name} detected, but required subject knowledge is missing. Recommendation: study ${missingSubjects.join(', ')}.`,
        });
      }
    }

    // Merge Python recommendations if available
    if (pythonRecommendations.length > 0) {
      pythonRecommendations.forEach(rec => {
        recommendations.push({
          student: req.user.id,
          type: rec.type || 'academic-plan',
          title: rec.title,
          description: rec.description,
          priority: rec.priority || 'medium',
          reasoning: rec.reasoning,
        });
      });
    }

    // If no recommendations were generated at all, provide a fallback instruction
    if (recommendations.length === 0) {
      recommendations.push({
        student: req.user.id,
        type: 'general',
        title: 'Add academic data to get recommendations',
        description: 'No strong signals were found in your marks/skills/interests. Add marks and skills data then try again to generate personalized recommendations.',
        priority: 'low',
        reasoning: 'Fallback recommendation because no rule matched and Python service did not provide output.',
      });
    }

    // Save recommendations to database
    const savedRecommendations = await Recommendation.insertMany(recommendations);

    res.status(201).json({
      success: true,
      count: savedRecommendations.length,
      data: savedRecommendations,
    });
  } catch (error) {
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
