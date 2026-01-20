import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Note: axios in React Native uses its default adapter (fetch-based), no need to configure

class AuthService {
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

    async login(email, password) {
        try {
            const baseUrl = API_CONFIG.BASE_URL.endsWith('/') ? API_CONFIG.BASE_URL.slice(0, -1) : API_CONFIG.BASE_URL;
            const url = `${baseUrl}/auth/login`;

            // #region agent log
            console.log('Login attempt - URL:', url);
            console.log('Base URL:', API_CONFIG.BASE_URL);
            console.log('Platform:', require('react-native').Platform.OS);
            // #endregion

            // Use axios for better React Native compatibility
            let axiosResponse;
            try {
                axiosResponse = await axios.post(url, { email, password }, {
                    headers: API_CONFIG.HEADERS,
                    timeout: 15000,
                    validateStatus: (status) => status < 500,
                });
            } catch (axiosError) {
                // #region agent log
                const errorDetails = {
                    name: axiosError.name,
                    message: axiosError.message,
                    code: axiosError.code,
                    response: axiosError.response ? {
                        status: axiosError.response.status,
                        statusText: axiosError.response.statusText,
                        data: axiosError.response.data,
                    } : null,
                    request: axiosError.request ? {
                        readyState: axiosError.request.readyState,
                        status: axiosError.request.status,
                        statusText: axiosError.request.statusText,
                    } : null,
                    url: url,
                    baseURL: axiosError.config?.baseURL,
                    timeout: axiosError.config?.timeout,
                    headers: axiosError.config?.headers,
                };
                console.error('=== AXIOS ERROR DETAILS ===');
                console.error(JSON.stringify(errorDetails, null, 2));
                // #endregion

                // Fallback to fetch if axios fails
                try {
                    const fetchResponse = await fetch(url, {
                        method: 'POST',
                        headers: API_CONFIG.HEADERS,
                        body: JSON.stringify({ email, password }),
                    });
                    const data = await fetchResponse.json();
                    if (!fetchResponse.ok) {
                        throw new Error(data.message || 'Login failed');
                    }
                    // Save token and user info
                    if (data.data && data.data.tokens && data.data.tokens.accessToken) {
                        await AsyncStorage.setItem('user_token', data.data.tokens.accessToken);
                        if (data.data.user) {
                            await AsyncStorage.setItem('user_info', JSON.stringify(data.data.user));
                        }
                    }
                    return data;
                } catch (fetchError) {
                    console.error('Fetch fallback also failed:', fetchError.message);
                    throw axiosError;
                }
            }

            const data = axiosResponse.data;

            if (axiosResponse.status >= 400 || (data.status && data.status === 'error')) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token and user info
            if (data.data && data.data.tokens && data.data.tokens.accessToken) {
                await AsyncStorage.setItem('user_token', data.data.tokens.accessToken);
                if (data.data.user) {
                    await AsyncStorage.setItem('user_info', JSON.stringify(data.data.user));
                }
            }

            return data;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    async register(userData) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:entry', message: 'Registration function entry', data: { userDataFields: Object.keys(userData), hasEmail: !!userData.email, hasPassword: !!userData.password, hasName: !!userData.name, hasPhoneNumber: !!userData.phoneNumber, hasAccountType: !!userData.accountType, hasDateOfBirth: !!userData.dateOfBirth }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        try {
            const baseUrl = API_CONFIG.BASE_URL.endsWith('/') ? API_CONFIG.BASE_URL.slice(0, -1) : API_CONFIG.BASE_URL;
            const url = `${baseUrl}/auth/register`;

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:before-request', message: 'Before making registration request', data: { url: url, baseUrl: API_CONFIG.BASE_URL, headers: Object.keys(API_CONFIG.HEADERS) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
            // #endregion

            // Use axios for better React Native compatibility
            let axiosResponse;
            try {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:before-axios', message: 'Before axios.post call', data: { url: url, userData: userData }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
                // #endregion
                axiosResponse = await axios.post(url, userData, {
                    headers: API_CONFIG.HEADERS,
                    timeout: 15000,
                    validateStatus: (status) => status < 500,
                });
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:after-axios', message: 'After axios.post call - success', data: { status: axiosResponse.status, hasData: !!axiosResponse.data, dataKeys: axiosResponse.data ? Object.keys(axiosResponse.data) : null }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
                // #endregion
            } catch (axiosError) {
                // #region agent log
                const errorDetails = {
                    name: axiosError.name,
                    message: axiosError.message,
                    code: axiosError.code,
                    response: axiosError.response ? {
                        status: axiosError.response.status,
                        statusText: axiosError.response.statusText,
                        data: axiosError.response.data,
                    } : null,
                    request: axiosError.request ? {
                        readyState: axiosError.request.readyState,
                        status: axiosError.request.status,
                    } : null,
                    url: url,
                };
                fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:axios-error', message: 'Axios error caught', data: errorDetails, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
                // #endregion

                // Fallback to fetch if axios fails
                try {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:fetch-fallback', message: 'Attempting fetch fallback', data: { url: url }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
                    // #endregion
                    const fetchResponse = await fetch(url, {
                        method: 'POST',
                        headers: API_CONFIG.HEADERS,
                        body: JSON.stringify(userData),
                    });
                    const data = await fetchResponse.json();
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:fetch-response', message: 'Fetch fallback response', data: { status: fetchResponse.status, ok: fetchResponse.ok, hasData: !!data, dataKeys: data ? Object.keys(data) : null }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
                    // #endregion
                    if (!fetchResponse.ok) {
                        throw new Error(data.message || 'Registration failed');
                    }
                    // Save token and user info
                    if (data.data && data.data.tokens && data.data.tokens.accessToken) {
                        await AsyncStorage.setItem('user_token', data.data.tokens.accessToken);
                        if (data.data.user) {
                            await AsyncStorage.setItem('user_info', JSON.stringify(data.data.user));
                        }
                    }
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:fetch-success', message: 'Fetch fallback succeeded', data: { hasToken: !!data.data?.tokens?.accessToken }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
                    // #endregion
                    return data;
                } catch (fetchError) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:fetch-error', message: 'Fetch fallback also failed', data: { message: fetchError.message, name: fetchError.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
                    // #endregion
                    throw axiosError;
                }
            }

            const data = axiosResponse.data;
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:response-data', message: 'Response data extracted', data: { status: axiosResponse.status, hasData: !!data, dataStatus: data?.status, dataMessage: data?.message, hasTokens: !!data?.data?.tokens, hasUser: !!data?.data?.user }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
            // #endregion

            if (axiosResponse.status >= 400 || (data.status && data.status === 'error')) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:error-status', message: 'Response indicates error', data: { status: axiosResponse.status, dataStatus: data?.status, dataMessage: data?.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
                // #endregion
                throw new Error(data.message || 'Registration failed');
            }

