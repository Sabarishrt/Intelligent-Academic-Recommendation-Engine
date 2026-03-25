import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Marks = () => {
  const [marks, setMarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    marks: '',
    maxMarks: '100',
    semester: '',
    year: new Date().getFullYear(),
    examType: 'final',
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMarks();
    fetchSubjects();
  }, []);

  const fetchMarks = async () => {
    try {
      const res = await studentService.getMarks();
      setMarks(res.data || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/students/subjects`);
      setSubjects(res.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await studentService.addMarks(formData);
      setMessage('Marks added successfully!');
      setFormData({
        subject: '',
        marks: '',
        maxMarks: '100',
        semester: '',
        year: new Date().getFullYear(),
        examType: 'final',
      });
      setShowForm(false);
      fetchMarks();
    } catch (error) {
      setMessage('Error adding marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Marks</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add Marks'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject</label>
              <select name="subject" value={formData.subject} onChange={handleChange} required>
                <option value="">Select Subject</option>
                {subjects.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Marks</label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Max Marks</label>
              <input
                type="number"
                name="maxMarks"
                value={formData.maxMarks}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                min="1"
                max="8"
                required
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Exam Type</label>
              <select name="examType" value={formData.examType} onChange={handleChange}>
                <option value="final">Final</option>
                <option value="midterm">Midterm</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Marks'}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Code</th>
              <th>Marks</th>
              <th>Grade</th>
              <th>Semester</th>
              <th>Year</th>
              <th>Exam Type</th>
            </tr>
          </thead>
          <tbody>
            {marks.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No marks recorded yet</td>
              </tr>
            ) : (
              marks.map(mark => (
                <tr key={mark._id}>
                  <td>{mark.subject?.name || 'N/A'}</td>
                  <td>{mark.subject?.code || 'N/A'}</td>
                  <td>{mark.marks}/{mark.maxMarks}</td>
                  <td>{mark.grade}</td>
                  <td>{mark.semester}</td>
                  <td>{mark.year}</td>
                  <td>{mark.examType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Marks;
