const Subject = require('../models/Subject');

class RecommendationService {
    /**
     * Course mapping for different subjects
     * Maps subject names to relevant courses based on difficulty level
     */
    getCourseMapping() {
        return {
            // Programming and Computer Science
            'Data Structures': {
                beginner: ['Introduction to Data Structures', 'Basic Algorithms'],
                advanced: ['Advanced Data Structures', 'Algorithm Design and Analysis']
            },
            'DSA': {
                beginner: ['Data Structures Basics', 'Problem Solving with DSA'],
                advanced: ['Advanced DSA', 'Competitive Programming']
            },
            'Java': {
                beginner: ['Java Fundamentals', 'Object-Oriented Programming in Java'],
                advanced: ['Advanced Java', 'Spring Boot Development']
            },
            'Python': {
                beginner: ['Python Basics', 'Python for Data Science'],
                advanced: ['Advanced Python', 'Machine Learning with Python']
            },
            'C++': {
                beginner: ['C++ Fundamentals', 'Object-Oriented Programming in C++'],
                advanced: ['Advanced C++', 'System Programming with C++']
            },
            'Web Development': {
                beginner: ['HTML & CSS Basics', 'JavaScript Fundamentals'],
                advanced: ['Full Stack Web Development', 'React & Node.js']
            },
            'Web': {
                beginner: ['Web Development Basics', 'Frontend Fundamentals'],
                advanced: ['Full Stack Web Development', 'Modern Web Technologies']
            },
            // Mathematics
            'Mathematics': {
                beginner: ['Basic Mathematics', 'Algebra Fundamentals'],
                advanced: ['Advanced Calculus', 'Discrete Mathematics']
            },
            'Calculus': {
                beginner: ['Calculus I', 'Differential Equations'],
                advanced: ['Advanced Calculus', 'Real Analysis']
            },
            'Linear Algebra': {
                beginner: ['Linear Algebra Basics', 'Matrix Theory'],
                advanced: ['Advanced Linear Algebra', 'Numerical Linear Algebra']
            },
            // Database
            'Database': {
                beginner: ['Database Fundamentals', 'SQL Basics'],
                advanced: ['Advanced Database Design', 'NoSQL Databases']
            },
            'SQL': {
                beginner: ['SQL Fundamentals', 'Database Design'],
                advanced: ['Advanced SQL', 'Database Administration']
            },
            // Other subjects
            'Operating Systems': {
                beginner: ['OS Fundamentals', 'Linux Basics'],
                advanced: ['Advanced Operating Systems', 'Distributed Systems']
            },
            'Computer Networks': {
                beginner: ['Network Fundamentals', 'TCP/IP Basics'],
                advanced: ['Advanced Networking', 'Network Security']
            },
            'Software Engineering': {
                beginner: ['Software Development Life Cycle', 'Requirements Engineering'],
                advanced: ['Advanced Software Engineering', 'DevOps Practices']
            }
        };
    }

    /**
     * Career path suggestions based on strong subjects
     */
    getCareerSuggestions() {
        return {
            'Data Structures': ['Software Engineer', 'Algorithm Specialist', 'Technical Architect'],
            'DSA': ['Software Engineer', 'Algorithm Specialist', 'Technical Architect'],
            'Java': ['Java Developer', 'Spring Boot Developer', 'Enterprise Software Engineer'],
            'Python': ['Data Scientist', 'Machine Learning Engineer', 'Python Developer'],
            'C++': ['Systems Programmer', 'Game Developer', 'Embedded Systems Engineer'],
            'Web Development': ['Full Stack Developer', 'Frontend Developer', 'Backend Developer'],
            'Web': ['Full Stack Developer', 'Frontend Developer', 'Backend Developer'],
            'Mathematics': ['Data Analyst', 'Research Scientist', 'Quantitative Analyst'],
            'Calculus': ['Research Scientist', 'Engineering Analyst', 'Financial Modeler'],
            'Linear Algebra': ['Data Scientist', 'Machine Learning Engineer', 'Computer Graphics Specialist'],
            'Database': ['Database Administrator', 'Data Engineer', 'Backend Developer'],
            'SQL': ['Database Administrator', 'Data Engineer', 'Business Intelligence Analyst'],
            'Operating Systems': ['Systems Administrator', 'DevOps Engineer', 'Kernel Developer'],
            'Computer Networks': ['Network Engineer', 'Security Analyst', 'Cloud Architect'],
            'Software Engineering': ['Software Architect', 'Project Manager', 'Quality Assurance Engineer']
        };
    }

