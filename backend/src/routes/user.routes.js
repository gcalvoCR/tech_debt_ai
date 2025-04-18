const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const validateUser = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['admin', 'instructor', 'student']).withMessage('Invalid role')
];

// Get all users (admin only)
router.get('/', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID (admin only, or self)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'You do not have permission to view this user' });
    }
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user details' });
  }
});

// Create user (admin only)
router.post(
  '/',
  authenticateToken,
  authorize('admin'),
  validateUser,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, password, role } = req.body;
      
      // Check required fields
      if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        active: true
      });
      
      return res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          active: user.active
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Error creating user' });
    }
  }
);

// Update user (admin only, or self)
router.put(
  '/:id',
  authenticateToken,
  validateUser,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { firstName, lastName, email, password, role, active } = req.body;
      
      // Find user
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'You do not have permission to update this user' });
      }
      
      // Regular users can't change their role or active status
      if (req.user.role !== 'admin' && (role || active !== undefined)) {
        return res.status(403).json({ message: 'You do not have permission to change role or status' });
      }
      
      // Check if updated email already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already registered' });
        }
      }
      
      // Update user
      const updatedUser = await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        ...(password && { password }),
        ...(req.user.role === 'admin' && role && { role }),
        ...(req.user.role === 'admin' && active !== undefined && { active })
      });
      
      return res.status(200).json({
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          active: updatedUser.active
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Error updating user' });
    }
  }
);

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if it's the last admin
    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    
    // Delete user
    await user.destroy();
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router; 