            // Save token and user info
            if (data.data && data.data.tokens && data.data.tokens.accessToken) {
                await AsyncStorage.setItem('user_token', data.data.tokens.accessToken);
                if (data.data.user) {
                    await AsyncStorage.setItem('user_info', JSON.stringify(data.data.user));
                }
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:token-saved', message: 'Token and user info saved', data: { hasToken: true, hasUserInfo: !!data.data.user }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
                // #endregion
            }

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:success', message: 'Registration successful', data: { hasData: !!data }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
            // #endregion
            return data;
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'auth.service.js:register:catch', message: 'Registration error caught in catch block', data: { name: error.name, message: error.message, stack: error.stack?.substring(0, 200) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion
            console.error('Registration Error:', error);
            throw error;
        }
    }

    async logout() {
        await AsyncStorage.removeItem('user_token');
        await AsyncStorage.removeItem('user_info');
        return Promise.resolve();
    }

    async forgotPassword(data) {
        const url = `${API_CONFIG.BASE_URL}/auth/forgot-password`;
        const response = await fetch(url, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    }

    async verifyOtp(data) {
        const url = `${API_CONFIG.BASE_URL}/auth/verify-otp`;
        const response = await fetch(url, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    }

    async updateProfile(data) {
        const headers = await this.getHeaders();

        // 1. Get Me to get ID (could also cache ID in AsyncStorage to save a call)
        const meResponse = await fetch(`${API_CONFIG.BASE_URL}/users/me`, {
            headers: headers,
        });
        const meResult = await meResponse.json();
        if (!meResponse.ok) throw new Error('Failed to fetch user info');

        const userId = meResult.data.user.id;

        // 2. Update
        const url = `${API_CONFIG.BASE_URL}/users/${userId}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    }

    async getProfile() {
        const headers = await this.getHeaders();
        const url = `${API_CONFIG.BASE_URL}/users/me`;
        const response = await fetch(url, {
            headers: headers,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result.data.user;
    }

    async isAuthenticated() {
        try {
            const token = await AsyncStorage.getItem('user_token');
            return !!token;
        } catch (error) {
            return false;
        }
    }
}

export const authService = new AuthService();
