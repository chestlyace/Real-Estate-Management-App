import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const API_URL = API_CONFIG.BASE_URL;
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('user_token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            // Let axios set proper content-type with boundary
        },
    };
};

const getStatusHeader = async () => {
    const token = await AsyncStorage.getItem('user_token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const uploadDocument = async (formData) => {
    const config = await getAuthHeader();
    const response = await axios.post(`${API_URL}/kyc/upload`, formData, {
        ...config,
        transformRequest: (data, headers) => {
            // React Native's FormData needs to be passed directly
            return data;
        },
    });
    return response.data;
};

const getStatus = async () => {
    const config = await getStatusHeader();
    const response = await axios.get(`${API_URL}/kyc/status`, config);
    return response.data;
};

export default {
    uploadDocument,
    getStatus,
};
