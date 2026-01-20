import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

class PropertyService {
    async getHeaders() {
        const token = await AsyncStorage.getItem('user_token');
        const headers = {
            ...API_CONFIG.HEADERS,
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async getAllProperties(filters = {}) {
        try {
            const headers = await this.getHeaders();
            let url = `${API_CONFIG.BASE_URL}/properties`;

            const params = new URLSearchParams();
            if (filters.listingType) params.append('listingType', filters.listingType);
            if (filters.status) params.append('status', filters.status);
            if (filters.ownerId) params.append('ownerId', filters.ownerId);
            if (filters.search) params.append('search', filters.search);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.city) params.append('city', filters.city);
            if (filters.propertyType) params.append('propertyType', filters.propertyType);
            if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
            if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
            if (filters.max_guests) params.append('max_guests', filters.max_guests);
            if (filters.amenities) params.append('amenities', filters.amenities);
            if (filters.instant_booking !== undefined) params.append('instant_booking', filters.instant_booking);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            const result = await response.json();
            if (!response.ok) {
                console.error('Property fetch error:', result);
                throw new Error(result.message || 'Failed to fetch properties');
            }
            return result.data;
        } catch (error) {
            console.error('Service GetAllProperties Error:', error);
            throw error;
        }
    }

    async getFeaturedProperties() {
        // For now, featured can just be all properties or random ones, or filtered by some criteria if we add it
        // Simulating "featured" by taking the latest ones
        return this.getAllProperties();
    }
}

export const propertyService = new PropertyService();
