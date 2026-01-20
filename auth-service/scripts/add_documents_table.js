const mysql = require('mysql2/promise');
const config = require('../src/config/config');

async function addDocumentsTable() {
    console.log('Connecting to database...');
    const conn = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
    });

    try {
        console.log('Creating documents table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id CHAR(36) NOT NULL,
                user_id CHAR(36) NOT NULL,
                document_type ENUM('id_card', 'passport', 'utility_bill') NOT NULL,
                file_url VARCHAR(500) NOT NULL,
                status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
                rejection_reason TEXT NULL,
                uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                verified_at DATETIME NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                INDEX idx_user_id (user_id),
                INDEX idx_status (status),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Documents table created successfully!');
    } catch (error) {
        console.error('Failed to create documents table:', error);
    } finally {
        await conn.end();
    }
}

addDocumentsTable();