    /**
     * Generate course recommendations based on student performance data
     * @param {Object} marks - Object with subject names as keys and scores as values
     * @param {Array} skills - Array of student skills
     * @param {Array} interests - Array of student interests
     * @returns {Object} { weakSubjects, strongSubjects, recommendedCourses, careerSuggestions, message }
     */
    async generateCourseRecommendations(marks, skills, interests) {
        try {
            const weakSubjects = [];
            const strongSubjects = [];
            const recommendedCourses = [];
            const careerSuggestions = [];

            const courseMapping = this.getCourseMapping();
            const careerMapping = this.getCareerSuggestions();

            // Analyze marks to identify weak and strong subjects
            for (const [subject, score] of Object.entries(marks)) {
                if (typeof score !== 'number') continue;

                if (score < 50) {
                    weakSubjects.push(subject);
                } else if (score >= 80) {
                    strongSubjects.push(subject);
                }
            }

            // Generate course recommendations based on subject performance
            const allSubjects = [...weakSubjects, ...strongSubjects];

            for (const subject of allSubjects) {
                const normalizedSubject = this.normalizeSubjectName(subject);
                const mapping = courseMapping[normalizedSubject];

                if (mapping) {
                    const isWeak = weakSubjects.includes(subject);
                    const courses = isWeak ? mapping.beginner : mapping.advanced;

                    recommendedCourses.push({
                        subject: subject,
                        level: isWeak ? 'beginner' : 'advanced',
                        courses: courses,
                        reason: isWeak
                            ? `Low performance (${marks[subject]}%) in ${subject} - focus on foundation courses`
                            : `Strong performance (${marks[subject]}%) in ${subject} - ready for advanced courses`
                    });
                }
            }

            // Generate career suggestions based on strong subjects
            for (const subject of strongSubjects) {
                const normalizedSubject = this.normalizeSubjectName(subject);
                const careers = careerMapping[normalizedSubject];

                if (careers) {
                    careerSuggestions.push({
                        subject: subject,
                        score: marks[subject],
                        suggestedCareers: careers,
                        reason: `Excellent performance in ${subject} indicates potential for these career paths`
                    });
                }
            }

            // Add skill and interest-based recommendations
            if (skills && skills.length > 0) {
                const skillBasedCourses = this.getSkillBasedRecommendations(skills);
                if (skillBasedCourses.length > 0) {
                    recommendedCourses.push({
                        subject: 'Skill Development',
                        level: 'intermediate',
                        courses: skillBasedCourses,
                        reason: 'Based on your declared skills - recommended for further enhancement'
                    });
                }
            }

            if (interests && interests.length > 0) {
                const interestBasedCourses = this.getInterestBasedRecommendations(interests);
                if (interestBasedCourses.length > 0) {
                    recommendedCourses.push({
                        subject: 'Interest-Based Learning',
                        level: 'intermediate',
                        courses: interestBasedCourses,
                        reason: 'Based on your interests - recommended for personal growth'
                    });
                }
            }

            // Generate summary message
            let message = 'Course recommendations generated successfully. ';

            if (weakSubjects.length > 0) {
                message += `Focus on improving weak subjects: ${weakSubjects.join(', ')}. `;
            }

            if (strongSubjects.length > 0) {
                message += `You excel in: ${strongSubjects.join(', ')}. Consider advanced courses and related career paths. `;
            }

            if (recommendedCourses.length === 0) {
                message += 'No specific course recommendations available. Consider adding more subjects or updating your marks.';
            } else {
                message += `Found ${recommendedCourses.length} course recommendation(s).`;
            }

            return {
                weakSubjects,
                strongSubjects,
                recommendedCourses,
                careerSuggestions,
                message
            };

        } catch (error) {
            throw new Error(`Failed to generate course recommendations: ${error.message}`);
        }
    }

    /**
     * Normalize subject names for better matching
     */
    normalizeSubjectName(subject) {
        const normalized = subject.toLowerCase().trim();

        // Handle common variations
        if (normalized.includes('data structure')) return 'Data Structures';
        if (normalized.includes('dsa')) return 'DSA';
        if (normalized.includes('web')) return 'Web';
        if (normalized.includes('java')) return 'Java';
        if (normalized.includes('python')) return 'Python';
        if (normalized.includes('c++')) return 'C++';
        if (normalized.includes('math')) return 'Mathematics';
        if (normalized.includes('calculus')) return 'Calculus';
        if (normalized.includes('linear algebra')) return 'Linear Algebra';
        if (normalized.includes('database')) return 'Database';
        if (normalized.includes('sql')) return 'SQL';
        if (normalized.includes('operating system')) return 'Operating Systems';
        if (normalized.includes('computer network')) return 'Computer Networks';
        if (normalized.includes('software engineering')) return 'Software Engineering';

        // Return original if no match found
        return subject;
    }

