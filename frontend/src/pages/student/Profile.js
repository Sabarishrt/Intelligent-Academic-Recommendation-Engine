import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    interests: '',
  });
  const [skills, setSkills] = useState({ technical: [], soft: [] });
  const [skillForm, setSkillForm] = useState({ technical: '', technicalLevel: 'beginner', soft: '', softLevel: 'beginner' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        year: user.year || '',
        interests: (user.interests || []).join(', '),
      });
    }
    // Fetch skills
    const fetchSkills = async () => {
      try {
        const res = await studentService.getSkills();
        setSkills(res.data || { technical: [], soft: [] });
      } catch (err) {
        setSkills({ technical: [], soft: [] });
      }
    };
    fetchSkills();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    setSkillForm({ ...skillForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = {
        ...formData,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
      };
      await studentService.updateProfile(data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Add new skills to arrays
      const updatedTechnical = skillForm.technical
        ? [...skills.technical, { skill: skillForm.technical, level: skillForm.technicalLevel }]
        : skills.technical;
      const updatedSoft = skillForm.soft
        ? [...skills.soft, { skill: skillForm.soft, level: skillForm.softLevel }]
        : skills.soft;
      const res = await studentService.updateSkills({ technical: updatedTechnical, soft: updatedSoft });
      setSkills(res.data || { technical: [], soft: [] });
      setSkillForm({ technical: '', technicalLevel: 'beginner', soft: '', softLevel: 'beginner' });
      setMessage('Skills updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating skills');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (type, skillName) => {
    try {
      const updatedSkills = type === 'technical'
        ? { ...skills, technical: skills.technical.filter(s => s.skill !== skillName) }
        : { ...skills, soft: skills.soft.filter(s => s.skill !== skillName) };
      
      const res = await studentService.updateSkills(updatedSkills);
      setSkills(res.data || updatedSkills);
      setDeleteMessage('Skill deleted successfully!');
      setTimeout(() => setDeleteMessage(''), 3000);
    } catch (error) {
      setDeleteMessage('Error deleting skill');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-meta">
          <span className="profile-badge">Student ID: {user?.studentId || 'N/A'}</span>
        </div>
      </div>

      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
      {deleteMessage && <div className={`message ${deleteMessage.includes('Error') ? 'error' : 'success'}`}>{deleteMessage}</div>}

      <div className="profile-content">
        {/* Left Column - Basic Info */}
        <div className="profile-column profile-left">
          <div className="section-card">
            <h2>Basic Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email || ''} disabled className="form-input" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Year of Study</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1"
                  max="4"
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary btn-block" disabled={loading}>
                {loading ? 'Updating...' : 'Update Information'}
              </button>
            </form>
          </div>
        </div>

        {/* Middle Column - Interests */}
        <div className="profile-column profile-middle">
          <div className="section-card">
            <h2>Areas of Interest</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Interests</label>
                <textarea
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="e.g., Java Development, AI, Web Development, Data Science"
                  className="form-textarea"
                  rows="5"
                />
                <small>Separate interests with commas</small>
              </div>
              <button type="submit" className="btn-primary btn-block" disabled={loading}>
                {loading ? 'Updating...' : 'Update Interests'}
              </button>
            </form>
            
            {formData.interests && (
              <div className="interests-preview">
                <h4>Your Interests:</h4>
                <div className="interest-tags">
                  {formData.interests.split(',').map((interest, idx) => (
                    interest.trim() && <span key={idx} className="interest-tag">{interest.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Skills */}
        <div className="profile-column profile-right">
          <div className="section-card">
            <h2>Your Skills</h2>
            
            <div className="skills-display">
              <div className="skill-category">
                <h3>Technical Skills</h3>
                {skills.technical && skills.technical.length > 0 ? (
                  <div className="skill-list">
                    {skills.technical.map((s, idx) => (
                      <div key={idx} className="skill-item">
                        <div className="skill-info">
                          <span className="skill-name">{s.skill}</span>
                          <span className="skill-level">{s.level}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDeleteSkill('technical', s.skill)}
                          title="Delete skill"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No technical skills added yet</p>
                )}
              </div>

              <div className="skill-category">
                <h3>Soft Skills</h3>
                {skills.soft && skills.soft.length > 0 ? (
                  <div className="skill-list">
                    {skills.soft.map((s, idx) => (
                      <div key={idx} className="skill-item">
                        <div className="skill-info">
                          <span className="skill-name">{s.skill}</span>
                          <span className="skill-level">{s.level}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDeleteSkill('soft', s.skill)}
                          title="Delete skill"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No soft skills added yet</p>
                )}
              </div>
            </div>

            <hr className="divider" />

            <h3 className="add-skill-title">Add New Skills</h3>
            <form onSubmit={handleSkillSubmit}>
              <div className="form-group">
                <label>Technical Skill</label>
                <div className="skill-input-group">
                  <input
                    type="text"
                    name="technical"
                    value={skillForm.technical}
                    onChange={handleSkillChange}
                    placeholder="e.g., Python, React, Java"
                    className="form-input"
                  />
                  <select name="technicalLevel" value={skillForm.technicalLevel} onChange={handleSkillChange} className="form-select">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Soft Skill</label>
                <div className="skill-input-group">
                  <input
                    type="text"
                    name="soft"
                    value={skillForm.soft}
                    onChange={handleSkillChange}
                    placeholder="e.g., Communication, Leadership"
                    className="form-input"
                  />
                  <select name="softLevel" value={skillForm.softLevel} onChange={handleSkillChange} className="form-select">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="btn-primary btn-block" disabled={loading}>
                {loading ? 'Adding...' : 'Add Skills'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
