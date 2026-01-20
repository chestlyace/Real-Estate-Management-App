const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const upload = require('../middleware/upload.middleware');
const verifyToken = require('../middleware/auth.middleware');

router.post('/upload', verifyToken, upload.single('document'), kycController.uploadDocument);
router.get('/status', verifyToken, kycController.getStatus);

module.exports = router;
