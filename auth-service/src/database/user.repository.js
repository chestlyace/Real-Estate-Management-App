const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./mysql');

function mapDbError(err) {
  const msg = (err && err.code) ? `Database error (${err.code})` : 'Database error';
  const e = new Error(msg);
  e.original = err;
  return e;
}

async function createUser({ email, passwordHash, name, role, phoneNumber, dateOfBirth }) {
  try {
    // #region agent log
    const fs = require('fs');
    const logPath = '/home/ace/School/Real-Estate-Management-App/.cursor/debug.log';
    const logEntry = JSON.stringify({location:'user.repository.js:createUser:entry',message:'createUser called',data:{hasEmail:!!email,hasPasswordHash:!!passwordHash,hasName:!!name,role:role,hasPhoneNumber:!!phoneNumber,dateOfBirth:dateOfBirth,dateOfBirthType:typeof dateOfBirth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
    fs.appendFileSync(logPath, logEntry);
    // #endregion
    
    const pool = getPool();
    const id = uuidv4();
    
    // Ensure dateOfBirth is in YYYY-MM-DD format or null
    let dbDateOfBirth = null;
    if (dateOfBirth) {
      // If it's already in YYYY-MM-DD format, use it
      if (typeof dateOfBirth === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        dbDateOfBirth = dateOfBirth;
      } else {
        // Try to parse and format
        try {
          const date = new Date(dateOfBirth);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            dbDateOfBirth = `${year}-${month}-${day}`;
          }
        } catch (e) {
          // Invalid date, leave as null
          console.warn('Invalid dateOfBirth in createUser:', dateOfBirth, e);
        }
      }
    }
    
    // #region agent log
    const logEntry2 = JSON.stringify({location:'user.repository.js:createUser:before-execute',message:'Before SQL execute',data:{dbDateOfBirth:dbDateOfBirth,originalDateOfBirth:dateOfBirth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
    fs.appendFileSync(logPath, logEntry2);
    // #endregion
    
    const sql = `INSERT INTO users (id, email, password_hash, name, role, phone_number, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await pool.execute(sql, [id, email, passwordHash, name || null, role || 'user', phoneNumber || null, dbDateOfBirth]);
    
    // #region agent log
    const logEntry3 = JSON.stringify({location:'user.repository.js:createUser:success',message:'User created successfully',data:{id:id,email:email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
    fs.appendFileSync(logPath, logEntry3);
    // #endregion
    
    return findById(id);
  } catch (err) {
    // #region agent log
    const fs = require('fs');
    const logPath = '/home/ace/School/Real-Estate-Management-App/.cursor/debug.log';
    const logEntry4 = JSON.stringify({location:'user.repository.js:createUser:error',message:'Error in createUser',data:{error:err.message,code:err.code,sqlState:err.sqlState,sqlMessage:err.sqlMessage,dateOfBirth:dateOfBirth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n';
    fs.appendFileSync(logPath, logEntry4);
    // #endregion
    throw mapDbError(err);
  }
}

async function findById(id) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows[0] || null;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function findByEmail(email) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0] || null;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function findByPhoneNumber(phoneNumber) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM users WHERE phone_number = ?`, [phoneNumber]);
    return rows[0] || null;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function updateUser(id, updates) {
  try {
    const pool = getPool();
    const fields = [];
    const values = [];
    if (typeof updates.email === 'string') { fields.push('email = ?'); values.push(updates.email); }
    if (typeof updates.passwordHash === 'string') { fields.push('password_hash = ?'); values.push(updates.passwordHash); }
    if (typeof updates.name !== 'undefined') { fields.push('name = ?'); values.push(updates.name); }
    if (typeof updates.phone_number !== 'undefined') { fields.push('phone_number = ?'); values.push(updates.phone_number); }
    if (typeof updates.date_of_birth !== 'undefined') { fields.push('date_of_birth = ?'); values.push(updates.date_of_birth); }
    if (typeof updates.account_status === 'string') { fields.push('account_status = ?'); values.push(updates.account_status); }
    if (typeof updates.role === 'string') { fields.push('role = ?'); values.push(updates.role); }
    if (fields.length === 0) return findById(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    await pool.execute(sql, values);
    return findById(id);
  } catch (err) {
    throw mapDbError(err);
  }
}

async function deleteUser(id) {
  try {
    const pool = getPool();
    const [res] = await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);
    return res.affectedRows > 0;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function findAll(filters = {}) {
  try {
    const pool = getPool();
    let sql = `SELECT * FROM users WHERE 1=1`;
    const values = [];

    if (filters.account_status) {
      sql += ` AND account_status = ?`;
      values.push(filters.account_status);
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (err) {
    throw mapDbError(err);
  }
}

module.exports = {
  createUser,
  findById,
  findByEmail,
  findByPhoneNumber,
  updateUser,
  deleteUser,
  findAll,
};

