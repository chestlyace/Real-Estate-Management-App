const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./mysql');

function mapDbError(err) {
  const msg = (err && err.code) ? `Database error (${err.code})` : 'Database error';
  const e = new Error(msg);
  e.original = err;
  return e;
}

async function createTransaction({ propertyId, buyerId, sellerId, transactionType, amount, status }) {
  try {
    const pool = getPool();
    const id = uuidv4();
    
    const sql = `INSERT INTO transactions (id, property_id, buyer_id, seller_id, transaction_type, amount, status, transaction_date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const transactionDate = status === 'paid' || status === 'completed' ? new Date() : null;
    await pool.execute(sql, [id, propertyId, buyerId, sellerId, transactionType, amount, status || 'pending', transactionDate]);
    
    return findById(id);
  } catch (err) {
    throw mapDbError(err);
  }
}

async function findById(id) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT t.*, 
             p.name as property_name, p.location as property_location,
             buyer.name as buyer_name, buyer.email as buyer_email,
             seller.name as seller_name, seller.email as seller_email
      FROM transactions t
      LEFT JOIN properties p ON t.property_id = p.id
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users seller ON t.seller_id = seller.id
      WHERE t.id = ?
    `, [id]);
    return rows[0] || null;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function findAll(filters = {}) {
  try {
    const pool = getPool();
    let sql = `
      SELECT t.*, 
             p.name as property_name, p.location as property_location,
             buyer.name as buyer_name, buyer.email as buyer_email, buyer.first_name as buyer_first_name, buyer.last_name as buyer_last_name,
             seller.name as seller_name, seller.email as seller_email
      FROM transactions t
      LEFT JOIN properties p ON t.property_id = p.id
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users seller ON t.seller_id = seller.id
      WHERE 1=1
    `;
    const values = [];

    if (filters.buyerId) {
      sql += ` AND t.buyer_id = ?`;
      values.push(filters.buyerId);
    }

    if (filters.sellerId) {
      sql += ` AND t.seller_id = ?`;
      values.push(filters.sellerId);
    }

    if (filters.status) {
      sql += ` AND t.status = ?`;
      values.push(filters.status);
    }

    if (filters.transactionType) {
      sql += ` AND t.transaction_type = ?`;
      values.push(filters.transactionType);
    }

    sql += ` ORDER BY t.created_at DESC`;

    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function getRevenueStats(startDate, endDate) {
  try {
    const pool = getPool();
    let sql = `
      SELECT 
        COALESCE(SUM(CASE WHEN status IN ('paid', 'completed') THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN transaction_type = 'sale' AND status IN ('paid', 'completed') THEN amount ELSE 0 END), 0) as sales_revenue,
        COALESCE(SUM(CASE WHEN transaction_type = 'rent' AND status IN ('paid', 'completed') THEN amount ELSE 0 END), 0) as rent_revenue,
        COUNT(CASE WHEN status IN ('paid', 'completed') THEN 1 END) as completed_transactions
      FROM transactions
      WHERE 1=1
    `;
    const values = [];

    if (startDate) {
      sql += ` AND transaction_date >= ?`;
      values.push(startDate);
    }

    if (endDate) {
      sql += ` AND transaction_date <= ?`;
      values.push(endDate);
    }

    const [rows] = await pool.execute(sql, values);
    return rows[0] || { total_revenue: 0, sales_revenue: 0, rent_revenue: 0, completed_transactions: 0 };
  } catch (err) {
    throw mapDbError(err);
  }
}

async function getMonthlyRevenue(months = 6) {
  try {
    const pool = getPool();
    const sql = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        COALESCE(SUM(CASE WHEN status IN ('paid', 'completed') THEN amount ELSE 0 END), 0) as revenue
      FROM transactions
      WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        AND status IN ('paid', 'completed')
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month ASC
    `;
    const [rows] = await pool.execute(sql, [months]);
    return rows;
  } catch (err) {
    throw mapDbError(err);
  }
}

module.exports = {
  createTransaction,
  findById,
  findAll,
  getRevenueStats,
  getMonthlyRevenue,
};

