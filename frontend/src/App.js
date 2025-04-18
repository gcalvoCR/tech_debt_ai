import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import InstructorDashboard from './components/instructor/InstructorDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import CourseList from './components/courses/CourseList';
import CourseDetails from './components/courses/CourseDetails';
import UserList from './components/admin/UserList';
import UserForm from './components/admin/UserForm';
import CourseForm from './components/courses/CourseForm';

// API configuration
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  // Handle login
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    
    // Redirect based on role
    if (userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  // Protected route component
  const ProtectedRoute = ({ children, roles }) => {
    if (loading) {
      return <div className="text-center mt-5">Loading...</div>;
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (roles && !roles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" />;
      } else if (user.role === 'instructor') {
        return <Navigate to="/instructor/dashboard" />;
      } else {
        return <Navigate to="/student/dashboard" />;
      }
    }
    
    return children;
  };

  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="container mt-4">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={user ? (
              <Navigate to={
                user.role === 'admin' 
                  ? '/admin/dashboard' 
                  : user.role === 'instructor' 
                  ? '/instructor/dashboard' 
                  : '/student/dashboard'
              } />
            ) : (
              <Login onLogin={handleLogin} />
            )} 
          />
          
          <Route 
            path="/register" 
            element={user ? (
              <Navigate to={
                user.role === 'admin' 
                  ? '/admin/dashboard' 
                  : user.role === 'instructor' 
                  ? '/instructor/dashboard' 
                  : '/student/dashboard'
              } />
            ) : (
              <Register onLogin={handleLogin} />
            )} 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute roles={['admin']}>
                <UserList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/new" 
            element={
              <ProtectedRoute roles={['admin']}>
                <UserForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/edit/:id" 
            element={
              <ProtectedRoute roles={['admin']}>
                <UserForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Instructor routes */}
          <Route 
            path="/instructor/dashboard" 
            element={
              <ProtectedRoute roles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/instructor/courses/new" 
            element={
              <ProtectedRoute roles={['instructor']}>
                <CourseForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/instructor/courses/edit/:id" 
            element={
              <ProtectedRoute roles={['instructor']}>
                <CourseForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Student routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Common routes */}
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/courses/:id" 
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* Default route */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={
                  user.role === 'admin' 
                    ? '/admin/dashboard' 
                    : user.role === 'instructor' 
                    ? '/instructor/dashboard' 
                    : '/student/dashboard'
                } />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* 404 route */}
          <Route 
            path="*" 
            element={
              <div className="text-center mt-5">
                <h2>404 - Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
              </div>
            } 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App; 