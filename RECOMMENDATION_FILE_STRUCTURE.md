# Recommendation Engine - File Structure & Mapping

## 📁 Complete Project Structure

```
PCDP/
│
├── backend/                          # Node.js Backend Server
│   ├── server.js                     # Entry point (starts on port 5000)
│   │
│   ├── models/                       # Database Schemas (MongoDB)
│   │   ├── User.js                   # Student profile (interests, department)+
│   │   ├── Marks.js                  # Student marks in subjects
│   │   ├── Skills.js                 # Student skills (technical/soft)
│   │   ├── CareerPath.js            # Career paths & requirements ⭐
│   │   ├── Subject.js                # Subject definitions
│   │   ├── Recommendation.js         # Recommendation storage ⭐
│   │   └── ...
│   │
│   ├── controllers/                  # Business Logic
│   │   ├── recommendationController.js  # ⭐ MAIN MAPPING LOGIC
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   └── ...
│   │
│   ├── routes/                       # API Routes
│   │   ├── recommendationRoutes.js  # Routes for recommendations
│   │   ├── authRoutes.js
│   │   └── ...
│   │
│   ├── scripts/                      # Database Initialization
│   │   ├── seedCareerPaths.js       # Pre-load career paths into DB ⭐
│   │   └── ...
│   │
│   ├── config/                       # Configuration
│   │   ├── db.js                     # MongoDB connection
│   │   └── ...
│   │
│   └── middleware/
│       └── authMiddleware.js         # Authentication
│
├── frontend/                         # React.js Frontend
│   ├── src/
│   │   ├── App.js                    # Main app component
│   │   │
│   │   ├── pages/
│   │   │   ├── student/
│   │   │   │   ├── Profile.js        # Student profile (interests, skills)
│   │   │   │   ├── Recommendations.js # ⭐ DISPLAY RECOMMENDATIONS
│   │   │   │   ├── Marks.js          # Student marks entry
│   │   │   │   └── ...
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── studentService.js     # ⭐ API calls to backend
│   │   │   ├── authService.js
│   │   │   └── ...
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js        # User context
│   │   │
│   │   └── styles.css                # Global styles
│   │
│   └── package.json
│
├── python-service/                   # Python ML Service
│   ├── app.py                        # Flask app (port 5000) ⭐
│   ├── recommender.py                # ⭐ ADVANCED RECOMMENDATIONS
│   └── requirements.txt              # Python dependencies
│
├── RECOMMENDATION_ENGINE_DETAILED_GUIDE.md
├── CAREER_PATH_MAPPING_DECISION_GUIDE.md
├── RECOMMENDATION_ENGINE_FIX.md
└── README.md
```

---

## 🔗 File Dependencies - Recommendation Mapping

### Layer 1: Database Models (Foundation)

```
┌──────────────────────────────────────────────────────┐
│ Backend/models/                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ├─ User.js                                          │
│ │  Fields: name, email, interests, department       │
│ │  Role: Stores what student wants to do            │
│ │                                                   │
│ ├─ Marks.js                                         │
│ │  Fields: student, subject, marks, maxMarks        │
│ │  Role: Stores student's academic performance      │
│ │                                                   │
│ ├─ Skills.js                                        │
│ │  Fields: student, technical[], soft[]             │
│ │  Role: Stores student's skills                    │
│ │                                                   │
│ ├─ CareerPath.js ⭐                                 │
│ │  Fields: name, requiredSubjects[],                │
│ │           requiredSkills[], minMarks, category    │
│ │  Role: Defines career requirements                │
│ │                                                   │
│ ├─ Recommendation.js ⭐                             │
│ │  Fields: student, type, title, description,       │
│ │           priority, subjects, careerPath,         │
│ │           reasoning                               │
│ │  Role: Stores generated recommendations           │
│ │                                                   │
│ └─ Subject.js                                       │
│    Role: Defines available subjects                 │
│                                                    │
└──────────────────────────────────────────────────────┘
```

### Layer 2: Data Initialization (Pre-load Requirements)

```
┌──────────────────────────────────────────────────────┐
│ Backend/scripts/seedCareerPaths.js ⭐               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ When run: npm run seed:careers                       │
│                                                      │
│ Loads into database:                                │
│   - Software Developer                              │
│   - Data Scientist                                  │
│   - Web Developer                                   │
│   - Machine Learning Engineer                       │
│   - Research Scientist                              │
│                                                      │
│ Each with:                                          │
│   - requiredSubjects: [list]                        │
│   - requiredSkills: [list]                          │
│   - minMarks: threshold                             │
│   - category: type                                  │
│                                                      │
└──────────────────────────────────────────────────────┘
         ↓ writes to MongoDB
    CareerPath Collection
```

