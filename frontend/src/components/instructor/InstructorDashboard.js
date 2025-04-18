import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch instructor's courses
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data);
      } catch (err) {
        setError('Error fetching courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleCourseStatus = async (courseId, currentStatus) => {
    try {
      await axios.put(`/api/courses/${courseId}`, { active: !currentStatus });
      
      // Update UI after successful update
      setCourses(courses.map(course => 
        course.id === courseId 
          ? { ...course, active: !course.active } 
          : course
      ));
    } catch (err) {
      setError('Error updating course status');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading dashboard data...</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Instructor Dashboard</h1>
      
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Courses</h5>
              <Button 
                as={Link} 
                to="/instructor/courses/new" 
                variant="primary" 
                size="sm"
              >
                Create New Course
              </Button>
            </Card.Header>
            <Card.Body>
              {courses.length === 0 ? (
                <p className="text-muted">You have not created any courses yet.</p>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Code</th>
                      <th>Status</th>
                      <th>Students</th>
                      <th>Start Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td>{course.title}</td>
                        <td>{course.code}</td>
                        <td>
                          <Badge bg={course.active ? 'success' : 'secondary'}>
                            {course.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>{course.students?.length || 0}</td>
                        <td>
                          {course.startDate 
                            ? new Date(course.startDate).toLocaleDateString() 
                            : 'Not set'}
                        </td>
                        <td>
                          <Button 
                            as={Link} 
                            to={`/courses/${course.id}`} 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                          >
                            View
                          </Button>
                          <Button 
                            as={Link} 
                            to={`/instructor/courses/edit/${course.id}`} 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-2"
                          >
                            Edit
                          </Button>
                          <Button 
                            onClick={() => toggleCourseStatus(course.id, course.active)} 
                            variant={course.active ? "outline-danger" : "outline-success"} 
                            size="sm"
                          >
                            {course.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header as="h5">Course Statistics</Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <Card className="dashboard-stats bg-info text-white">
                    <Card.Body className="text-center">
                      <h3>{courses.length}</h3>
                      <p className="mb-0">Total Courses</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="dashboard-stats bg-success text-white">
                    <Card.Body className="text-center">
                      <h3>{courses.filter(course => course.active).length}</h3>
                      <p className="mb-0">Active Courses</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header as="h5">Quick Actions</Card.Header>
            <Card.Body>
              <Button 
                as={Link} 
                to="/instructor/courses/new" 
                variant="primary" 
                className="me-3 mb-2"
              >
                Create New Course
              </Button>
              <Button 
                as="a" 
                href="http://localhost:9000" 
                target="_blank" 
                variant="dark" 
                className="mb-2"
              >
                Open SonarQube
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InstructorDashboard; 