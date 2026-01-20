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

  const pool = getPool();

  // Users table
  await pool.query(`
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
  `);

  // Properties table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id CHAR(36) NOT NULL,
      owner_id CHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      location VARCHAR(500) NOT NULL,
      city VARCHAR(100) NULL,
      region VARCHAR(100) NULL,
      price DECIMAL(15, 2) NOT NULL,
      size_sqft INT NULL,
      bedrooms INT NOT NULL DEFAULT 0,
      bathrooms INT NOT NULL DEFAULT 0,
      max_guests INT NOT NULL DEFAULT 1,
      amenities TEXT NULL,
      instant_booking BOOLEAN NOT NULL DEFAULT FALSE,
      property_type ENUM('house', 'apartment', 'land', 'commercial', 'other') NOT NULL DEFAULT 'house',
      status ENUM('active', 'pending', 'sold', 'rented', 'suspended') NOT NULL DEFAULT 'active',
      listing_type ENUM('sale', 'rent') NOT NULL DEFAULT 'sale',
      image_url VARCHAR(500) NULL,
      views INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_owner_id (owner_id),
      INDEX idx_status (status),
      INDEX idx_listing_type (listing_type),
      INDEX idx_city (city),
      INDEX idx_region (region),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ensure columns exist (for existing tables)
  const columnsToEnsure = [
    { name: 'bedrooms', type: 'INT NOT NULL DEFAULT 0' },
    { name: 'bathrooms', type: 'INT NOT NULL DEFAULT 0' },
    { name: 'max_guests', type: 'INT NOT NULL DEFAULT 1' },
    { name: 'amenities', type: 'TEXT NULL' },
    { name: 'instant_booking', type: 'BOOLEAN NOT NULL DEFAULT FALSE' }
  ];

  for (const col of columnsToEnsure) {
    try {
      const [existing] = await pool.query(`SHOW COLUMNS FROM properties LIKE ?`, [col.name]);
      if (existing.length === 0) {
        await pool.query(`ALTER TABLE properties ADD COLUMN ${col.name} ${col.type}`);
      }
    } catch (err) {
      console.warn(`Could not add column ${col.name}: ${err.message}`);
    }
  }

  // Transactions (Sales/Rentals) table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id CHAR(36) NOT NULL,
      property_id CHAR(36) NOT NULL,
      buyer_id CHAR(36) NOT NULL,
      seller_id CHAR(36) NOT NULL,
      transaction_type ENUM('sale', 'rent') NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      status ENUM('pending', 'paid', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
      transaction_date DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_property_id (property_id),
      INDEX idx_buyer_id (buyer_id),
      INDEX idx_seller_id (seller_id),
      INDEX idx_status (status),
      INDEX idx_transaction_type (transaction_type),
      INDEX idx_transaction_date (transaction_date),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Maintenance costs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS maintenance_costs (
      id CHAR(36) NOT NULL,
      property_id CHAR(36) NOT NULL,
      description VARCHAR(500) NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      maintenance_date DATE NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_property_id (property_id),
      INDEX idx_maintenance_date (maintenance_date),
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('✓ Database schema initialized successfully');
}

module.exports = {
  getPool,
  initSchema,
};

