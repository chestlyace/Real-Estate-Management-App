const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./mysql');

function mapDbError(err) {
  const msg = (err && err.code) ? `Database error (${err.code})` : 'Database error';
  const e = new Error(msg);
  e.original = err;
  return e;
}

async function createMaintenance({ propertyId, description, amount, maintenanceDate }) {
  try {
    const pool = getPool();
    const id = uuidv4();
    
    const sql = `INSERT INTO maintenance_costs (id, property_id, description, amount, maintenance_date) 
                 VALUES (?, ?, ?, ?, ?)`;
    await pool.execute(sql, [id, propertyId, description, amount, maintenanceDate]);
    
    return findById(id);
  } catch (err) {
    throw mapDbError(err);
  }
}

async function findById(id) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT m.*, p.name as property_name, p.location as property_location
      FROM maintenance_costs m
      LEFT JOIN properties p ON m.property_id = p.id
      WHERE m.id = ?
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
      SELECT m.*, p.name as property_name, p.location as property_location
      FROM maintenance_costs m
      LEFT JOIN properties p ON m.property_id = p.id
      WHERE 1=1
    `;
    const values = [];

    if (filters.propertyId) {
      sql += ` AND m.property_id = ?`;
      values.push(filters.propertyId);
    }

    if (filters.startDate) {
      sql += ` AND m.maintenance_date >= ?`;
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ` AND m.maintenance_date <= ?`;
      values.push(filters.endDate);
    }

    sql += ` ORDER BY m.maintenance_date DESC`;

    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function getTotalMaintenanceCost(startDate, endDate) {
  try {
    const pool = getPool();
    let sql = `
      SELECT COALESCE(SUM(amount), 0) as total_cost
      FROM maintenance_costs
      WHERE 1=1
    `;
    const values = [];

    if (startDate) {
      sql += ` AND maintenance_date >= ?`;
      values.push(startDate);
    }

    if (endDate) {
      sql += ` AND maintenance_date <= ?`;
      values.push(endDate);
    }

    const [rows] = await pool.execute(sql, values);
    return rows[0]?.total_cost || 0;
  } catch (err) {
    throw mapDbError(err);
  }
}

module.exports = {
  createMaintenance,
  findById,
  findAll,
  getTotalMaintenanceCost,
};

