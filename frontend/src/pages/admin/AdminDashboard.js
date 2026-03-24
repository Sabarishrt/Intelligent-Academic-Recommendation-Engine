import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import ChartCard from '../../components/ChartCard';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // NEW: Filter states
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [yearCounts, setYearCounts] = useState({ '1': 0, '2': 0, '3': 0, '4': 0 });
  
  const intervalRef = useRef(null);

  // Fetch initial dashboard
  useEffect(() => {
    fetchDashboard();
    fetchDepartments();
    intervalRef.current = setInterval(fetchDashboard, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Fetch filtered students when year or department changes
  useEffect(() => {
    const fetchFilteredStudents = async () => {
      try {
        const res = await adminService.getStudentsByYearAndDepartment(selectedYear, selectedDepartment);
        setFilteredStudents(res.data);
      } catch (error) {
        console.error('Error fetching filtered students:', error);
      }
    };

    if (selectedYear || selectedDepartment) {
      fetchFilteredStudents();
    } else {
      setFilteredStudents([]);
    }
  }, [selectedYear, selectedDepartment]);

  const fetchDashboard = async () => {
    try {
      const res = await adminService.getDashboard();
      setDashboard(res.data);
      
      // Calculate year-wise student counts
      const allStudentsRes = await adminService.getAllStudents();
      const counts = { '1': 0, '2': 0, '3': 0, '4': 0 };
      allStudentsRes.data.forEach(student => {
        if (student.year && counts.hasOwnProperty(student.year)) {
          counts[student.year]++;
        }
      });
      setYearCounts(counts);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch unique departments
  const fetchDepartments = async () => {
    try {
      const res = await adminService.getAllStudents();
      const departments = [...new Set(res.data.map(s => s.department).filter(Boolean))];
      setAllDepartments(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchDashboard();
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-header">
        <button className="btn-primary btn-sm" onClick={handleRefresh} disabled={loading}>
          Refresh
        </button>
        {lastUpdated && <div className="last-updated">Last updated: {lastUpdated.toLocaleTimeString()}</div>}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-value">{dashboard?.stats?.totalStudents ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>1st Year Students</h3>
          <p className="stat-value">{yearCounts['1'] ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>2nd Year Students</h3>
          <p className="stat-value">{yearCounts['2'] ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>3rd Year Students</h3>
          <p className="stat-value">{yearCounts['3'] ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>4th Year Students</h3>
          <p className="stat-value">{yearCounts['4'] ?? 0}</p>
        </div>
      </div>

      {/* NEW: Filter Section */}
      <ChartCard title="Filter Students by Year & Department">
        <div className="filter-section" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label>Select Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label>Select Department:</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="">All Departments</option>
              {allDepartments.map((dept, idx) => (
                <option key={idx} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Display filtered students count */}
        {(selectedYear || selectedDepartment) && (
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            <strong>Filtered Students Count: {filteredStudents.length}</strong>
          </div>
        )}

        {/* Display filtered students list */}
        {filteredStudents.length > 0 && (
          <div className="students-list">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Department</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{student.name}</td>
                    <td style={{ padding: '10px' }}>{student.email}</td>
                    <td style={{ padding: '10px' }}>{student.department || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>{student.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {dashboard?.lowPerformers?.length > 0 && (
        <ChartCard title="Low Performers (Below 50%)">
          <div className="low-performers-list">
            {dashboard.lowPerformers.map((performer, idx) => (
              <div key={idx} className="performer-item">
                <span>{performer.student.name}</span>
                <span className="average">{performer.average.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {dashboard?.recentStudents?.length > 0 && (
        <ChartCard title="Recent Students">
          <div className="recent-students-list">
            {dashboard.recentStudents.map((student, idx) => (
              <div key={idx} className="student-item">
                <span>{student.name}</span>
                <span>{student.email}</span>
                <span>{student.department || 'N/A'}</span>
                <span>{student.year}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default AdminDashboard;