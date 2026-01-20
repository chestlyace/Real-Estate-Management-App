const config = require('../config/config');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const OWNER_ID = '24057408-887f-4265-8fcd-4be7032cad6e';

const cities = ['Douala', 'Yaoundé', 'Buea', 'Limbe', 'Kribi', 'Bafoussam', 'Bamenda'];
const propertyTypes = ['house', 'apartment', 'land', 'commercial', 'other'];
const listingTypes = ['sale', 'rent'];
const allAmenities = ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Gym', 'Security', 'Balcony'];

const properties = [
    {
        name: 'Luxury Villa with Pool',
        description: 'A beautiful luxury villa located in the heart of Bonapriso with a private pool and high-end finishes.',
        city: 'Douala',
        location: 'Bonapriso, Douala',
        price: 1500000,
        bedrooms: 5,
        bathrooms: 4,
        max_guests: 10,
        amenities: 'WiFi,Parking,Pool,AC,Kitchen,Security',
        instant_booking: true,
        property_type: 'house',
        listing_type: 'rent'
    },
    {
        name: 'Modern Apartment in Bastos',
        description: 'Chic modern apartment in the diplomatic quarter. Perfect for expats and business travelers.',
        city: 'Yaoundé',
        location: 'Bastos, Yaoundé',
        price: 800000,
        bedrooms: 2,
        bathrooms: 2,
        max_guests: 4,
        amenities: 'WiFi,Parking,AC,Kitchen,Security,Balcony',
        instant_booking: true,
        property_type: 'apartment',
        listing_type: 'rent'
    },
    {
        name: 'Seaside Resort Studio',
        description: 'Small but cozy studio right on the beach. Enjoy the sound of the ocean every morning.',
        city: 'Kribi',
        location: 'Beachfront, Kribi',
        price: 50000,
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        amenities: 'WiFi,AC,Kitchen,Balcony',
        instant_booking: false,
        property_type: 'apartment',
        listing_type: 'rent'
    },
    {
        name: 'Mountain View Cottage',
        description: 'Escape the heat in this cozy cottage with breathtaking views of Mount Cameroon.',
        city: 'Buea',
        location: 'Upper Farms, Buea',
        price: 25000000,
        bedrooms: 3,
        bathrooms: 2,
        max_guests: 6,
        amenities: 'Parking,Kitchen,Security,Balcony',
        instant_booking: false,
        property_type: 'house',
        listing_type: 'sale'
    },
    {
        name: 'Prime Commercial Space',
        description: 'High traffic location perfect for a boutique or office in Akwa.',
        city: 'Douala',
        location: 'Akwa, Douala',
        price: 1200000,
        bedrooms: 0,
        bathrooms: 1,
        max_guests: 20,
        amenities: 'WiFi,Parking,AC,Security',
        instant_booking: false,
        property_type: 'commercial',
        listing_type: 'rent'
    },
    {
        name: 'Large Development Land',
        description: 'Flat land ready for construction in a rapidly growing neighborhood.',
        city: 'Yaoundé',
        location: 'Olembe, Yaoundé',
        price: 45000000,
        bedrooms: 0,
        bathrooms: 0,
        max_guests: 0,
        amenities: 'Security',
        instant_booking: false,
        property_type: 'land',
        listing_type: 'sale'
    },
    {
        name: 'Family Home in Limbe',
        description: 'Spacious family home with a large garden and sea breeze.',
        city: 'Limbe',
        location: 'Down Beach, Limbe',
        price: 35000000,
        bedrooms: 4,
        bathrooms: 3,
        max_guests: 8,
        amenities: 'Parking,Kitchen,Security,Balcony',
        instant_booking: true,
        property_type: 'house',
        listing_type: 'sale'
    },
    {
        name: 'Penthouse with City View',
        description: 'Exclusive penthouse with a 360-degree view of the city skyline.',
        city: 'Douala',
        location: 'Bonanjo, Douala',
        price: 2500000,
        bedrooms: 3,
        bathrooms: 3,
        max_guests: 5,
        amenities: 'WiFi,Parking,Pool,AC,Kitchen,Gym,Security,Balcony',
        instant_booking: true,
        property_type: 'apartment',
        listing_type: 'rent'
    },
    {
        name: 'Quiet Suburban Villa',
        description: 'Peaceful villa away from the city noise, perfect for large families.',
        city: 'Bafoussam',
        location: 'Neighborhood A, Bafoussam',
        price: 15000000,
        bedrooms: 6,
        bathrooms: 5,
        max_guests: 12,
        amenities: 'Parking,Kitchen,Security',
        instant_booking: false,
        property_type: 'house',
        listing_type: 'sale'
    },
    {
        name: 'Affordable Student Studio',
        description: 'Convenient studio near the university campus.',
        city: 'Buea',
        location: 'Molyko, Buea',
        price: 45000,
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        amenities: 'WiFi,Kitchen',
        instant_booking: true,
        property_type: 'apartment',
        listing_type: 'rent'
    },
    {
        name: 'Luxury Beach House',
        description: 'Modern beach house with direct access to the ocean and a large deck.',
        city: 'Kribi',
        location: 'Tara Plage, Kribi',
        price: 75000000,
        bedrooms: 4,
        bathrooms: 4,
        max_guests: 8,
        amenities: 'WiFi,Parking,Pool,AC,Kitchen,Security,Balcony',
        instant_booking: false,
        property_type: 'house',
        listing_type: 'sale'
    },
    {
        name: 'Office Space in Central Town',
        description: 'Professional office space in a well-maintained building.',
        city: 'Yaoundé',
        location: 'Centre Ville, Yaoundé',
        price: 500000,
        bedrooms: 0,
        bathrooms: 2,
        max_guests: 15,
        amenities: 'WiFi,Parking,AC,Security',
        instant_booking: false,
        property_type: 'commercial',
        listing_type: 'rent'
    },
    {
        name: 'Charming Guest House',
        description: 'Successfully operating guest house with regular clientele.',
        city: 'Bamenda',
        location: 'Up Station, Bamenda',
        price: 120000000,
        bedrooms: 8,
        bathrooms: 8,
        max_guests: 16,
        amenities: 'WiFi,Parking,Kitchen,Gym,Security',
        instant_booking: false,
        property_type: 'other',
        listing_type: 'sale'
    },
    {
        name: 'Cozy Apartment for Couples',
        description: 'Modern and cozy, ideal for young couples or professionals.',
        city: 'Douala',
        location: 'Logpom, Douala',
        price: 150000,
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        amenities: 'WiFi,Parking,Security,Balcony',
        instant_booking: true,
        property_type: 'apartment',
        listing_type: 'rent'
    },
    {
        name: 'Warehouse in Industrial Zone',
        description: 'Large warehouse with easy truck access.',
        city: 'Douala',
        location: 'Bassa, Douala',
        price: 5000000,
        bedrooms: 0,
        bathrooms: 2,
        max_guests: 50,
        amenities: 'Parking,Security',
        instant_booking: false,
        property_type: 'commercial',
        listing_type: 'rent'
    },
    {
        name: 'New Build House',
        description: 'Brand new house with contemporary design and a small garden.',
        city: 'Yaoundé',
        location: 'Soa, Yaoundé',
        price: 35000000,
        bedrooms: 3,
        bathrooms: 2,
        max_guests: 6,
        amenities: 'Parking,Kitchen,Security',
        instant_booking: true,
        property_type: 'house',
        listing_type: 'sale'
    },
    {
        name: 'Apartment with Pool Access',
        description: 'Ground floor apartment with direct access to the communal pool.',
        city: 'Limbe',
        location: 'Mile 4, Limbe',
        price: 250000,
        bedrooms: 2,
        bathrooms: 1,
        max_guests: 4,
        amenities: 'WiFi,Parking,Pool,Kitchen,Security',
        instant_booking: true,
        property_type: 'apartment',
        listing_type: 'rent'
    },
    {
        name: 'Residential Land Lot',
        description: 'Perfect spot for your dream home in a quiet area.',
        city: 'Buea',
        location: 'Bonduma, Buea',
        price: 12000000,
        bedrooms: 0,
        bathrooms: 0,
        max_guests: 0,
        amenities: 'None',
        instant_booking: false,
        property_type: 'land',
        listing_type: 'sale'
    },
    {
        name: 'Rustic Farm House',
        description: 'Escape to the country in this large farmhouse with plenty of land.',
        city: 'Bafoussam',
        location: 'Rural Outskirts, Bafoussam',
        price: 55000000,
        bedrooms: 4,
        bathrooms: 2,
        max_guests: 10,
        amenities: 'Parking,Kitchen',
        instant_booking: false,
        property_type: 'house',
        listing_type: 'sale'
    },
    {
        name: 'Executive Studio Apartment',
        description: 'Luxury studio designed for executives on short-term assignments.',
        city: 'Douala',
        location: 'Bonanjo, Douala',
        price: 450000,
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        amenities: 'WiFi,Parking,AC,Kitchen,Gym,Security,Balcony',
        instant_booking: true,
        property_type: 'apartment',
        listing_type: 'rent'
    }
];

async function seed() {
    const pool = mysql.createPool(config.db);
    console.log('Starting seed...');

    try {
        for (const p of properties) {
            const id = uuidv4();
            await pool.query(
                `INSERT INTO properties 
        (id, owner_id, name, description, location, city, price, bedrooms, bathrooms, max_guests, amenities, instant_booking, property_type, listing_type, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
                [
                    id,
                    OWNER_ID,
                    p.name,
                    p.description,
                    p.location,
                    p.city,
                    p.price,
                    p.bedrooms,
                    p.bathrooms,
                    p.max_guests,
                    p.amenities,
                    p.instant_booking,
                    p.property_type,
                    p.listing_type
                ]
            );
            console.log(`Added: ${p.name}`);
        }
        console.log('✓ Seeding completed successfully!');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await pool.end();
    }
}

seed();
