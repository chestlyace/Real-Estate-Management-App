const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../src/config/config');

async function seedTransactionsAndMaintenance() {
  console.log('Starting transactions & maintenance seed...');

  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });

  try {
    // Ensure there is at least one buyer user
    const buyerEmail = 'buyer@example.com';
    const [existingBuyer] = await conn.execute(
      'SELECT id FROM users WHERE email = ?',
      [buyerEmail]
    );

    let buyerId;
    if (existingBuyer.length > 0) {
      buyerId = existingBuyer[0].id;
      console.log('Buyer user already exists, using existing ID.');
    } else {
      buyerId = uuidv4();
      const passwordHash = await bcrypt.hash('password123', 10);
      await conn.execute(
        `
        INSERT INTO users (id, email, password_hash, name, role, account_status)
        VALUES (?, ?, ?, ?, 'user', 'active')
      `,
        [buyerId, buyerEmail, passwordHash, 'Demo Buyer']
      );
      console.log('Created demo buyer user.');
    }

    // Fetch an owner (we assume seed_properties created owner@example.com)
    const [ownerRows] = await conn.execute(
      'SELECT id FROM users WHERE email = ?',
      ['owner@example.com']
    );
    if (ownerRows.length === 0) {
      throw new Error(
        'Owner user not found. Run scripts/seed_properties.js first.'
      );
    }
    const ownerId = ownerRows[0].id;

    // Fetch some properties to attach transactions/maintenance to
    const [properties] = await conn.execute(
      'SELECT id, price FROM properties ORDER BY created_at DESC LIMIT 5'
    );

    if (properties.length === 0) {
      throw new Error(
        'No properties found. Run scripts/seed_properties.js first.'
      );
    }

    console.log(`Found ${properties.length} properties for demo data.`);

    // Seed transactions: some sales and some rent payments
    const now = new Date();
    const toDateTime = (d) =>
      d.toISOString().slice(0, 19).replace('T', ' ');

    const demoTransactions = [];
    properties.forEach((p, index) => {
      const baseAmount = Number(p.price) || 300000;

      // Completed / paid transaction (sale or rent)
      const t1 = {
        id: uuidv4(),
        property_id: p.id,
        buyer_id: buyerId,
        seller_id: ownerId,
        transaction_type: index % 2 === 0 ? 'sale' : 'rent',
        amount: baseAmount,
        status: 'completed',
        transaction_date: toDateTime(
          new Date(now.getTime() - (index + 1) * 24 * 60 * 60 * 1000)
        ),
      };
      demoTransactions.push(t1);

      // Pending transaction for variety
      const t2 = {
        id: uuidv4(),
        property_id: p.id,
        buyer_id: buyerId,
        seller_id: ownerId,
        transaction_type: 'rent',
        amount: baseAmount * 0.6,
        status: 'pending',
        transaction_date: null,
      };
      demoTransactions.push(t2);
    });

    console.log(`Seeding ${demoTransactions.length} transactions...`);

    for (const t of demoTransactions) {
      await conn.execute(
        `
        INSERT INTO transactions (
          id, property_id, buyer_id, seller_id,
          transaction_type, amount, status, transaction_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          t.id,
          t.property_id,
          t.buyer_id,
          t.seller_id,
          t.transaction_type,
          t.amount,
          t.status,
          t.transaction_date,
        ]
      );
    }

    // Seed maintenance costs for some properties
    const demoMaintenance = [];
    properties.forEach((p, index) => {
      const base = 80000 + index * 15000;

      const m1 = {
        id: uuidv4(),
        property_id: p.id,
        description: 'General maintenance & cleaning',
        amount: base,
        maintenance_date: now.toISOString().slice(0, 10),
      };
      const m2 = {
        id: uuidv4(),
        property_id: p.id,
        description: 'Plumbing & repairs',
        amount: base * 0.7,
        maintenance_date: new Date(
          now.getTime() - 14 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .slice(0, 10),
      };

      demoMaintenance.push(m1, m2);
    });

    console.log(`Seeding ${demoMaintenance.length} maintenance records...`);

    for (const m of demoMaintenance) {
      await conn.execute(
        `
        INSERT INTO maintenance_costs (
          id, property_id, description, amount, maintenance_date
        )
        VALUES (?, ?, ?, ?, ?)
      `,
        [m.id, m.property_id, m.description, m.amount, m.maintenance_date]
      );
    }

    console.log('✓ Transactions & maintenance seeded successfully');
  } catch (err) {
    console.error('Seeding transactions/maintenance failed:', err);
  } finally {
    await conn.end();
  }
}

seedTransactionsAndMaintenance();


