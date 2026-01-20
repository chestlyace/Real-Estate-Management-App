const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
const config = require('../src/config/config');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('Starting seed process...');

    const conn = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
    });

    try {
        // 1. Create a demo owner user
        const ownerId = uuidv4();
        const passwordHash = await bcrypt.hash('password123', 10);

        // Check if user exists first to avoid duplicates if re-run (by email)
        const [existingUsers] = await conn.execute('SELECT id FROM users WHERE email = ?', ['owner@example.com']);
        let finalOwnerId = ownerId;

        if (existingUsers.length > 0) {
            console.log('Owner user already exists, using existing ID.');
            finalOwnerId = existingUsers[0].id;
        } else {
            await conn.execute(`
          INSERT INTO users (id, email, password_hash, name, role, account_status)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [ownerId, 'owner@example.com', passwordHash, 'Demo Owner', 'owner', 'active']);
            console.log('Created demo owner user.');
        }

        // 2. Properties Data
        const cities = ['Yaoundé', 'Douala', 'Bamenda', 'Buea', 'Limbe'];
        const types = ['apartment', 'house', 'commercial', 'land']; // mapped from user requests

        const properties = [
            {
                name: 'Wisdom City Apartments',
                description: 'Luxury apartments in the heart of the city.',
                price: 550000,
                city: 'Yaoundé',
                location: 'Bastos, Yaoundé',
                type: 'apartment',
                listing_type: 'rent',
                image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500'
            },
            {
                name: 'Oakleaf Cottage',
                description: 'Cozy cottage with a beautiful garden.',
                price: 20000000,
                city: 'Douala',
                location: 'Bonapriso, Douala',
                type: 'house',
                listing_type: 'sale',
                image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500'
            },
            {
                name: 'Sunny Villa Bamenda',
                description: 'Spacious villa with mountain views.',
                price: 350000,
                city: 'Bamenda',
                location: 'Up Station, Bamenda',
                type: 'house',
                listing_type: 'rent',
                image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500'
            },
            {
                name: 'Modern Studio Limbe',
                description: 'Beachfront studio apartment.',
                price: 150000,
                city: 'Limbe',
                location: 'Down Beach, Limbe',
                type: 'apartment',
                listing_type: 'rent',
                image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
            },
            {
                name: 'Commercial Space Buea',
                description: 'Prime location for business.',
                price: 45000000,
                city: 'Buea',
                location: 'Molyko, Buea',
                type: 'commercial',
                listing_type: 'sale',
                image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500'
            },
            {
                name: 'Luxury Villa Yaoundé',
                description: 'High-end villa with pool.',
                price: 850000,
                city: 'Yaoundé',
                location: 'Odza, Yaoundé',
                type: 'house',
                listing_type: 'rent',
                image_url: 'https://images.unsplash.com/photo-1613490493576-2f5037657911?w=500'
            },
            {
                name: 'City Center Office',
                description: 'Modern office space.',
                price: 300000,
                city: 'Douala',
                location: 'Akwa, Douala',
                type: 'commercial',
                listing_type: 'rent',
                image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500'
            },
            {
                name: 'Green Land Plot',
                description: 'Large plot of land suitable for agriculture or building.',
                price: 5000000,
                city: 'Bamenda',
                location: 'Bambui, Bamenda',
                type: 'land',
                listing_type: 'sale',
                image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500'
            }
        ];

        console.log(`Seeding ${properties.length} properties...`);

        for (const p of properties) {
            const pId = uuidv4();
            await conn.execute(`
        INSERT INTO properties (
          id, owner_id, name, description, location, city, region, price, 
          property_type, listing_type, image_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
                pId, finalOwnerId, p.name, p.description, p.location, p.city, 'Center',
                p.price, p.type, p.listing_type, p.image_url
            ]);
        }

        console.log('✓ Properties seeded successfully');

    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await conn.end();
    }
}

seed();
