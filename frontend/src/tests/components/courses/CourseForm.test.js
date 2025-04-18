import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import CourseForm from '../../../components/courses/CourseForm';

// Mock axios
jest.mock('axios');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: undefined })
}));

describe('CourseForm Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ 
      data: [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' }
      ] 
    });
    axios.post.mockResolvedValue({ data: { id: 1, title: 'Test Course' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form with correct elements', () => {
    render(
      <BrowserRouter>
        <CourseForm />
      </BrowserRouter>
    );

    // Check if title and elements exist
    expect(screen.getByText('Crear Nuevo Curso')).toBeInTheDocument();
    
    // Use getByRole instead of getByLabelText
    expect(screen.getByRole('textbox', { name: /título del curso/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /código del curso/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /descripción/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /instructor/i })).toBeInTheDocument();
    expect(screen.getByText('Curso Activo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear curso/i })).toBeInTheDocument();
  });

  test('loads instructors on component mount', async () => {
    render(
      <BrowserRouter>
        <CourseForm />
      </BrowserRouter>
    );

    // Check if axios.get was called to fetch instructors
    expect(axios.get).toHaveBeenCalledWith('/api/instructors');
    
    // Wait for instructors to be loaded in the dropdown
    await waitFor(() => {
      const instructorSelect = screen.getByRole('combobox', { name: /instructor/i });
      expect(instructorSelect).toBeInTheDocument();
      
      // Verify instructor options are rendered
      expect(screen.getByText('Seleccionar instructor')).toBeInTheDocument();
      // We can't directly check for instructor names as the dropdown is not expanded
    });
  });

  test('validates form fields on submit', async () => {
    render(
      <BrowserRouter>
        <CourseForm />
      </BrowserRouter>
    );

    // Try to submit the form without filling required fields
    const submitButton = screen.getByRole('button', { name: /crear curso/i });
    fireEvent.click(submitButton);

    // Wait for validation to kick in
    await waitFor(() => {
      // Check for validation error messages
      expect(screen.getByText('El título del curso es requerido.')).toBeInTheDocument();
      expect(screen.getByText('El código del curso es requerido.')).toBeInTheDocument();
    });
  });

  test('submits form with valid data successfully', async () => {
    render(
      <BrowserRouter>
        <CourseForm />
      </BrowserRouter>
    );

    // Fill in required fields using getByRole
    fireEvent.change(screen.getByRole('textbox', { name: /título del curso/i }), {
      target: { value: 'Curso de Prueba' }
    });
    
    fireEvent.change(screen.getByRole('textbox', { name: /código del curso/i }), {
      target: { value: 'TEST101' }
    });
    
    fireEvent.change(screen.getByRole('textbox', { name: /descripción/i }), {
      target: { value: 'Descripción del curso de prueba' }
    });

    // Set instructor
    fireEvent.change(screen.getByRole('combobox', { name: /instructor/i }), {
      target: { value: '1' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /crear curso/i });
    fireEvent.click(submitButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/courses', expect.objectContaining({
        title: 'Curso de Prueba',
        code: 'TEST101',
        description: 'Descripción del curso de prueba'
      }));
      expect(screen.getByText('Curso creado con éxito.')).toBeInTheDocument();
    });
  });

  test('handles date validation correctly', async () => {
    render(
      <BrowserRouter>
        <CourseForm />
      </BrowserRouter>
    );

    // Fill in required fields first using getByRole
    fireEvent.change(screen.getByRole('textbox', { name: /título del curso/i }), {
      target: { value: 'Curso de Prueba' }
    });
    
    fireEvent.change(screen.getByRole('textbox', { name: /código del curso/i }), {
      target: { value: 'TEST101' }
    });

    // Set invalid date range (end date before start date)
    const startDateInput = screen.getByLabelText('Fecha de inicio');
    const endDateInput = screen.getByLabelText('Fecha de finalización');
    
    fireEvent.change(startDateInput, {
      target: { value: '2023-12-01' }
    });
    
    fireEvent.change(endDateInput, {
      target: { value: '2023-11-01' }
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /crear curso/i });
    fireEvent.click(submitButton);

    // Check if validation error appears
    await waitFor(() => {
      expect(screen.getByText('Por favor, corrija los errores en el formulario.')).toBeInTheDocument();
    });
  });
}); 