import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    active: true
  });

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    fetchInstructors();
    
    if (isEditMode) {
      fetchCourseData();
    }
  }, [id]);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get('/api/instructors');
      setInstructors(response.data);
    } catch (err) {
      console.error('Error fetching instructors:', err);
      setError('No se pudieron cargar los instructores. Por favor, intente nuevamente.');
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${id}`);
      const courseData = response.data;
      
      setFormData({
        title: courseData.title,
        code: courseData.code,
        description: courseData.description || '',
        instructorId: courseData.instructorId || '',
        startDate: courseData.startDate ? new Date(courseData.startDate).toISOString().split('T')[0] : '',
        endDate: courseData.endDate ? new Date(courseData.endDate).toISOString().split('T')[0] : '',
        active: courseData.active
      });
      setError('');
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('No se pudo cargar los datos del curso. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validate required fields
    if (!formData.title.trim()) errors.title = 'El título es requerido';
    if (!formData.code.trim()) errors.code = 'El código es requerido';
    
    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        errors.endDate = 'La fecha de finalización debe ser posterior a la fecha de inicio';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);
    
    // Perform custom validation
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setError('Por favor, corrija los errores en el formulario.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (isEditMode) {
        await axios.put(`/api/courses/${id}`, formData);
        setSuccess('Curso actualizado con éxito.');
      } else {
        await axios.post('/api/courses', formData);
        setSuccess('Curso creado con éxito.');
        // Clear form for new entry
        setFormData({
          title: '',
          code: '',
          description: '',
          instructorId: '',
          startDate: '',
          endDate: '',
          active: true
        });
        setValidated(false);
      }
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/courses');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err.response?.data?.message || 'Error al guardar el curso. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-form">
      <h2>{isEditMode ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="title">Título del Curso</Form.Label>
                  <Form.Control
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    isInvalid={validated && !formData.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    El título del curso es requerido.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="code">Código del Curso</Form.Label>
                  <Form.Control
                    id="code"
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    isInvalid={validated && !formData.code}
                  />
                  <Form.Control.Feedback type="invalid">
                    El código del curso es requerido.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label htmlFor="description">Descripción</Form.Label>
              <Form.Control
                id="description"
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label htmlFor="instructorId">Instructor</Form.Label>
              <Form.Select
                id="instructorId"
                name="instructorId"
                value={formData.instructorId || ''}
                onChange={handleChange}
              >
                <option value="">Seleccionar instructor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="startDate">Fecha de inicio</Form.Label>
                  <Form.Control
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="endDate">Fecha de finalización</Form.Label>
                  <Form.Control
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    isInvalid={validated && formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)}
                  />
                  <Form.Control.Feedback type="invalid">
                    La fecha de finalización debe ser posterior a la fecha de inicio.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="active"
                name="active"
                label="Curso Activo"
                checked={formData.active}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/courses')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar Curso' : 'Crear Curso'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CourseForm; 