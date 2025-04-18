import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Accordion, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch courses
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        
        // Filter courses based on enrollment status
        const enrolled = response.data.filter(course => course.enrolled);
        const available = response.data.filter(course => !course.enrolled && course.active);
        
        setEnrolledCourses(enrolled);
        setAvailableCourses(available);
      } catch (err) {
        setError('Error fetching courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`/api/courses/enroll/${courseId}`);
      
      // Update UI after successful enrollment
      const course = availableCourses.find(c => c.id === courseId);
      if (course) {
        course.enrolled = true;
        setEnrolledCourses([...enrolledCourses, course]);
        setAvailableCourses(availableCourses.filter(c => c.id !== courseId));
      }
    } catch (err) {
      setError('Error enrolling in course');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading dashboard data...</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Student Dashboard</h1>
      
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header as="h5">My Enrolled Courses</Card.Header>
            <Card.Body>
              {enrolledCourses.length === 0 ? (
                <p className="text-muted">You are not enrolled in any courses yet.</p>
              ) : (
                <Row>
                  {enrolledCourses.map(course => (
                    <Col md={6} lg={4} key={course.id} className="mb-3">
                      <Card className="h-100 course-card">
                        <Card.Body>
                          <Card.Title>{course.title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">
                            Code: {course.code}
                          </Card.Subtitle>
                          <Card.Text>
                            {course.description?.substring(0, 100)}
                            {course.description?.length > 100 ? '...' : ''}
                          </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                          <Button 
                            as={Link} 
                            to={`/courses/${course.id}`} 
                            variant="primary" 
                            size="sm"
                          >
                            View Course
                          </Button>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Available Courses</Card.Header>
            <Card.Body>
              {availableCourses.length === 0 ? (
                <p className="text-muted">No available courses found.</p>
              ) : (
                <Accordion>
                  {availableCourses.map(course => (
                    <Accordion.Item eventKey={course.id.toString()} key={course.id}>
                      <Accordion.Header>
                        {course.title} <Badge bg="secondary" className="ms-2">{course.code}</Badge>
                      </Accordion.Header>
                      <Accordion.Body>
                        <p>{course.description}</p>
                        <p className="mb-2">
                          <strong>Instructor:</strong> {course.instructor.firstName} {course.instructor.lastName}
                        </p>
                        {course.startDate && (
                          <p className="mb-2">
                            <strong>Start Date:</strong> {new Date(course.startDate).toLocaleDateString()}
                          </p>
                        )}
                        <Button 
                          onClick={() => handleEnroll(course.id)} 
                          variant="success" 
                          size="sm"
                        >
                          Enroll Now
                        </Button>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard; 