const ValidationUtil = require('../utils/validation.util');
const PasswordUtil = require('../utils/password.util');
const JwtUtil = require('../utils/jwt.util');
const userRepo = require('../database/user.repository');

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    accountStatus: row.account_status,
    role: row.role || 'user',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function register({ email, password, name, phoneNumber, accountType, dateOfBirth }) {
  if (!email || !password) throw new Error('Email and password are required');
  if (!ValidationUtil.isValidEmail(email)) throw new Error('Invalid email address');
  const pwdCheck = PasswordUtil.validate(password);
  if (!pwdCheck.valid) throw new Error(pwdCheck.errors.join(', '));

  const existing = await userRepo.findByEmail(email);
  if (existing) throw new Error('User already exists');

  const passwordHash = await PasswordUtil.hash(password);

  // Map accountType to role (default to 'user' if not provided)
  let role = 'user';
  if (accountType === 'guest') role = 'guest';
  if (accountType === 'owner') role = 'owner';

  // Format dateOfBirth for database (convert ISO string to DATE format)
  let formattedDateOfBirth = null;
  if (dateOfBirth) {
    try {
      // #region agent log
      const fs = require('fs');
      const logPath = '/home/ace/School/Real-Estate-Management-App/.cursor/debug.log';
      const logEntry = JSON.stringify({location:'auth.service.js:register:date-format',message:'Formatting dateOfBirth',data:{originalDateOfBirth:dateOfBirth,type:typeof dateOfBirth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
      fs.appendFileSync(logPath, logEntry);
      // #endregion
      
      // Handle both ISO strings and Date objects
      let date;
      if (dateOfBirth instanceof Date) {
        date = dateOfBirth;
      } else if (typeof dateOfBirth === 'string') {
        // If it's an ISO string, parse it
        date = new Date(dateOfBirth);
      } else {
        date = new Date(dateOfBirth);
      }
      
      if (!isNaN(date.getTime())) {
        // Format as YYYY-MM-DD for MySQL DATE type
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDateOfBirth = `${year}-${month}-${day}`;
        
        // #region agent log
        const logEntry2 = JSON.stringify({location:'auth.service.js:register:date-formatted',message:'Date formatted successfully',data:{original:dateOfBirth,formatted:formattedDateOfBirth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
        fs.appendFileSync(logPath, logEntry2);
        // #endregion
      } else {
        // #region agent log
        const logEntry3 = JSON.stringify({location:'auth.service.js:register:date-invalid',message:'Invalid date - NaN',data:{dateOfBirth:dateOfBirth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
        fs.appendFileSync(logPath, logEntry3);
        // #endregion
      }
    } catch (e) {
      // Invalid date, leave as null
      // #region agent log
      const fs = require('fs');
      const logPath = '/home/ace/School/Real-Estate-Management-App/.cursor/debug.log';
      const logEntry4 = JSON.stringify({location:'auth.service.js:register:date-error',message:'Date formatting error',data:{dateOfBirth:dateOfBirth,error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
      fs.appendFileSync(logPath, logEntry4);
      // #endregion
      console.warn('Invalid dateOfBirth provided:', dateOfBirth, e);
    }
  } else {
    // #region agent log
    const fs = require('fs');
    const logPath = '/home/ace/School/Real-Estate-Management-App/.cursor/debug.log';
    const logEntry5 = JSON.stringify({location:'auth.service.js:register:date-null',message:'dateOfBirth is null/undefined',data:{dateOfBirth:dateOfBirth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
    fs.appendFileSync(logPath, logEntry5);
    // #endregion
  }

  // #region agent log
  const fs = require('fs');
  const logPath = '/home/ace/School/Real-Estate-Management-App/.cursor/debug.log';
  const logEntry6 = JSON.stringify({location:'auth.service.js:register:before-createUser',message:'Before calling createUser',data:{formattedDateOfBirth:formattedDateOfBirth,email:email,hasName:!!name,hasPhoneNumber:!!phoneNumber,role:role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
  fs.appendFileSync(logPath, logEntry6);
  // #endregion

  const user = await userRepo.createUser({ 
    email, 
    passwordHash, 
    name, 
    phoneNumber, 
    role, 
    dateOfBirth: formattedDateOfBirth 
  });

  const tokens = JwtUtil.generateTokenPair(user.id, user.email);
  return { user: toPublicUser(user), tokens };
}

async function login({ email, password }) {
  if (!email || !password) throw new Error('Email and password are required');
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  if (user.account_status !== 'active') throw new Error('Account disabled');
  const ok = await PasswordUtil.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');
  const tokens = JwtUtil.generateTokenPair(user.id, user.email);
  return { user: toPublicUser(user), tokens };
}

async function refreshToken(refreshToken) {
  const payload = JwtUtil.verifyToken(refreshToken);
  const user = await userRepo.findById(payload.userId);
  if (!user) throw new Error('User not found');
  if (user.account_status !== 'active') throw new Error('Account disabled');
  return JwtUtil.generateTokenPair(user.id, user.email);
}

async function getUserById(id) {
  const user = await userRepo.findById(id);
  return toPublicUser(user);
}

async function forgotPassword({ email, phoneNumber }) {
  let user;
  if (email) {
    user = await userRepo.findByEmail(email);
  } else if (phoneNumber) {
    user = await userRepo.findByPhoneNumber(phoneNumber);
  }

  if (!user) {
    // Return success even if user not found to prevent enumeration
    return { message: 'If an account exists, an OTP has been sent.' };
  }

  // Mock OTP sending
  // In real app: generate OTP, save to DB/Redis with expiry, send via Email/SMS
  console.log(`[MOCK] OTP for user ${user.id}: 1234`);

  return { message: 'OTP sent successfully' };
}

async function verifyOtp({ email, phoneNumber, otp }) {
  // Mock verification
  if (otp === '1234') {
    return { valid: true, message: 'OTP verified' };
  }
  throw new Error('Invalid OTP');
}

async function resetPassword({ email, phoneNumber, newPassword }) {
  let user;
  if (email) {
    user = await userRepo.findByEmail(email);
  } else if (phoneNumber) {
    user = await userRepo.findByPhoneNumber(phoneNumber);
  }

  if (!user) throw new Error('User not found');

  const passwordHash = await PasswordUtil.hash(newPassword);
  await userRepo.updateUser(user.id, { passwordHash });

  return { message: 'Password reset successfully' };
}

module.exports = {
  register,
  login,
  refreshToken,
  getUserById,
  forgotPassword,
  verifyOtp,
  resetPassword,
};

