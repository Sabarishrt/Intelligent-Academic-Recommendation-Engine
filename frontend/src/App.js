import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import Profile from './pages/student/Profile';
import Marks from './pages/student/Marks';
import Performance from './pages/student/Performance';
import Recommendations from './pages/student/Recommendations';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageSubjects from './pages/admin/ManageSubjects';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/student/*"
              element={
                <ProtectedRoute requiredRole="student">
                  <div className="app-layout">
                    <Sidebar />
                    <div className="main-content">
                      <Routes>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="marks" element={<Marks />} />
                        <Route path="performance" element={<Performance />} />
                        <Route path="recommendations" element={<Recommendations />} />
                        <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <div className="app-layout">
                    <Sidebar />
                    <div className="main-content">
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="students" element={<ManageStudents />} />
                        <Route path="subjects" element={<ManageSubjects />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
