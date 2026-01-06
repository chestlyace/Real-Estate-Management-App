const mysql = require('mysql2/promise');
const config = require('../src/config/config');

async function updateSchema() {
    console.log('Connecting to database...');
    const conn = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
    });

    try {
        console.log('Updating users table schema...');
        // Update ENUM to include 'guest' and 'owner'
        await conn.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('user', 'admin', 'guest', 'owner') NOT NULL DEFAULT 'user'
    `);
        console.log('Schema updated successfully!');
    } catch (error) {
        console.error('Failed to update schema:', error);
    } finally {
        await conn.end();
    }
}

updateSchema();
