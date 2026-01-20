const express = require('express');
const propertyController = require('../controllers/property.controller');
// const authMiddleware = require('../middleware/auth.middleware'); // Assuming auth is required for creation

const router = express.Router();

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/stats', propertyController.getPropertyStats);
router.get('/:id', propertyController.getPropertyById);

// Protected routes (Commented out auth for now to allow easier seeding/testing, or make it open)
router.post('/', propertyController.createProperty);

module.exports = router;
