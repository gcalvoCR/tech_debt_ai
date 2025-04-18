import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar la lista de cursos
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Error al cargar los cursos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="text-center my-5">Cargando cursos...</div>;
  }

  if (error) {
    return <div className="alert alert-danger my-3">{error}</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="my-5 text-center">
        <h2>Lista de Cursos</h2>
        <p className="text-muted">No hay cursos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lista de Cursos</h2>
      </div>

      <Row>
        {courses.map(course => (
          <Col md={4} key={course.id} className="mb-4">
            <Card className="h-100 course-card">
              <Card.Body>
                <Card.Title>{course.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Código: {course.code}
                </Card.Subtitle>
                {course.active ? (
                  <Badge bg="success" className="mb-2">Activo</Badge>
                ) : (
                  <Badge bg="secondary" className="mb-2">Inactivo</Badge>
                )}
                <Card.Text>
                  {course.description ? (
                    course.description.substring(0, 100) + (course.description.length > 100 ? '...' : '')
                  ) : (
                    'Sin descripción'
                  )}
                </Card.Text>
                {course.instructor && (
                  <p className="mb-1">
                    <small>
                      Profesor: {course.instructor.firstName} {course.instructor.lastName}
                    </small>
                  </p>
                )}
              </Card.Body>
              <Card.Footer>
                <Button 
                  as={Link} 
                  to={`/courses/${course.id}`} 
                  variant="primary" 
                  size="sm"
                >
                  Ver Detalles
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CourseList; 