import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Row, Col } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseDetails = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar los detalles del curso
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Error al cargar los detalles del curso. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await axios.post(`/api/courses/enroll/${id}`);
      // Actualizar el estado del curso para reflejar la inscripción
      setCourse({
        ...course,
        enrolled: true
      });
      alert('¡Inscripción exitosa!');
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Error al inscribirse en el curso. Por favor, intente nuevamente.');
    }
  };

  const handleUnenroll = async () => {
    try {
      await axios.delete(`/api/courses/enroll/${id}`);
      // Actualizar el estado del curso para reflejar la cancelación de inscripción
      setCourse({
        ...course,
        enrolled: false
      });
      alert('Has cancelado tu inscripción al curso.');
    } catch (err) {
      console.error('Error unenrolling from course:', err);
      alert('Error al cancelar la inscripción. Por favor, intente nuevamente.');
    }
  };

  if (loading) {
    return <div className="text-center my-5">Cargando detalles del curso...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!course) {
    return <Alert variant="warning">No se encontró el curso solicitado.</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{course.title}</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/courses"
            className="me-2"
          >
            Volver a la lista
          </Button>
          
          {user && user.role === 'instructor' && course.instructorId === user.id && (
            <Button 
              variant="outline-primary" 
              as={Link} 
              to={`/instructor/courses/edit/${course.id}`}
            >
              Editar curso
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between">
          <div>
            <Badge bg="secondary" className="me-2">Código: {course.code}</Badge>
            {course.active ? (
              <Badge bg="success">Activo</Badge>
            ) : (
              <Badge bg="secondary">Inactivo</Badge>
            )}
          </div>
          {course.instructor && (
            <span>Profesor: {course.instructor.firstName} {course.instructor.lastName}</span>
          )}
        </Card.Header>
        <Card.Body>
          <Card.Title>Descripción</Card.Title>
          <Card.Text>
            {course.description || 'Sin descripción.'}
          </Card.Text>

          <Row className="mt-4">
            <Col md={6}>
              <h5>Fechas</h5>
              <p>
                <strong>Fecha de inicio:</strong> {' '}
                {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'No definida'}
              </p>
              <p>
                <strong>Fecha de finalización:</strong> {' '}
                {course.endDate ? new Date(course.endDate).toLocaleDateString() : 'No definida'}
              </p>
            </Col>
            {user && user.role === 'student' && (
              <Col md={6} className="d-flex align-items-center justify-content-end">
                {course.enrolled ? (
                  <Button 
                    variant="outline-danger" 
                    onClick={handleUnenroll}
                  >
                    Cancelar inscripción
                  </Button>
                ) : (
                  <Button 
                    variant="success" 
                    onClick={handleEnroll}
                    disabled={!course.active}
                  >
                    Inscribirse
                  </Button>
                )}
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CourseDetails; 