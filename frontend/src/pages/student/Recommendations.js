import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Recommendations.css';
import { studentService } from '../../services/studentService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    fetchRecommendations();
    fetchMarks();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/recommendations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRecommendations(res.data.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchMarks = async () => {
    try {
      const res = await studentService.getMarks();
      setMarks(res.data || []);
    } catch (err) {
      console.error('Error fetching marks:', err);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setMessage('');

    try {
      await axios.post(
        `${API_URL}/api/recommendations/generate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage('Recommendations generated successfully!');
      fetchRecommendations();
    } catch (error) {
      setMessage('Error generating recommendations');
    } finally {
      setLoading(false);
    }
  };



  // derive simple stats for stat cards
  const strongSubjects = marks.filter(m => ((m.marks / m.maxMarks) * 100) >= 75).length;
  const needsWork = marks.filter(m => ((m.marks / m.maxMarks) * 100) < 50).length;
  const careerPaths = recommendations.filter(r => r.type === 'career-path').length;
  const skillsToDevelop = recommendations.filter(r => r.type === 'skill-development').length;

  return (
    <div className="recommendations-dashboard">
      <div className="recommendations-main">
        <div className="recommendations-header">
          <h1 className="recommendations-title">Recommendations</h1>
          <button onClick={generateRecommendations} className="recommendations-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Recommendations'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card stat-strong">
            <div className="stat-icon">💪</div>
            <div className="stat-body">
              <div className="stat-label">STRONG SUBJECTS</div>
              <div className="stat-value">{strongSubjects}</div>
            </div>
          </div>
          <div className="stat-card stat-needs">
            <div className="stat-icon">⚠️</div>
            <div className="stat-body">
              <div className="stat-label">NEEDS WORK</div>
              <div className="stat-value">{needsWork}</div>
            </div>
          </div>
          <div className="stat-card stat-career">
            <div className="stat-icon">🎯</div>
            <div className="stat-body">
              <div className="stat-label">CAREER PATHS</div>
              <div className="stat-value">{careerPaths}</div>
            </div>
          </div>
          <div className="stat-card stat-skills">
            <div className="stat-icon">🛠️</div>
            <div className="stat-body">
              <div className="stat-label">SKILLS TO DEVELOP</div>
              <div className="stat-value">{skillsToDevelop}</div>
            </div>
          </div>
        </div>

        <div className="recommendation-list">
          {recommendations.length === 0 ? (
            <div className="no-data-card">
              <p>No recommendations yet. Click "Generate Recommendations" to get personalized suggestions.</p>
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
  );
};

export default Recommendations;
