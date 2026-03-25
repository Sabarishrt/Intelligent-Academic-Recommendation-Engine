# Course Recommendation Engine API

## Overview
The Course Recommendation Engine is a rule-based system that analyzes student performance data and provides personalized course and career recommendations.

## API Endpoint

### POST /api/recommendations

Generates course recommendations based on student marks, skills, and interests.

**Authentication:** Required (Student role)
**Content-Type:** application/json

## Request Body

```json
{
  "marks": {
    "subject_name": score_number,
    "Data Structures": 85,
    "Java": 45,
    "Web Development": 92
  },
  "skills": ["JavaScript", "React", "Python"],
  "interests": ["Artificial Intelligence", "Web Development"]
}
```

### Field Descriptions

- **marks** (object, required): Object with subject names as keys and numerical scores (0-100) as values
- **skills** (array, required): Array of strings representing student skills
- **interests** (array, required): Array of strings representing student interests

## Response

```json
{
  "success": true,
  "data": {
    "weakSubjects": ["Data Structures", "Mathematics"],
    "strongSubjects": ["Java", "Database"],
    "recommendedCourses": [
      {
        "subject": "Data Structures",
        "level": "beginner",
        "courses": ["Introduction to Data Structures", "Basic Algorithms"],
        "reason": "Low performance (45%) in Data Structures - focus on foundation courses"
      },
      {
        "subject": "Java",
        "level": "advanced",
        "courses": ["Advanced Java", "Spring Boot Development"],
        "reason": "Strong performance (85%) in Java - ready for advanced courses"
      }
    ],
    "careerSuggestions": [
      {
        "subject": "Java",
        "score": 85,
        "suggestedCareers": ["Java Developer", "Spring Boot Developer", "Enterprise Software Engineer"],
        "reason": "Excellent performance in Java indicates potential for these career paths"
      }
    ],
    "message": "Course recommendations generated successfully. Focus on improving weak subjects: Data Structures, Mathematics. You excel in: Java, Database. Consider advanced courses and related career paths. Found 6 course recommendation(s)."
  }
}
```

### Response Field Descriptions

- **weakSubjects**: Array of subjects where marks < 50
- **strongSubjects**: Array of subjects where marks >= 80
- **recommendedCourses**: Array of course recommendations with subject, level, courses, and reason
- **careerSuggestions**: Array of career path suggestions based on strong subjects
- **message**: Summary message with key insights

## Recommendation Logic

### Subject Analysis
- **Weak Subjects** (< 50%): Recommend beginner/foundation courses
- **Strong Subjects** (>= 80%): Recommend advanced courses

### Course Mapping Examples
- **Data Structures/DSA**: Beginner → ["Data Structures Basics", "Problem Solving with DSA"], Advanced → ["Advanced DSA", "Competitive Programming"]
- **Java**: Beginner → ["Java Fundamentals", "Object-Oriented Programming in Java"], Advanced → ["Advanced Java", "Spring Boot Development"]
- **Web/Web Development**: Beginner → ["HTML & CSS Basics", "JavaScript Fundamentals"], Advanced → ["Full Stack Web Development", "Modern Web Technologies"]

### Career Suggestions
Based on strong subject performance, suggests relevant career paths:
- Java (strong) → Java Developer, Spring Boot Developer, Enterprise Software Engineer
- Database (strong) → Database Administrator, Data Engineer, Backend Developer

### Skill & Interest-Based Recommendations
- **Skills**: Maps declared skills to relevant advanced courses
- **Interests**: Maps interests to specialized courses (AI, Data Science, Cybersecurity, etc.)

## Example Usage

### cURL Example
```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "marks": {
      "Data Structures": 45,
      "Java": 85,
      "Web Development": 78,
      "Mathematics": 35,
      "Database": 92
    },
    "skills": ["JavaScript", "React", "Node.js", "Python"],
    "interests": ["Artificial Intelligence", "Web Development", "Data Science"]
  }'
```

### JavaScript (Frontend) Example
```javascript
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    marks: {
      "Data Structures": 45,
      "Java": 85,
      "Database": 92
    },
    skills: ["JavaScript", "React"],
    interests: ["Web Development", "AI"]
  })
});

const result = await response.json();
console.log(result.data);
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data (missing fields, wrong data types)
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **500 Internal Server Error**: Server-side errors

Error response format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing

Run the test script to see the recommendation engine in action:

```bash
cd backend
node test-recommendations.js
```

This will demonstrate the functionality with sample data and show the expected input/output format.