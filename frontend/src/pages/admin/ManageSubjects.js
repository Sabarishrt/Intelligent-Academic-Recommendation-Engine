import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    credits: '',
    category: 'core',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await adminService.getAllSubjects();
      setSubjects(res.data || []);
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
      if (editingId) {
        await adminService.updateSubject(editingId, formData);
        setMessage('Subject updated successfully!');
      } else {
        await adminService.createSubject(formData);
        setMessage('Subject created successfully!');
      }
      setFormData({
        code: '',
        name: '',
        department: '',
        credits: '',
        category: 'core',
        description: '',
      });
      setShowForm(false);
      setEditingId(null);
      fetchSubjects();
    } catch (error) {
      setMessage('Error saving subject');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      code: subject.code,
      name: subject.name,
      department: subject.department,
      credits: subject.credits,
      category: subject.category,
      description: subject.description || '',
    });
    setEditingId(subject._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await adminService.deleteSubject(id);
        fetchSubjects();
      } catch (error) {
        alert('Error deleting subject');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Subjects</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({
          code: '', name: '', department: '', credits: '', category: 'core', description: '',
        }); }} className="btn-primary">
          {showForm ? 'Cancel' : 'Add Subject'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="e.g., CS101"
              />
            </div>
            <div className="form-group">
              <label>Subject Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Credits</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="lab">Lab</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Subject' : 'Create Subject'}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No subjects found</td>
              </tr>
            ) : (
              subjects.map(subject => (
                <tr key={subject._id}>
                  <td>{subject.code}</td>
                  <td>{subject.name}</td>
                  <td>{subject.department}</td>
                  <td>{subject.credits}</td>
                  <td>{subject.category}</td>
                  <td>
                    <button onClick={() => handleEdit(subject)} className="btn-link">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(subject._id)} className="btn-link delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSubjects;
