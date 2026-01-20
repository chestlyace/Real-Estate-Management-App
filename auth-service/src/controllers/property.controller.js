const propertyRepo = require('../database/property.repository');

const getAllProperties = async (req, res) => {
    try {
        const filters = {};
        if (req.query.listingType) filters.listingType = req.query.listingType; // sale/rent
        if (req.query.ownerId) filters.ownerId = req.query.ownerId;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.search) filters.search = req.query.search;
        if (req.query.minPrice) filters.minPrice = req.query.minPrice;
        if (req.query.maxPrice) filters.maxPrice = req.query.maxPrice;
        if (req.query.city) filters.city = req.query.city;
        if (req.query.propertyType) filters.propertyType = req.query.propertyType;
        if (req.query.bedrooms) filters.bedrooms = req.query.bedrooms;
        if (req.query.bathrooms) filters.bathrooms = req.query.bathrooms;
        if (req.query.max_guests) filters.max_guests = req.query.max_guests;
        if (req.query.amenities) filters.amenities = req.query.amenities;
        if (req.query.instant_booking) filters.instant_booking = req.query.instant_booking;

        const properties = await propertyRepo.findAll(filters);
        res.json({
            status: 'success',
            data: properties,
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch properties',
        });
    }
};

const getPropertyById = async (req, res) => {
    try {
        const property = await propertyRepo.findById(req.params.id);
        if (!property) {
            return res.status(404).json({
                status: 'error',
                message: 'Property not found',
            });
        }
        res.json({
            status: 'success',
            data: property,
        });
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch property details',
        });
    }
};

const createProperty = async (req, res) => {
    try {
        const { name, description, price, location, city, region, propertyType, listingType, sizeSqft, imageUrl } = req.body;

        // Basic validation
        if (!name || !price || !location) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }

        const newProperty = await propertyRepo.createProperty({
            ownerId: req.user ? req.user.id : 'admin', // Default to admin if no auth yet or handle generic
            name,
            description,
            price,
            location,
            city,
            region,
            propertyType,
            listingType,
            sizeSqft,
            imageUrl
        });

        res.status(201).json({
            status: 'success',
            data: newProperty,
        });
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create property',
        });
    }
};

const getPropertyStats = async (req, res) => {
    try {
        const stats = await propertyRepo.getStats();
        res.json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get stats'
        });
    }
};

module.exports = {
    getAllProperties,
    getPropertyById,
    createProperty,
    getPropertyStats
};
