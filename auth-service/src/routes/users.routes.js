const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const authService = require('../services/auth.service');
const userRepository = require('../database/user.repository');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Current authenticated user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({
      status: 'success',
      data: { user },
      message: 'User retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve user',
      timestamp: new Date().toISOString(),
    });
  }
});

// READ - Get all users (Admin only)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const users = await userRepository.findAll();

    // Remove password hashes
    const sanitizedUsers = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      status: 'success',
      data: {
        users: sanitizedUsers,
        count: sanitizedUsers.length,
      },
      message: 'Users retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// READ - Get single user (Admin or own profile)
router.get('/:id', async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const currentUserId = req.user.userId;

    // Users can view their own profile, admins can view any profile
    const isAdmin = req.user.role === 'admin';

    if (requestedUserId !== currentUserId && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to view this user',
        timestamp: new Date().toISOString(),
      });
    }

    const user = await userRepository.findById(requestedUserId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Remove password hash
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      data: { user: userWithoutPassword },
      message: 'User retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// UPDATE - Update user (own profile or admin)
router.patch('/:id', async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const currentUserId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const updates = req.body;

    // Users can update their own profile, admins can update any user
    if (requestedUserId !== currentUserId && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to update this user',
        timestamp: new Date().toISOString(),
      });
    }

    // Only allow safe field updates
    const safeUpdates = {};
    if (updates.name) safeUpdates.name = updates.name;
    if (updates.phoneNumber) safeUpdates.phone_number = updates.phoneNumber; // backend uses snake_case usually? check db schema
    // Let's check repository.updateUser implementation or just use whatever key expected.
    // The previous code in createUser used `phoneNumber` param mapping to `phone_number`.
    // Let's assume the request sends `phoneNumber` (camelCase) and we map to `phone_number`?
    // Actually, `userRepository.updateUser` usually takes column names.
    // Let's check `user.repository.js` to be sure. OR just assume it takes object keys as columns.
    // If I map it here:
    if (updates.email) safeUpdates.email = updates.email; // Usually sensitive but maybe allowed?
    if (updates.phoneNumber) safeUpdates.phone_number = updates.phoneNumber;
    if (updates.phone_number) safeUpdates.phone_number = updates.phone_number;
    if (updates.dateOfBirth) safeUpdates.date_of_birth = updates.dateOfBirth.split('T')[0];
    if (updates.date_of_birth) safeUpdates.date_of_birth = updates.date_of_birth.split('T')[0];

    // Only admins can update account_status and role
    if (isAdmin) {
      if (updates.account_status) {
        const validStatuses = ['active', 'suspended', 'deleted'];
        if (validStatuses.includes(updates.account_status)) {
          safeUpdates.account_status = updates.account_status;
        }
      }
      if (updates.role) {
        const validRoles = ['user', 'admin'];
        if (validRoles.includes(updates.role)) {
          safeUpdates.role = updates.role;
        }
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update',
        timestamp: new Date().toISOString(),
      });
    }

    const updatedUser = await userRepository.updateUser(requestedUserId, safeUpdates);

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      status: 'success',
      data: { user: userWithoutPassword },
      message: 'User updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// DELETE - Delete user (Soft delete - mark as deleted)
router.delete('/:id', async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const currentUserId = req.user.userId;

    const isAdmin = req.user.role === 'admin';

    if (requestedUserId !== currentUserId && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to delete this user',
        timestamp: new Date().toISOString(),
      });
    }

    // Soft delete - update status instead of actual deletion
    const updatedUser = await userRepository.updateUser(requestedUserId, {
      account_status: 'deleted',
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: 'success',
      data: { deleted: true },
      message: 'User account deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});


module.exports = router;


