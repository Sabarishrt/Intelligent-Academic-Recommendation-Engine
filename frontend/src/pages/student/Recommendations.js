import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Recommendations.css';
import { studentService } from '../../services/studentService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [courseRecommendations, setCourseRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [courseMessage, setCourseMessage] = useState('');
  const [marks, setMarks] = useState([]);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);

  useEffect(() => {
    // Load all data in parallel for better performance
    Promise.all([
      axios.get(`${API_URL}/recommendations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).then(res => setRecommendations(res.data.data || [])).catch(err => console.error('Error fetching recommendations:', err)),
      studentService.getMarks().then(res => setMarks(res.data || [])).catch(err => console.error('Error fetching marks:', err)),
      studentService.getSkills().then(res => setSkills(res.data?.technical || [])).catch(err => console.error('Error fetching skills:', err)),
      studentService.getProfile().then(res => setInterests(res.data?.interests || [])).catch(err => console.error('Error fetching profile:', err)),
    ]);
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`${API_URL}/recommendations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRecommendations(res.data.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };


  const generateRecommendations = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${API_URL}/recommendations/generate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response?.data?.success) {
        setMessage(response.data.message || 'Recommendations generated successfully!');
        await fetchRecommendations();
      } else {
        setMessage(`Error generating recommendations: ${response?.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Generate recommendations error:', error);
      setMessage(`Error generating recommendations: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateCourseRecommendations = async () => {
    setCourseLoading(true);
    setCourseMessage('');

    try {
      // Prepare data for course recommendations
      const marksData = {};
      marks.forEach(mark => {
        const percentage = (mark.marks / mark.maxMarks) * 100;
        marksData[mark.subject.name] = Math.round(percentage);
      });

      // Extract skill names from skill objects (they have 'skill' and 'level' properties)
      const skillNames = skills && Array.isArray(skills) 
        ? skills.map(s => typeof s === 'object' ? s.skill : s).filter(Boolean)
        : [];

      // Ensure interests is array of strings
      const interestsList = Array.isArray(interests) ? interests : [];

      const recommendationData = {
        marks: marksData,
        skills: skillNames,
        interests: interestsList
      };


      const response = await studentService.getCourseRecommendations(recommendationData);

      if (response?.success) {
        setCourseRecommendations(response.data);
        setCourseMessage(response.data.message || 'Course recommendations generated successfully!');
      } else {
        setCourseMessage(`Error: ${response?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Course recommendations error:', error);
      setCourseMessage(`Error generating course recommendations: ${error.response?.data?.message || error.message}`);
    } finally {
      setCourseLoading(false);
    }
  };



  return (
    <div className="recommendations-dashboard">
      <div className="recommendations-main">
        <div className="recommendations-header">
          <h1 className="recommendations-title">Academic Recommendations</h1>
          <div className="button-group">
            <button onClick={generateRecommendations} className="recommendations-btn" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Academic Plan'}
            </button>
            <button onClick={() => setShowCourseForm(!showCourseForm)} className="recommendations-btn secondary">
              {showCourseForm ? 'Hide' : 'Show'} Course Recommendations
            </button>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Stats Grid - Moved Up */}
        <div className="stats-grid">
          <div className="stat-card stat-strong">
            <div className="stat-icon">💪</div>
            <div className="stat-body">
              <div className="stat-label">STRONG SUBJECTS</div>
              <div className="stat-value">{marks.filter(m => ((m.marks / m.maxMarks) * 100) >= 75).length}</div>
            </div>
          </div>
          <div className="stat-card stat-needs">
            <div className="stat-icon">⚠️</div>
            <div className="stat-body">
              <div className="stat-label">NEEDS WORK</div>
              <div className="stat-value">{marks.filter(m => ((m.marks / m.maxMarks) * 100) < 50).length}</div>
            </div>
          </div>
          <div className="stat-card stat-career">
            <div className="stat-icon">🎯</div>
            <div className="stat-body">
              <div className="stat-label">CAREER PATHS</div>
              <div className="stat-value">{recommendations.filter(r => r.type === 'career-path').length}</div>
            </div>
          </div>
          <div className="stat-card stat-skills">
            <div className="stat-icon">🛠️</div>
            <div className="stat-body">
              <div className="stat-label">SKILLS TO DEVELOP</div>
              <div className="stat-value">{recommendations.filter(r => r.type === 'skill-development').length}</div>
            </div>
          </div>
        </div>

        <div className={`recommendations-layout ${showCourseForm ? 'side-by-side' : 'full-width'}`}>
          {/* Course Recommendations Section */}
          {showCourseForm && (
            <div className="course-recommendations-section">
              <div className="section-header">
                <h2>🎓 Course Recommendations</h2>
                <button onClick={generateCourseRecommendations} className="recommendations-btn" disabled={courseLoading}>
                  {courseLoading ? 'Generating...' : 'Get Course Recommendations'}
                </button>
              </div>

              {courseMessage && (
                <div className={`message ${courseMessage.includes('Error') ? 'error' : 'success'}`}>
                  {courseMessage}
                </div>
              )}

              {courseRecommendations && (
                <div className="course-recommendations-content">
                  {/* Summary Cards */}
                  <div className="summary-cards">
                    <div className="summary-card weak">
                      <div className="summary-icon">📉</div>
                      <div className="summary-content">
                        <div className="summary-label">Weak Subjects</div>
                        <div className="summary-value">{courseRecommendations.weakSubjects.length}</div>
                        <div className="summary-list">
                          {courseRecommendations.weakSubjects.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="summary-card strong">
                      <div className="summary-icon">📈</div>
                      <div className="summary-content">
                        <div className="summary-label">Strong Subjects</div>
                        <div className="summary-value">{courseRecommendations.strongSubjects.length}</div>
                        <div className="summary-list">
                          {courseRecommendations.strongSubjects.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="summary-card courses">
                      <div className="summary-icon">📚</div>
                      <div className="summary-content">
                        <div className="summary-label">Recommended Courses</div>
                        <div className="summary-value">{courseRecommendations.recommendedCourses.length}</div>
                      </div>
                    </div>
                    <div className="summary-card careers">
                      <div className="summary-icon">🎯</div>
                      <div className="summary-content">
                        <div className="summary-label">Career Suggestions</div>
                        <div className="summary-value">{courseRecommendations.careerSuggestions.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Course Recommendations List */}
                  <div className="courses-section">
                    <h3>📖 Recommended Courses</h3>
                    <div className="courses-grid">
                      {courseRecommendations.recommendedCourses.map((course, index) => (
                        <div key={index} className={`course-card ${course.level}`}>
                          <div className="course-header">
                            <span className="course-subject">{course.subject}</span>
                            <span className={`course-level ${course.level}`}>
                              {course.level.toUpperCase()}
                            </span>
                          </div>
                          <div className="course-courses">
                            <strong>Courses:</strong>
                            <ul>
                              {course.courses.map((courseName, idx) => (
                                <li key={idx}>{courseName}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="course-reason">
                            <strong>Reason:</strong> {course.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Career Suggestions */}
                  {courseRecommendations.careerSuggestions.length > 0 && (
                    <div className="careers-section">
                      <h3>🎯 Career Paths</h3>
                      <div className="careers-grid">
                        {courseRecommendations.careerSuggestions.map((career, index) => (
                          <div key={index} className="career-card">
                            <div className="career-header">
                              <span className="career-subject">{career.subject}</span>
                              <span className="career-score">{career.score}%</span>
                            </div>
                            <div className="career-suggestions">
                              <strong>Suggested Careers:</strong>
                              <ul>
                                {career.suggestedCareers.map((careerName, idx) => (
                                  <li key={idx}>{careerName}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="career-reason">
                              <strong>Reason:</strong> {career.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Academic Plan Recommendations */}
          <div className="recommendation-list">
            <h2>📋 Academic Plan Recommendations</h2>
            {recommendations.length === 0 ? (
              <div className="no-data-card">
                <p>No academic plan recommendations yet. Click "Generate Academic Plan" to get personalized suggestions.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {recommendations.map(rec => (
                  <div key={rec._id} className="recommendation-card">
                    <div className="card-top">
                      <span className="pin">📌</span>
                      <span className="tag">RECOMMENDATION</span>
                    </div>
                    <h3>{rec.title}</h3>
                    <p className="muted">{rec.description}</p>
                    {rec.reasoning && <div className="reasoning"><strong>Reasoning:</strong> {rec.reasoning}</div>}
                    {rec.subjects && rec.subjects.length > 0 && (
                      <div className="subject-box">📚 <strong>Subjects:</strong> {rec.subjects.map(s => s.name || s).join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
