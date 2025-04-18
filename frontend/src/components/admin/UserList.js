import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Form, InputGroup, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaUserPlus } from 'react-icons/fa';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar la lista de usuarios. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        // Actualizar la lista de usuarios después de eliminar
        setUsers(users.filter(user => user.id !== userId));
        alert('Usuario eliminado con éxito');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Error al eliminar el usuario. Por favor, intente nuevamente.');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    // Filtrar por término de búsqueda
    const searchMatch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por rol
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    
    return searchMatch && roleMatch;
  });

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return <Badge bg="danger">Administrador</Badge>;
      case 'instructor':
        return <Badge bg="primary">Instructor</Badge>;
      case 'student':
        return <Badge bg="success">Estudiante</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="user-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <Button 
          variant="primary" 
          as={Link} 
          to="/admin/users/new"
          className="d-flex align-items-center"
        >
          <FaUserPlus className="me-2" /> Nuevo Usuario
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="instructor">Instructores</option>
            <option value="student">Estudiantes</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">Cargando usuarios...</div>
      ) : filteredUsers.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>
                  {user.active ? (
                    <Badge bg="success">Activo</Badge>
                  ) : (
                    <Badge bg="secondary">Inactivo</Badge>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    as={Link}
                    to={`/admin/users/edit/${user.id}`}
                    className="me-2"
                  >
                    <FaEdit /> Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                  >
                    <FaTrash /> Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          {searchTerm || roleFilter !== 'all' 
            ? 'No se encontraron usuarios que coincidan con los criterios de búsqueda.' 
            : 'No hay usuarios registrados en el sistema.'}
        </Alert>
      )}
    </div>
  );
};

export default UserList; 