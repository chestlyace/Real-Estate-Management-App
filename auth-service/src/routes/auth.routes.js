const express = require('express');
const authService = require('../services/auth.service');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  // #region agent log
  const fs = require('fs');
  const logPath = '/home/ace/School/Real-Estate-Management-App/.cursor/debug.log';
  const logEntry = JSON.stringify({location:'auth.routes.js:register:entry',message:'Registration route entry',data:{bodyKeys:Object.keys(req.body),hasEmail:!!req.body.email,hasPassword:!!req.body.password,hasName:!!req.body.name,hasPhoneNumber:!!req.body.phoneNumber,hasAccountType:!!req.body.accountType,hasDateOfBirth:!!req.body.dateOfBirth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n';
  fs.appendFileSync(logPath, logEntry);
  // #endregion
  try {
    const data = req.body;
    // #region agent log
    const logEntry2 = JSON.stringify({location:'auth.routes.js:register:before-service',message:'Before calling authService.register',data:{dataKeys:Object.keys(data)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n';
    fs.appendFileSync(logPath, logEntry2);
    // #endregion
    const result = await authService.register(data);
    // #region agent log
    const logEntry3 = JSON.stringify({location:'auth.routes.js:register:after-service',message:'After authService.register - success',data:{hasResult:!!result,hasUser:!!result.user,hasTokens:!!result.tokens},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n';
    fs.appendFileSync(logPath, logEntry3);
    // #endregion

    res.status(201).json({
      status: 'success',
      data: result,
      message: 'User registered successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // #region agent log
    const logEntry4 = JSON.stringify({location:'auth.routes.js:register:error',message:'Registration error in route',data:{name:error.name,message:error.message,stack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n';
    fs.appendFileSync(logPath, logEntry4);
    // #endregion
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Registration failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const data = req.body;
    const result = await authService.login(data);

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      status: 'error',
      message: error.message || 'Login failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required',
        timestamp: new Date().toISOString(),
      });
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.status(200).json({
      status: 'success',
      data: { tokens },
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message || 'Token refresh failed',
      timestamp: new Date().toISOString(),
    });
  }
});



// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logout successful',
    timestamp: new Date().toISOString(),
  });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const result = await authService.verifyOtp(req.body);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

module.exports = router;