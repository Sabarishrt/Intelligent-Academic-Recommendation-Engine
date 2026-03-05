import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import ChartCard from '../../components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const res = await studentService.getPerformance();
      setPerformance(res.data);
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const subjectData = performance?.subjectPerformance?.map(sub => ({
    name: sub.subject,
    average: Math.round(sub.average),
  })) || [];


  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Overall Average</h3>
          <p className="stat-value">{performance?.averageMarks?.toFixed(1) || 0}%</p>
        </div>
        <div className="stat-card">
          <h3>Total Subjects</h3>
          <p className="stat-value">{performance?.totalMarks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Weak Subjects</h3>
          <p className="stat-value">{performance?.weakSubjects?.length || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Strong Subjects</h3>
          <p className="stat-value">{performance?.strongSubjects?.length || 0}</p>
        </div>
      </div>

      <ChartCard title="Subject Performance">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#1E3A8A" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {performance?.weakSubjects?.length > 0 && (
        <div className="info-section">
          <h3>Subjects Needing Improvement</h3>
          <ul>
            {performance.weakSubjects.map((sub, idx) => (
              <li key={idx}>
                {sub.name} - {sub.average.toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {performance?.strongSubjects?.length > 0 && (
        <div className="info-section">
          <h3>Strong Subjects</h3>
          <ul>
            {performance.strongSubjects.map((sub, idx) => (
              <li key={idx}>
                {sub.name} - {sub.average.toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
