import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/profile', label: 'Profile', icon: '👤' },
    { path: '/student/marks', label: 'Marks', icon: '📝' },
    { path: '/student/performance', label: 'Performance', icon: '📈' },
    { path: '/student/recommendations', label: 'Recommendations', icon: '💡' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/students', label: 'Manage Students', icon: '👥' },
    { path: '/admin/subjects', label: 'Manage Subjects', icon: '📚' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>{user?.role === 'admin' ? 'Admin Panel' : 'Student Panel'}</h3>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
