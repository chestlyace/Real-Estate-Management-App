const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./mysql');

function mapDbError(err) {
  const msg = (err && err.code) ? `Database error (${err.code})` : 'Database error';
  const e = new Error(msg);
  e.original = err;
  return e;
}

async function createProperty({ ownerId, name, description, location, city, region, price, sizeSqft, propertyType, listingType, imageUrl, bedrooms, bathrooms, maxGuests, amenities, instantBooking }) {
  try {
    const pool = getPool();
    const id = uuidv4();

    const sql = `INSERT INTO properties (id, owner_id, name, description, location, city, region, price, size_sqft, property_type, listing_type, image_url, bedrooms, bathrooms, max_guests, amenities, instant_booking) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await pool.execute(sql, [id, ownerId, name, description || null, location, city || null, region || null, price, sizeSqft || null, propertyType || 'house', listingType || 'sale', imageUrl || null, bedrooms || 0, bathrooms || 0, maxGuests || 1, amenities || null, instantBooking || false]);

    return findById(id);
  } catch (err) {
    throw mapDbError(err);
  }
}

async function findById(id) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM properties WHERE id = ?`, [id]);
    return rows[0] || null;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function findAll(filters = {}) {
  try {
    const pool = getPool();
    let sql = `SELECT p.*, 
               u.name as owner_name, u.email as owner_email, u.first_name, u.last_name
               FROM properties p
               LEFT JOIN users u ON p.owner_id = u.id
               WHERE 1=1`;
    const values = [];

    if (filters.ownerId) {
      sql += ` AND p.owner_id = ?`;
      values.push(filters.ownerId);
    }

    if (filters.status) {
      sql += ` AND p.status = ?`;
      values.push(filters.status);
    }

    if (filters.listingType) {
      sql += ` AND p.listing_type = ?`;
      values.push(filters.listingType);
    }

    if (filters.search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.location LIKE ?)`;
      const searchVal = `%${filters.search}%`;
      values.push(searchVal, searchVal, searchVal);
    }

    if (filters.minPrice) {
      sql += ` AND p.price >= ?`;
      values.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      sql += ` AND p.price <= ?`;
      values.push(filters.maxPrice);
    }

    if (filters.city) {
      sql += ` AND p.city LIKE ?`;
      values.push(`%${filters.city}%`);
    }

    if (filters.propertyType) {
      sql += ` AND p.property_type = ?`;
      values.push(filters.propertyType);
    }

    if (filters.bedrooms && filters.bedrooms > 0) {
      sql += ` AND p.bedrooms >= ?`;
      values.push(filters.bedrooms);
    }

    if (filters.bathrooms && filters.bathrooms > 0) {
      sql += ` AND p.bathrooms >= ?`;
      values.push(filters.bathrooms);
    }

    if (filters.max_guests && filters.max_guests > 0) {
      sql += ` AND p.max_guests >= ?`;
      values.push(filters.max_guests);
    }

    if (filters.instant_booking !== undefined) {
      sql += ` AND p.instant_booking = ?`;
      values.push(filters.instant_booking === 'true' || filters.instant_booking === true ? 1 : 0);
    }

    if (filters.amenities) {
      const amenityList = Array.isArray(filters.amenities)
        ? filters.amenities
        : filters.amenities.split(',').map(s => s.trim());

      amenityList.forEach(amenity => {
        sql += ` AND p.amenities LIKE ?`;
        values.push(`%${amenity}%`);
      });
    }

    sql += ` ORDER BY p.created_at DESC`;

    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (err) {
    throw mapDbError(err);
  }
}

async function updateProperty(id, updates) {
  try {
    const pool = getPool();
    const fields = [];
    const values = [];

    if (typeof updates.name === 'string') { fields.push('name = ?'); values.push(updates.name); }
    if (typeof updates.description === 'string') { fields.push('description = ?'); values.push(updates.description); }
    if (typeof updates.location === 'string') { fields.push('location = ?'); values.push(updates.location); }
    if (typeof updates.city === 'string') { fields.push('city = ?'); values.push(updates.city); }
    if (typeof updates.region === 'string') { fields.push('region = ?'); values.push(updates.region); }
    if (typeof updates.price !== 'undefined') { fields.push('price = ?'); values.push(updates.price); }
    if (typeof updates.size_sqft !== 'undefined') { fields.push('size_sqft = ?'); values.push(updates.size_sqft); }
    if (typeof updates.property_type === 'string') { fields.push('property_type = ?'); values.push(updates.property_type); }
    if (typeof updates.listing_type === 'string') { fields.push('listing_type = ?'); values.push(updates.listing_type); }
    if (typeof updates.status === 'string') { fields.push('status = ?'); values.push(updates.status); }
    if (typeof updates.image_url === 'string') { fields.push('image_url = ?'); values.push(updates.image_url); }
    if (typeof updates.views !== 'undefined') { fields.push('views = ?'); values.push(updates.views); }
    if (typeof updates.bedrooms !== 'undefined') { fields.push('bedrooms = ?'); values.push(updates.bedrooms); }
    if (typeof updates.bathrooms !== 'undefined') { fields.push('bathrooms = ?'); values.push(updates.bathrooms); }
    if (typeof updates.max_guests !== 'undefined') { fields.push('max_guests = ?'); values.push(updates.max_guests); }
    if (typeof updates.amenities !== 'undefined') { fields.push('amenities = ?'); values.push(updates.amenities); }
    if (typeof updates.instant_booking !== 'undefined') { fields.push('instant_booking = ?'); values.push(updates.instant_booking); }

    if (fields.length === 0) return findById(id);

    const sql = `UPDATE properties SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    await pool.execute(sql, values);
    return findById(id);
  } catch (err) {
    throw mapDbError(err);
  }
}

async function getStats() {
  try {
    const pool = getPool();
    const [totalResult] = await pool.execute(`SELECT COUNT(*) as total FROM properties`);
    const [activeResult] = await pool.execute(`SELECT COUNT(*) as total FROM properties WHERE status = 'active'`);
    const [soldResult] = await pool.execute(`SELECT COUNT(*) as total FROM properties WHERE status = 'sold'`);

    return {
      total: totalResult[0]?.total || 0,
      active: activeResult[0]?.total || 0,
      sold: soldResult[0]?.total || 0,
    };
  } catch (err) {
    throw mapDbError(err);
  }
}

module.exports = {
  createProperty,
  findById,
  findAll,
  updateProperty,
  getStats,
};

