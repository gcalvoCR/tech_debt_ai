import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // Helper function to get role-specific links
  const getRoleLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return (
          <>
            <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/users">Manage Users</Nav.Link>
            <Nav.Link as={Link} to="/courses">All Courses</Nav.Link>
          </>
        );
      case 'instructor':
        return (
          <>
            <Nav.Link as={Link} to="/instructor/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/instructor/courses/new">Create Course</Nav.Link>
            <Nav.Link as={Link} to="/courses">My Courses</Nav.Link>
          </>
        );
      case 'student':
        return (
          <>
            <Nav.Link as={Link} to="/student/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">Educational Platform</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && getRoleLinks()}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-light">
                    Welcome, {user.firstName} ({user.role})
                  </span>
                </Nav.Item>
                <Button variant="outline-light" onClick={onLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 