    /**
     * Get skill-based course recommendations
     */
    /**
     * Get skill-based course recommendations
     */
    getSkillBasedRecommendations(skills) {
        const skillCourses = {
            'javascript': ['Advanced JavaScript', 'React Development', 'Node.js Backend'],
            'js': ['Advanced JavaScript', 'React Development', 'Node.js Backend'],
            'react': ['Advanced React', 'Redux State Management', 'React Native'],
            'reactjs': ['Advanced React', 'Redux State Management', 'React Native'],
            'node.js': ['Express.js Development', 'RESTful API Design', 'Microservices with Node.js'],
            'nodejs': ['Express.js Development', 'RESTful API Design', 'Microservices with Node.js'],
            'node': ['Express.js Development', 'RESTful API Design', 'Microservices with Node.js'],
            'python': ['Django Web Framework', 'Flask Development', 'Python Data Analysis'],
            'java': ['Spring Framework', 'Hibernate ORM', 'Java Microservices'],
            'database': ['MongoDB Design', 'PostgreSQL Administration', 'Database Optimization'],
            'mongodb': ['MongoDB Design', 'Advanced Queries', 'Database Optimization'],
            'postgres': ['PostgreSQL Administration', 'Advanced SQL', 'Database Performance'],
            'postgresql': ['PostgreSQL Administration', 'Advanced SQL', 'Database Performance'],
            'sql': ['SQL Fundamentals', 'Advanced SQL', 'Query Optimization'],
            'git': ['Advanced Git', 'Git Workflow Management', 'Collaborative Development'],
            'github': ['Advanced Git', 'GitHub Workflows', 'Collaborative Development'],
            'docker': ['Docker Containerization', 'Kubernetes Orchestration', 'Container Security'],
            'kubernetes': ['Kubernetes Orchestration', 'Container Management', 'Microservices Deployment'],
            'aws': ['AWS Cloud Architecture', 'Serverless Computing', 'AWS DevOps'],
            'azure': ['Azure Cloud Services', 'Azure DevOps', 'Cloud Security'],
            'gcp': ['Google Cloud Platform', 'Cloud Infrastructure', 'GCP Services'],
            'testing': ['Unit Testing', 'Integration Testing', 'Test-Driven Development'],
            'jest': ['Jest Testing Framework', 'Unit Testing', 'Test Automation'],
            'rest': ['RESTful API Design', 'API Development', 'API Security'],
            'api': ['RESTful API Design', 'API Development', 'GraphQL APIs'],
            'graphql': ['GraphQL APIs', 'Advanced GraphQL', 'API Architecture'],
            'typescript': ['TypeScript Advanced', 'Type Safety', 'TypeScript Patterns'],
            'ts': ['TypeScript Advanced', 'Type Safety', 'TypeScript Patterns'],
            'html': ['HTML5 Semantics', 'Accessibility', 'Modern HTML'],
            'css': ['Advanced CSS', 'CSS Grid & Flexbox', 'CSS Animations'],
            'web': ['Web Development Basics', 'Frontend Fundamentals', 'Full Stack Web Development']
        };

        const recommendations = [];

        if (Array.isArray(skills) && skills.length > 0) {
            skills.forEach(skill => {
                if (!skill || typeof skill !== 'string') return;
                
                const normalizedSkill = skill.toLowerCase().trim();
                const courses = skillCourses[normalizedSkill];
                
                if (courses) {
                    recommendations.push(...courses);
                }
            });
        }

        return [...new Set(recommendations)]; // Remove duplicates
    }

