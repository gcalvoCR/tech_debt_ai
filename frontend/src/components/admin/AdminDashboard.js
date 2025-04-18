import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would have an endpoint for stats
        // Here we're simulating by making separate calls
        const [usersResponse, coursesResponse] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/courses')
        ]);

        const users = usersResponse.data;
        const courses = coursesResponse.data;

        setStats({
          totalUsers: users.length,
          totalCourses: courses.length,
          totalStudents: users.filter(user => user.role === 'student').length,
          totalInstructors: users.filter(user => user.role === 'instructor').length
        });
      } catch (err) {
        setError('Error fetching dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center my-5">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="alert alert-danger my-5">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-stats bg-primary text-white">
            <Card.Body>
              <h2>{stats.totalUsers}</h2>
              <p className="mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-stats bg-success text-white">
            <Card.Body>
              <h2>{stats.totalCourses}</h2>
              <p className="mb-0">Total Courses</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-stats bg-info text-white">
            <Card.Body>
              <h2>{stats.totalStudents}</h2>
              <p className="mb-0">Students</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-stats bg-warning text-white">
            <Card.Body>
              <h2>{stats.totalInstructors}</h2>
              <p className="mb-0">Instructors</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Header as="h5">Quick Actions</Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Button 
                    as={Link} 
                    to="/admin/users/new" 
                    variant="primary" 
                    className="w-100"
                  >
                    Add New User
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    as={Link} 
                    to="/admin/users" 
                    variant="secondary" 
                    className="w-100"
                  >
                    Manage Users
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    as={Link} 
                    to="/courses" 
                    variant="info" 
                    className="w-100 text-white"
                  >
                    View All Courses
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    as="a" 
                    href="http://localhost:9000" 
                    target="_blank" 
                    variant="dark" 
                    className="w-100"
                  >
                    Open SonarQube
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header as="h5">Recent Users</Card.Header>
            <Card.Body>
              <p>Display newest users here...</p>
              <Button as={Link} to="/admin/users" variant="primary">
                View All Users
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header as="h5">Recent Courses</Card.Header>
            <Card.Body>
              <p>Display newest courses here...</p>
              <Button as={Link} to="/courses" variant="primary">
                View All Courses
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 