### Layer 3: Core Recommendation Logic

```
┌──────────────────────────────────────────────────────────────┐
│ Backend/controllers/recommendationController.js ⭐          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Function: generateRecommendations()                          │
│                                                              │
│ Process:                                                    │
│   1. Fetch student from User collection                      │
│   2. Fetch marks from Marks collection                       │
│   3. Fetch skills from Skills collection                     │
│   4. Fetch all CareerPaths from database                     │
│                                                              │
│   5. Package data (studentData)                              │
│      {                                                      │
│        marks: [...],       # with percentages               │
│        skills: {...},      # technical + soft               │
│        interests: [...],   # from User                       │
│        department: ...                                      │
│      }                                                      │
│                                                              │
│   6. Call Python Service (async)                             │
│      axios.post('http://localhost:5000/recommend',          │
│                 studentData)                                │
│                                                              │
│   7. Generate Rule-Based Recommendations:                    │
│      ├─ Loop through each CareerPath                        │
│      ├─ Calculate matchingSubjects                          │
│      ├─ Calculate missingSubjects                           │
│      ├─ Calculate avgMarks                                  │
│      ├─ Check 3 conditions (A, B, C)                        │
│      └─ Create Recommendation objects                       │
│                                                              │
│   8. Merge Python recommendations                            │
│                                                              │
│   9. Save all to Recommendation collection                   │
│      (linked to student ID)                                 │
│                                                              │
│   10. Return to frontend                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Layer 4: API Routes

```
┌──────────────────────────────────────────────────────┐
│ Backend/routes/recommendationRoutes.js              │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Route 1: GET /api/recommendations                   │
│   ├─ Calls: recommendationController.getRecommendations()
│   ├─ Returns: All recommendations for logged-in user
│   └─ Uses: Recommendation collection                │
│                                                      │
│ Route 2: POST /api/recommendations/generate ⭐     │
│   ├─ Calls: recommendationController.generateRecommendations()
│   ├─ Triggers: Full mapping & recommendation logic  │
│   └─ Returns: Newly generated recommendations       │
│                                                      │
│ Route 3: PUT /api/recommendations/:id/view         │
│   └─ Marks recommendation as viewed                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Layer 5: Python Service (Advanced Engine)

```
┌──────────────────────────────────────────────────────┐
│ Python-service/app.py ⭐                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Flask Server (port 5000)                            │
│                                                      │
│ Route: POST /recommend                              │
│   ├─ Receives: studentData from Node.js             │
│   ├─ Calls: recommender.generate_recommendations()  │
│   └─ Returns: recommendations list                  │
│                                                      │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│ Python-service/recommender.py ⭐                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Function: generate_recommendations(marks, skills,   │
│                                   interests, dept)   │
│                                                      │
│ Rules:                                              │
│   1. Identify weak subjects (< 50%)                 │
│   2. Identify strong subjects (>= 80%)              │
│   3. Career path recommendations with validation    │
│   4. Skill-to-subject mapping                       │
│   5. Interest-based recommendations                 │
│   6. Academic trend analysis                        │
│                                                      │
│ Returns: recommendation objects list                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Layer 6: Frontend Services (API Calls)

```
┌──────────────────────────────────────────────────────┐
│ Frontend/src/services/studentService.js ⭐          │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Function: getRecommendations()                      │
│   └─ GET /api/recommendations                       │
│      Returns existing recommendations                │
│                                                      │
│ Function: generateRecommendations()                 │
│   └─ POST /api/recommendations/generate             │
│      Triggers recommendation generation             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Layer 7: Frontend Display

```
┌──────────────────────────────────────────────────────┐
│ Frontend/src/pages/student/Recommendations.js ⭐   │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Component: <Recommendations />                       │
│                                                      │
│ Features:                                           │
│   1. Button: "Generate Recommendations"             │
│      └─ Calls studentService.generateRecommendations()
│                                                      │
│   2. Display sections:                              │
│      ├─ Academic Recommendations                    │
│      │  └─ type: 'subject-improvement'              │
│      ├─ Career Recommendations                      │
│      │  └─ type: 'career-path'                      │
│      ├─ Skill Gap Analysis                          │
│      │  └─ type: 'skill-development'                │
│      └─ Final System Message                        │
│         └─ Composite summary                        │
│                                                      │
│ Uses: Recommendations.css for styling               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Data Flow - File by File

```
User Action (Frontend):
  Student clicks "Generate Recommendations"
           ↓
    Recommendations.js
    └─ studentService.generateRecommendations()
           ↓
    studentService.js
    └─ axios.post('/api/recommendations/generate')
           ↓
    Backend API receives request
           ↓
    recommendationRoutes.js
    └─ POST /api/recommendations/generate
           ↓
    recommendationController.js
    ├─ Fetch from User.js (interests)
    ├─ Fetch from Marks.js (student scores)
    ├─ Fetch from Skills.js (student skills)
    ├─ Fetch from CareerPath.js (requirements) ⭐
    │
    ├─ Package studentData
    │
    ├─ axios.post to Python service
    │  └─ Python-service/app.py
    │     └─ Python-service/recommender.py
    │        └─ Return recommendations
    │
    ├─ Generate rule-based recommendations
    │  (JavaScript logic in controller)
    │
    ├─ Merge Python + JS recommendations
    │
    ├─ Save to Recommendation.js collection
    │
    └─ Return to frontend
           ↓
    Frontend receives response
           ↓
    Recommendations.js
    ├─ Fetch all recommendations
    ├─ Group by type
    └─ Display in sections
           ↓
    User sees recommendations!