    /**
     * Get interest-based course recommendations
     */
    getInterestBasedRecommendations(interests) {
        const interestCourses = {
            'artificial intelligence': ['Machine Learning Fundamentals', 'Deep Learning', 'AI Ethics'],
            'ai': ['Machine Learning Fundamentals', 'Deep Learning', 'AI Ethics'],
            'machine learning': ['Machine Learning Algorithms', 'Neural Networks', 'Computer Vision'],
            'ml': ['Machine Learning Algorithms', 'Neural Networks', 'Computer Vision'],
            'data science': ['Data Analysis with Python', 'Statistical Modeling', 'Big Data Processing'],
            'data analyst': ['Data Analysis with Python', 'Statistical Modeling', 'Data Visualization'],
            'analytics': ['Data Analysis', 'Business Analytics', 'Data Visualization'],
            'cybersecurity': ['Network Security', 'Ethical Hacking', 'Cryptography'],
            'security': ['Network Security', 'Ethical Hacking', 'Security Best Practices'],
            'hacking': ['Ethical Hacking', 'Penetration Testing', 'Security Auditing'],
            'mobile development': ['Android Development', 'iOS Development', 'Cross-Platform Mobile Apps'],
            'android': ['Android Development', 'Kotlin Programming', 'Android Architecture'],
            'ios': ['iOS Development', 'Swift Programming', 'iOS Design Patterns'],
            'flutter': ['Flutter Development', 'Dart Programming', 'Cross-Platform Development'],
            'react native': ['React Native Development', 'Mobile JavaScript', 'Cross-Platform Apps'],
            'game development': ['Unity Game Engine', 'Unreal Engine', 'Game Design Principles'],
            'unity': ['Unity Game Engine', 'C# for Games', 'Game Physics'],
            'unreal': ['Unreal Engine', 'C++ for Games', 'Game Architecture'],
            'blockchain': ['Blockchain Fundamentals', 'Smart Contracts', 'Cryptocurrency Development'],
            'crypto': ['Cryptography', 'Blockchain Technology', 'Smart Contracts'],
            'web3': ['Web3 Development', 'Smart Contracts', 'DeFi Applications'],
            'cloud computing': ['AWS Cloud Services', 'Azure Cloud Platform', 'Google Cloud Platform'],
            'cloud': ['Cloud Architecture', 'Cloud Services', 'Cloud Security'],
            'devops': ['CI/CD Pipelines', 'Infrastructure as Code', 'Monitoring and Logging'],
            'deployment': ['CI/CD Pipelines', 'Docker & Kubernetes', 'Cloud Deployment'],
            'ui/ux design': ['User Interface Design', 'User Experience Research', 'Design Systems'],
            'design': ['UI Design', 'UX Design', 'Design Thinking'],
            'ui design': ['User Interface Design', 'Design Systems', 'Responsive Design'],
            'ux design': ['User Experience Research', 'Usability Testing', 'Design Thinking'],
            'frontend': ['React Development', 'Vue.js Development', 'Angular Development'],
            'backend': ['Node.js Development', 'Express.js', 'Backend Architecture'],
            'fullstack': ['Full Stack Development', 'MERN Stack', 'Full Stack Architecture'],
            'database design': ['Database Architecture', 'SQL Optimization', 'NoSQL Design'],
            'big data': ['Big Data Processing', 'Hadoop & Spark', 'Data Engineering']
        };

        const recommendations = [];

        if (Array.isArray(interests) && interests.length > 0) {
            interests.forEach(interest => {
                if (!interest || typeof interest !== 'string') return;
                
                const normalizedInterest = interest.toLowerCase().trim();
                const courses = interestCourses[normalizedInterest];
                
                if (courses) {
                    recommendations.push(...courses);
                }
            });
        }

        return [...new Set(recommendations)]; // Remove duplicates
    }
    /**
     * Evaluates student data to generate subject and career recommendations natively.
     * @param {Object} student - The student document
     * @param {Array} marks - Array of Mark documents populated with subject
     * @param {Object} skills - The skills document for the student
     * @param {Array} careerPaths - Array of CareerPath documents
     * @returns {Object} { weakSubjects, strongSubjects, recommendations, message }
     */
    async generate(student, marks, skills, careerPaths) {
        const recommendations = [];
        const weakSubjects = [];
        const strongSubjects = [];

        // Valid types matching the Recommendation model enum
        const validTypes = ['subject-improvement', 'career-path', 'skill-development', 'academic-plan'];

        // 1. Identify weak and strong subjects
        marks.forEach(mark => {
            const percentage = (mark.marks / mark.maxMarks) * 100;
            const subjectData = {
                id: mark.subject._id,
                name: mark.subject.name,
                code: mark.subject.code,
                percentage,
            };

            if (percentage < 50) {
                weakSubjects.push(subjectData.name);
                recommendations.push({
                    student: student._id,
                    type: 'subject-improvement',
                    title: `Improve Performance in ${mark.subject.name}`,
                    description: `Your current score is ${mark.marks}/${mark.maxMarks} (${percentage.toFixed(1)}%). Focus on improving this subject through regular practice and seeking help from instructors.`,
                    priority: 'high',
                    subjects: [mark.subject._id],
                    reasoning: `Marks below 50% indicate weak performance in this subject.`,
                });
            } else if (percentage >= 80) {
                strongSubjects.push(subjectData.name);
            }
        });

        // 2. Career path recommendations and skill-based independent subject recommendations
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

        const studentSkills = [
            ...(skills?.technical?.map(s => s.skill.toLowerCase()) || []),
            ...(skills?.soft?.map(s => s.skill.toLowerCase()) || [])
        ];
        const studentInterests = (student.interests || []).map(i => i.toLowerCase());

        for (const path of careerPaths) {
            const matchingSubjects = path.requiredSubjects.filter(subject =>
                Object.keys(subjectAverages).some(s => s.toLowerCase().includes(subject.toLowerCase()))
            );

            const missingSubjects = path.requiredSubjects.filter(subject =>
                !Object.keys(subjectAverages).some(s => s.toLowerCase().includes(subject.toLowerCase()))
            );

            const matchingSkills = path.requiredSkills.filter(skill =>
                studentSkills.includes(skill.toLowerCase())
            );

            const interestMatch = studentInterests.some(interest =>
                path.name.toLowerCase().includes(interest) ||
                (path.category && path.category.toLowerCase().includes(interest)) ||
                path.requiredSkills.some(skill => skill.toLowerCase().includes(interest))
            );

            let avgMarks = 0;
            if (matchingSubjects.length > 0) {
                const relevantMarks = marks.filter(m =>
                    matchingSubjects.some(subject => m.subject.name.toLowerCase().includes(subject.toLowerCase()))
                );
                avgMarks = relevantMarks.length > 0
                    ? relevantMarks.reduce((sum, m) => sum + (m.marks / m.maxMarks) * 100, 0) / relevantMarks.length
                    : 0;
            }

            const hasStrongMarksInRelevantSubjects = matchingSubjects.length > 0 && avgMarks >= path.minMarks;
            const hasMatchingSkills = matchingSkills.length > 0;
            const hasInterestMatchWithSubjectMarks = interestMatch && matchingSubjects.length > 0;

            // Recommend Career Path
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
                    student: student._id,
                    type: 'career-path',
                    title: `Consider ${path.name} Career Path`,
                    description: path.description,
                    priority: 'medium',
                    careerPath: path._id,
                    reasoning: reasoning.join(' '),
                });
            }

            // Recommend subjects independently of the career path if there are skill or interest matches
            if ((interestMatch || hasMatchingSkills) && missingSubjects.length > 0) {
                const subjectDocs = await Subject.find({ name: { $in: missingSubjects } });
                const subjectIds = subjectDocs.map(s => s._id);

                if (subjectIds.length > 0) {
                    recommendations.push({
                        student: student._id,
                        type: 'subject-improvement',
                        title: `Recommended Courses for ${path.name}`,
                        description: `Based on your strong skills and interests in ${path.name}, we strongly recommend taking the following courses: ${missingSubjects.join(', ')}.`,
                        priority: 'high',
                        subjects: subjectIds,
                        reasoning: `Skills and interests align with ${path.name}. Course recommendation triggered.`,
                    });
                }
            }
        }

        // 3. Advanced topic suggestions for strong subjects
        if (strongSubjects.length > 0) {
            recommendations.push({
                student: student._id,
                type: 'academic-plan',
                title: 'Explore Advanced Topics',
                description: `Since you excel in ${strongSubjects.join(', ')}, consider taking advanced coursework, research projects, or certification exams related to these subjects.`,
                priority: 'high',
                reasoning: `Strong performance (>80%) detected in: ${strongSubjects.join(', ')}.`
            });
        }

        // Fallback if no recommendations generated
        if (recommendations.length === 0) {
            recommendations.push({
                student: student._id,
                type: 'academic-plan',
                title: 'Add academic data to get recommendations',
                description: 'No strong signals were found in your marks/skills/interests. Add marks and skills data then try again to generate personalized recommendations.',
                priority: 'low',
                reasoning: 'Fallback recommendation because no rule matched.',
            });
        }

        // Determine a final summary message
        let message = 'Recommendations generated successfully. ';
        if (weakSubjects.length > 0) {
            message += `Focus on improving your weak areas: ${weakSubjects.join(', ')}. `;
        } else {
            message += `Great job keeping your grades up! `;
        }
        if (strongSubjects.length > 0) {
            message += `You show excellent potential in ${strongSubjects.join(', ')}. Consider advanced career paths in these domains.`;
        }

        return {
            weakSubjects,
            strongSubjects,
            recommendations,
            message
        };
    }
}

module.exports = new RecommendationService();
