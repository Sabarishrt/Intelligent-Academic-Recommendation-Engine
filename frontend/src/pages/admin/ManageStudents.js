import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Link } from 'react-router-dom';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await adminService.getAllStudents();
      setStudents(res.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <h1>Manage Students</h1>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Department</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No students found</td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.studentId || 'N/A'}</td>
                  <td>{student.department || 'N/A'}</td>
                  <td>{student.year || 'N/A'}</td>
                  <td>
                    <Link to={`/admin/students/${student._id}`} className="btn-link">
                      View Details
                    </Link>
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

export default ManageStudents;
