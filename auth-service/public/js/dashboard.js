// dashboard page JS
(function () {
  const API_AUTH_URL = '/v1/api/auth';
  const API_USERS_URL = '/v1/api/users';

  function showAlert(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `alert alert-${type} show`;
    setTimeout(() => el.classList.remove('show'), 5000);
  }

  function showLoading(elementId, show = true) {
    const el = document.getElementById(elementId);
    el.classList.toggle('show', !!show);
  }

  function getAuthToken() { return localStorage.getItem('accessToken'); }
  function clearAuthToken() { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); }

  function guard() {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/';
      return false;
    }
    return true;
  }

  async function loadDashboard() {
    if (!guard()) return;
    showLoading('dashboardLoading', true);
    const token = getAuthToken();
    try {
      // Load user data
      const resp = await fetch(`${API_USERS_URL}/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const ct = resp.headers.get('content-type');
      const data = ct && ct.includes('application/json') ? await resp.json() : { message: await resp.text() };
      if (resp.ok && data.status === 'success') {
        const user = data.data.user;
        const nameParts = user.name ? user.name.split(' ') : ['User'];
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
          userNameEl.textContent = nameParts[0];
        }

        // Store updated user info
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        if (resp.status === 401) {
          alert('Session expired. Please login again.');
        setTimeout(() => logout(true), 1000);
          return;
        } else {
          alert(data.message || 'Failed to load user data.');
          return;
        }
      }

      // Load user properties (if endpoint exists)
      await loadUserProperties(token);
      
      // Load user stats
      await loadUserStats(token);
    } catch (err) {
      console.error('Dashboard error:', err);
      alert(err.message || 'Failed to load dashboard data.');
    } finally {
      showLoading('dashboardLoading', false);
    }
  }

  async function loadUserProperties(token) {
    try {
      // Try to fetch properties - if endpoint doesn't exist, show empty state
      const resp = await fetch('/v1/api/properties', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      
      const tableBody = document.getElementById('propertiesTable');
      if (!tableBody) return;

      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'success' && data.data && data.data.properties) {
          updatePropertiesTable(data.data.properties);
        } else {
          showEmptyPropertiesState();
        }
      } else if (resp.status === 404) {
        // Endpoint doesn't exist yet - show empty state
        showEmptyPropertiesState();
      } else {
        showEmptyPropertiesState();
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      showEmptyPropertiesState();
    }
  }

  function updatePropertiesTable(properties) {
    const tableBody = document.getElementById('propertiesTable');
    if (!tableBody) return;

    if (properties.length === 0) {
      showEmptyPropertiesState();
      return;
    }

    tableBody.innerHTML = '';
    properties.forEach(property => {
      const row = createPropertyRow(property);
      tableBody.appendChild(row);
    });
  }

  function createPropertyRow(property) {
    const tr = document.createElement('tr');
    const status = property.status || 'pending';
    const statusClass = status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'error';
    
    tr.innerHTML = `
      <td>${property.name || property.title || 'Unnamed Property'}</td>
      <td>${property.location || 'N/A'}</td>
      <td>$${property.price ? property.price.toLocaleString() : '0'}</td>
      <td><span class="badge badge-${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
      <td>${property.views || 0}</td>
      <td>
        <button class="btn btn-outline btn-small" onclick="editProperty('${property.id}')">Edit</button>
      </td>
    `;
    return tr;
  }

  function showEmptyPropertiesState() {
    const tableBody = document.getElementById('propertiesTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
          <p>No properties found. Start by adding your first property!</p>
        </td>
      </tr>
    `;
  }

  async function loadUserStats(token) {
    try {
      // Try to fetch user stats - if endpoint doesn't exist, show zeros
      const resp = await fetch('/v1/api/users/me/stats', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'success' && data.data) {
          updateStats(data.data);
        } else {
          resetStats();
        }
      } else {
        resetStats();
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      resetStats();
    }
  }

  function updateStats(stats) {
    const totalPropertiesEl = document.getElementById('totalProperties');
    const activeListingsEl = document.getElementById('activeListings');
    const totalViewsEl = document.getElementById('totalViews');
    const favoritesEl = document.getElementById('favorites');

    if (totalPropertiesEl) totalPropertiesEl.textContent = stats.totalProperties || 0;
    if (activeListingsEl) activeListingsEl.textContent = stats.activeListings || 0;
    if (totalViewsEl) totalViewsEl.textContent = stats.totalViews || 0;
    if (favoritesEl) favoritesEl.textContent = stats.favorites || 0;
  }

  function resetStats() {
    updateStats({
      totalProperties: 0,
      activeListings: 0,
      totalViews: 0,
      favorites: 0,
    });
  }

  // Global function for property editing (can be implemented later)
  window.editProperty = function(propertyId) {
    console.log('Edit property:', propertyId);
    alert('Edit property feature coming soon!');
  };

  async function logout(skipServer = false) {
    const token = getAuthToken();
    try {
      if (!skipServer && token) {
        await fetch(`${API_AUTH_URL}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthToken();
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated and redirect if not admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') {
        window.location.href = '/admin-dashboard.html';
        return;
      }
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout(false));
    
    // Add logout functionality to logout links
    const logoutLinks = document.querySelectorAll('a[href="/"]');
    logoutLinks.forEach(link => {
      if (link.textContent.trim().toLowerCase() === 'logout') {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          logout(false);
        });
      }
    });
    
    loadDashboard();
  });
})();
