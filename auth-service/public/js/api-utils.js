// API utility functions for handling authentication and token refresh
(function() {
  const API_AUTH_URL = '/v1/api/auth';

  /**
   * Refreshes the access token using the refresh token
   */
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_AUTH_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        return data.data.tokens.accessToken;
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  }

  /**
   * Makes an authenticated API request with automatic token refresh on 401
   */
  async function authenticatedFetch(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    
    // Add authorization header if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Make the initial request
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If 401 and we have a refresh token, try to refresh
    if (response.status === 401 && localStorage.getItem('refreshToken')) {
      try {
        const newAccessToken = await refreshAccessToken();
        
        // Retry the request with the new token
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
          window.location.href = '/';
        }
        throw refreshError;
      }
    }

    return response;
  }

  // Export functions to window for use in other scripts
  window.apiUtils = {
    refreshAccessToken,
    authenticatedFetch,
  };
})();

