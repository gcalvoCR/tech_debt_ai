const express = require('express');
const { body, validationResult } = require('express-validator');
const { Course, User, Enrollment } = require('../models');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const validateCourse = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('code').trim().notEmpty().withMessage('Course code is required'),
  body('description').optional().trim(),
  body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date format')
];

// Get all courses (protected, accessible by all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let courses;
    
    // Different behavior based on user role
    switch(req.user.role) {
      case 'admin':
        // Admins can see all courses
        courses = await Course.findAll({
          include: [{
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        });
        break;
        
      case 'instructor':
        // Instructors see only their courses
        courses = await Course.findAll({
          where: { instructorId: req.user.id },
          include: [{
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        });
        break;
        
      case 'student':
        // Students see courses they're enrolled in and available courses
        const enrolledCourses = await req.user.getEnrolledCourses({
          include: [{
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        });
        
        const availableCourses = await Course.findAll({
          where: { active: true },
          include: [{
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        });
        
        // Mark enrolled courses
        const uniqueCourses = new Map();
        
        enrolledCourses.forEach(course => {
          course.dataValues.enrolled = true;
          uniqueCourses.set(course.id, course);
        });
        
        availableCourses.forEach(course => {
          if (!uniqueCourses.has(course.id)) {
            course.dataValues.enrolled = false;
            uniqueCourses.set(course.id, course);
          }
        });
        
        courses = Array.from(uniqueCourses.values());
        break;
    }
    
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Get course by ID (protected, accessible by all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByPk(id, {
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check permissions based on role
    if (req.user.role === 'student') {
      // Students can only view courses they're enrolled in or active courses
      const enrollment = await Enrollment.findOne({
        where: { UserId: req.user.id, CourseId: course.id }
      });
      
      if (!enrollment && !course.active) {
        return res.status(403).json({ message: 'You do not have access to this course' });
      }
      
      // Add enrollment status
      course.dataValues.enrolled = !!enrollment;
    } else if (req.user.role === 'instructor' && course.instructorId !== req.user.id) {
      // Instructors can only view their own courses
      return res.status(403).json({ message: 'You do not have access to this course' });
    }
    
    return res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({ message: 'Error fetching course details' });
  }
});

// Create course (protected, accessible by admin and instructor)
router.post(
  '/',
  authenticateToken,
  authorize('admin', 'instructor'),
  validateCourse,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, code, description, startDate, endDate } = req.body;
      
      // Check if course code already exists
      const existingCourse = await Course.findOne({ where: { code } });
      if (existingCourse) {
        return res.status(400).json({ message: 'Course code already exists' });
      }
      
      // Create course
      const course = await Course.create({
        title,
        code,
        description,
        startDate,
        endDate,
        instructorId: req.user.role === 'admin' && req.body.instructorId ? req.body.instructorId : req.user.id,
        active: true
      });
      
      return res.status(201).json({
        message: 'Course created successfully',
        course
      });
    } catch (error) {
      console.error('Error creating course:', error);
      return res.status(500).json({ message: 'Error creating course' });
    }
  }
);

// Update course (protected, accessible by admin and course instructor)
router.put(
  '/:id',
  authenticateToken,
  authorize('admin', 'instructor'),
  validateCourse,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, code, description, startDate, endDate, active } = req.body;
      
      // Find course
      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Check permissions
      if (req.user.role === 'instructor' && course.instructorId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to update this course' });
      }
      
      // Check if updated code already exists on a different course
      if (code !== course.code) {
        const existingCourse = await Course.findOne({ where: { code } });
        if (existingCourse && existingCourse.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Course code already exists' });
        }
      }
      
      // Update course
      const updatedCourse = await course.update({
        title: title || course.title,
        code: code || course.code,
        description: description !== undefined ? description : course.description,
        startDate: startDate || course.startDate,
        endDate: endDate || course.endDate,
        active: active !== undefined ? active : course.active,
        instructorId: req.user.role === 'admin' && req.body.instructorId ? req.body.instructorId : course.instructorId
      });
      
      return res.status(200).json({
        message: 'Course updated successfully',
        course: updatedCourse
      });
    } catch (error) {
      console.error('Error updating course:', error);
      return res.status(500).json({ message: 'Error updating course' });
    }
  }
);

// Delete course (protected, accessible by admin only)
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if there are enrollments
    const enrollmentCount = await Enrollment.count({ where: { CourseId: id } });
    if (enrollmentCount > 0) {
      // Don't delete, just mark as inactive
      await course.update({ active: false });
      return res.status(200).json({
        message: 'Course has enrolled students and has been deactivated instead of deleted'
      });
    }
    
    // Delete course
    await course.destroy();
    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({ message: 'Error deleting course' });
  }
});

// Enroll in course (protected, accessible by students)
router.post('/enroll/:id', authenticateToken, authorize('student'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course is active
    if (!course.active) {
      return res.status(400).json({ message: 'Cannot enroll in inactive course' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { UserId: req.user.id, CourseId: id }
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      UserId: req.user.id,
      CourseId: id,
      status: 'active'
    });
    
    return res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return res.status(500).json({ message: 'Error enrolling in course' });
  }
});

// Unenroll from course (protected, accessible by students)
router.delete('/enroll/:id', authenticateToken, authorize('student'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find enrollment
    const enrollment = await Enrollment.findOne({
      where: { UserId: req.user.id, CourseId: id }
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }
    
    // Delete enrollment
    await enrollment.destroy();
    
    return res.status(200).json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    return res.status(500).json({ message: 'Error unenrolling from course' });
  }
});

module.exports = router; 