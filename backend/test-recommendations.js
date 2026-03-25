// Manual test for recommendation system
const recommendationService = require('./services/recommendationService');

// Test data
const testMarks = {
  'JavaScript': 85,
  'Python': 92,
  'Database': 45,
  'Java': 78,
  'Web Development': 88
};

const testSkills = [
  'javascript',
  'react',
  'node.js',
  'docker'
];

const testInterests = [
  'machine learning',
  'cloud computing',
  'devops'
];

console.log('=== Testing Recommendation System ===\n');

console.log('Test Input:');
console.log('Marks:', testMarks);
console.log('Skills:', testSkills);
console.log('Interests:', testInterests);
console.log('\n---\n');

recommendationService.generateCourseRecommendations(testMarks, testSkills, testInterests)
  .then(recommendations => {
    console.log('✅ Recommendations Generated Successfully:\n');
    console.log('Weak Subjects:', recommendations.weakSubjects);
    console.log('\nStrong Subjects:', recommendations.strongSubjects);
    console.log('\nRecommended Courses Count:', recommendations.recommendedCourses.length);
    
    console.log('\n📚 Course Recommendations:');
    recommendations.recommendedCourses.forEach((course, i) => {
      console.log(`\n${i + 1}. ${course.subject} (${course.level})`);
      console.log('   Courses:', course.courses.join(', '));
      console.log('   Reason:', course.reason);
    });

    console.log('\n🎯 Career Suggestions Count:', recommendations.careerSuggestions.length);
    recommendations.careerSuggestions.forEach((career, i) => {
      console.log(`\n${i + 1}. ${career.subject} (${career.score}%)`);
      console.log('   Careers:', career.suggestedCareers.join(', '));
    });

    console.log('\n📝 Summary:', recommendations.message);
  })
  .catch(error => {
    console.error('❌ Error generating recommendations:', error.message);
  });
