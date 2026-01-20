const { getPool } = require('../database/mysql');
const { v4: uuidv4 } = require('uuid');

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded' });
        }

        const { type } = req.body;
        const userId = req.user.userId;
        const fileUrl = `/uploads/documents/${req.file.filename}`;

        if (!type || !['id_card', 'passport', 'utility_bill'].includes(type)) {
            return res.status(400).json({ status: 'error', message: 'Invalid document type' });
        }

        const pool = getPool();
        const id = uuidv4();

        // Check if document of this type already exists for user, if so, update or reject?
        // Project requirement says "upload", usually can re-upload.
        // Let's Insert.

        await pool.query(
            `INSERT INTO documents (id, user_id, document_type, file_url, status) VALUES (?, ?, ?, ?, 'pending')`,
            [id, userId, type, fileUrl]
        );

        res.status(201).json({
            status: 'success',
            message: 'Document uploaded successfully',
            data: {
                id,
                type,
                status: 'pending',
                fileUrl,
            },
        });
    } catch (error) {
        console.error('KYC Upload Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

const getStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const pool = getPool();

        const [rows] = await pool.query(
            `SELECT id, document_type, status, file_url, rejection_reason, uploaded_at FROM documents WHERE user_id = ?`,
            [userId]
        );

        res.status(200).json({
            status: 'success',
            data: {
                documents: rows,
            },
        });
    } catch (error) {
        console.error('KYC Status Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

module.exports = {
    uploadDocument,
    getStatus,
};
