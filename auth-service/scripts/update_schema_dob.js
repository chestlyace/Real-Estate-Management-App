const mysql = require('mysql2/promise');
const config = require('../src/config/config');

async function updateSchemaDOB() {
    console.log('Connecting to database...');
    const conn = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
    });

    try {
        console.log('Adding date_of_birth column to users table...');
        // Add date_of_birth column if it doesn't exist
        // Note: 'IF NOT EXISTS' for columns is not standard in simplified ALTER TABLE, 
        // but we can try to add it and catch error if it exists, or check first.
        // For simplicity in this dev environment, we'll try to add it.
        await conn.query(`
      ALTER TABLE users 
      ADD COLUMN date_of_birth DATE NULL AFTER name
    `);
        console.log('Schema updated successfully!');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column date_of_birth already exists.');
        } else {
            console.error('Failed to update schema:', error);
        }
    } finally {
        await conn.end();
    }
}

updateSchemaDOB();
