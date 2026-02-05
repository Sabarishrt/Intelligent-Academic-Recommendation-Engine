const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CareerPath = require('../models/CareerPath');

dotenv.config();

const careerPaths = [
  {
    name: 'Software Developer',
    description: 'Build and maintain software applications. Focus on programming languages, algorithms, and software engineering principles.',
    requiredSubjects: ['Java', 'Data Structures', 'Algorithms', 'Programming'],
    requiredSkills: ['Java', 'Programming', 'Problem Solving'],
    minMarks: 70,
    category: 'engineering',
  },
  {
    name: 'Data Scientist',
    description: 'Analyze complex data to extract insights. Requires strong mathematical and statistical foundation.',
    requiredSubjects: ['Mathematics', 'Statistics', 'Data Science'],
    requiredSkills: ['Python', 'Statistics', 'Machine Learning'],
    minMarks: 75,
    category: 'data-science',
  },
  {
    name: 'Web Developer',
    description: 'Create and maintain websites and web applications. Focus on frontend and backend technologies.',
    requiredSubjects: ['Web Development', 'Programming', 'Database'],
    requiredSkills: ['JavaScript', 'HTML', 'CSS', 'Web Development'],
    minMarks: 65,
    category: 'engineering',
  },
  {
    name: 'Machine Learning Engineer',
    description: 'Design and implement machine learning systems. Requires strong background in mathematics and programming.',
    requiredSubjects: ['Mathematics', 'Machine Learning', 'Statistics'],
    requiredSkills: ['Python', 'Machine Learning', 'Deep Learning'],
    minMarks: 75,
    category: 'data-science',
  },
  {
    name: 'Research Scientist',
    description: 'Conduct research in academic or industrial settings. Requires strong analytical and research skills.',
    requiredSubjects: ['Research Methods', 'Statistics', 'Domain Knowledge'],
    requiredSkills: ['Research', 'Analytical Thinking', 'Writing'],
    minMarks: 80,
    category: 'research',
  },
];

const seedCareerPaths = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic-recommendation');
    console.log('MongoDB Connected');

    await CareerPath.deleteMany({});
    console.log('Cleared existing career paths');

    await CareerPath.insertMany(careerPaths);
    console.log('Career paths seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding career paths:', error);
    process.exit(1);
  }
};

seedCareerPaths();
