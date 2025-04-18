import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    password: '',
    confirmPassword: '',
    active: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/users/${id}`);
      const userData = response.data;
      // Omit password fields when editing
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        active: userData.active,
        password: '', // Empty for security
        confirmPassword: '' // Empty for security
      });
      setError('');
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('No se pudo cargar los datos del usuario. Por favor, intente nuevamente.');
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
    if (!formData.firstName.trim()) errors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) errors.lastName = 'El apellido es requerido';
    if (!formData.email.trim()) errors.email = 'El email es requerido';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }

    // Password validation for new users
    if (!isEditMode) {
      if (!formData.password) errors.password = 'La contraseña es requerida para nuevos usuarios';
      else if (formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (formData.password && formData.password.length < 6) {
      // If editing and password provided, validate it
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
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
      
      const dataToSend = { ...formData };
      
      // Don't send password fields if they're empty when editing
      if (isEditMode && !dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.confirmPassword;
      }
      
      if (isEditMode) {
        await axios.put(`/api/admin/users/${id}`, dataToSend);
        setSuccess('Usuario actualizado con éxito.');
      } else {
        await axios.post('/api/admin/users', dataToSend);
        setSuccess('Usuario creado con éxito.');
        // Clear form for new entry
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'student',
          password: '',
          confirmPassword: '',
          active: true
        });
        setValidated(false);
      }
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Error al guardar el usuario. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form">
      <h2>{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    isInvalid={validated && !formData.firstName}
                  />
                  <Form.Control.Feedback type="invalid">
                    El nombre es requerido.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    isInvalid={validated && !formData.lastName}
                  />
                  <Form.Control.Feedback type="invalid">
                    El apellido es requerido.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                isInvalid={validated && (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
              />
              <Form.Control.Feedback type="invalid">
                Ingrese un email válido.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Estudiante</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{isEditMode ? 'Nueva Contraseña (dejar en blanco para mantener actual)' : 'Contraseña'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEditMode}
                    isInvalid={validated && (((!isEditMode && !formData.password) || (formData.password && formData.password.length < 6)))}
                  />
                  <Form.Control.Feedback type="invalid">
                    La contraseña debe tener al menos 6 caracteres.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isEditMode}
                    isInvalid={validated && formData.password !== formData.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    Las contraseñas no coinciden.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="active"
                name="active"
                label="Usuario Activo"
                checked={formData.active}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserForm; 