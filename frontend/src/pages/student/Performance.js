import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import ChartCard from '../../components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Performance = () => {
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
    name: sub.subject.length > 15 ? sub.subject.substring(0, 15) + '...' : sub.subject,
    average: Math.round(sub.average),
    fullName: sub.subject,
  })) || [];

  return (
    <div className="page-container">
      <h1>Performance Analysis</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Overall Average</h3>
          <p className="stat-value">{performance?.averageMarks?.toFixed(1) || 0}%</p>
        </div>
        <div className="stat-card">
          <h3>Total Subjects</h3>
          <p className="stat-value">{performance?.totalMarks || 0}</p>
        </div>
      </div>

      <ChartCard title="Subject-wise Performance">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={subjectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#1E3A8A" name="Average %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {performance?.weakSubjects?.length > 0 && (
        <div className="info-section">
          <h3>⚠️ Subjects Needing Improvement</h3>
          <div className="subject-list">
            {performance.weakSubjects.map((sub, idx) => (
              <div key={idx} className="subject-item weak">
                <strong>{sub.name}</strong>
                <span>{sub.average.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {performance?.strongSubjects?.length > 0 && (
        <div className="info-section">
          <h3>✅ Strong Subjects</h3>
          <div className="subject-list">
            {performance.strongSubjects.map((sub, idx) => (
              <div key={idx} className="subject-item strong">
                <strong>{sub.name}</strong>
                <span>{sub.average.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