```

---

## 📊 File Interaction Matrix

| File | Purpose | Reads From | Writes To | Triggered By |
|------|---------|-----------|----------|--------------|
| **User.js** | Student profile | - | interests, dept | Profile page |
| **Marks.js** | Academic scores | - | marks, subject | Marks page |
| **Skills.js** | Student abilities | - | technical, soft | Profile page |
| **CareerPath.js** | Job requirements | - | requiredSubjects, requiredSkills | seedCareerPaths.js (once) |
| **Recommendation.js** | Generated suggestions | - | recommendations | recommendationController |
| **recommendationController.js** | MAPPING LOGIC | User, Marks, Skills, CareerPath | Recommendation | API route |
| **seedCareerPaths.js** | Init data | - | CareerPath | npm run seed:careers |
| **recommender.py** | Advanced logic | marks, skills | recommendations | recommendationController |
| **studentService.js** | API client | - | - | Recommendations.js |
| **Recommendations.js** | Display | Recommendation | - | User click |

---

## 🎯 Key Mapping Files

### **MOST IMPORTANT:**

1. **recommendationController.js** (Node.js Backend)
   - Where all subject-career mapping happens
   - Lines 110-220: The core logic
   - Matches subjects, calculates scores, creates recommendations

2. **CareerPath.js Model** (Database)
   - Defines what each career needs
   - requiredSubjects: subjects to match
   - requiredSkills: skills to match
   - minMarks: performance threshold

3. **seedCareerPaths.js** (Initialization)
   - Pre-loads all career paths
   - Must run once: `npm run seed:careers`
   - Creates initial data in CareerPath collection

4. **recommender.py** (Python Backend)
   - Advanced ML/rule-based engine
   - Provides secondary recommendations
   - Validates Node.js recommendations

5. **Recommendations.js** (React Frontend)
   - Displays the mapping results
   - Calls generate API
   - Groups recommendations by type

---

## 💾 Data Storage Locations

```
MongoDB Collections:

├── users
│   └─ _id, name, email, interests ⭐, department, year
│
├── marks
│   └─ _id, student (FK), subject (FK), marks, maxMarks, percentage
│
├── skills
│   └─ _id, student (FK), technical[], soft[]
│
├── careerPaths ⭐
│   └─ _id, name, requiredSubjects[], requiredSkills[], minMarks
│
└── recommendations ⭐
    └─ _id, student (FK), type, title, description, priority, reasoning
```

---

## 🔧 How to Add New Career Path

1. **Edit:** `backend/scripts/seedCareerPaths.js`
   ```javascript
   {
     name: "AI/ML Engineer",
     description: "...",
     requiredSubjects: ["Machine Learning", "Python", "Statistics"],
     requiredSkills: ["Python", "Machine Learning", "Deep Learning"],
     minMarks: 75,
     category: "data-science"
   }
   ```

2. **Run:** `npm run seed:careers`

3. **Auto-mapped:** Next recommendation generation will include this career!

---

## 📈 Summary of Responsibilities

| Layer | File | Responsibility |
|-------|------|-----------------|
| **1. Models** | *.js in /models | Define data structure |
| **2. Init** | seedCareerPaths.js | Pre-load career data |
| **3. Logic** | recommendationController.js | Do the mapping |
| **4. Routes** | recommendationRoutes.js | Expose API |
| **5. Python** | recommender.py | Advanced analysis |
| **6. Client** | studentService.js | Call API |
| **7. UI** | Recommendations.js | Display results |

The recommendation mapping is primarily done in **recommendationController.js**, which uses data from **CareerPath.js** model to match with student data from **Marks.js**, **Skills.js**, and **User.js** models!
