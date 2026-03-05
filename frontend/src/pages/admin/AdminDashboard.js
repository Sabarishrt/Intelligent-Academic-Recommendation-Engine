import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import ChartCard from '../../components/ChartCard';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
    // auto-refresh every 5s
    intervalRef.current = setInterval(fetchDashboard, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminService.getDashboard();
      // adminService returns response.data which contains { success, data: { stats, recentStudents, lowPerformers } }
      setDashboard(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
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
          <h3>Total Subjects</h3>
          <p className="stat-value">{dashboard?.stats?.totalSubjects ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Marks</h3>
          <p className="stat-value">{dashboard?.stats?.totalMarks ?? 0}</p>
        </div>
        <div className="stat-card">
          <h3>Recommendations</h3>
          <p className="stat-value">{dashboard?.stats?.totalRecommendations ?? 0}</p>
        </div>
      </div>

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
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default AdminDashboard;
