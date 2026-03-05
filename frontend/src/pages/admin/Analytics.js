import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import ChartCard from '../../components/ChartCard';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await adminService.getAnalytics();
      setAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const COLORS = ['#1E3A8A', '#475569', '#3B82F6', '#10B981', '#00f2fe', '#ff6b6b'];

  const subjectData = analytics?.subjectStats?.map(sub => ({
    name: sub.name.length > 15 ? sub.name.substring(0, 15) + '...' : sub.name,
    average: Math.round(sub.average),
    passRate: Math.round((sub.passCount / sub.totalStudents) * 100),
  })) || [];

  const departmentData = Object.entries(analytics?.departmentStats || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const yearData = Object.entries(analytics?.yearStats || {}).map(([name, value]) => ({
    name: `Year ${name}`,
    value,
  }));

  return (
    <div className="page-container">
      <h1>Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-value">{analytics?.totalStudents || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Subjects</h3>
          <p className="stat-value">{analytics?.totalSubjects || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Marks</h3>
          <p className="stat-value">{analytics?.totalMarks || 0}</p>
        </div>
      </div>

      <ChartCard title="Subject-wise Average Performance">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={subjectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#1E3A8A" name="Average %" />
            <Bar dataKey="passRate" fill="#475569" name="Pass Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="charts-row">
        <ChartCard title="Department Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Year Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={yearData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {yearData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
