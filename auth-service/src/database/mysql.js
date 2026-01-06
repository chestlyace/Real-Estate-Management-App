const mysql = require('mysql2/promise');
const config = require('../config/config');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      queueLimit: 0,
    });
  }
  return pool;
}

async function ensureDatabase() {
  // Connect without selecting database to ensure it exists
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  } finally {
    await conn.end();
  }
}

async function initSchema() {
  // Ensure DB exists before creating tables
  await ensureDatabase();

  const sql = `
    CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NULL,
      date_of_birth DATE NULL,
      first_name VARCHAR(100) NULL,
      last_name VARCHAR(100) NULL,
      phone_number VARCHAR(20) NULL,
      account_status ENUM('active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',
      role ENUM('user', 'admin', 'guest', 'owner') NOT NULL DEFAULT 'user',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_email (email),
      INDEX idx_account_status (account_status),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  const pool = getPool();
  await pool.query(sql);

  console.log(' Database schema initialized successfully');
}

module.exports = {
  getPool,
  initSchema,
};

