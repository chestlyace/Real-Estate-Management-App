// Admin Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication and admin role
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (!accessToken || !userStr) {
        window.location.href = '/';
        return;
    }
    
    const user = JSON.parse(userStr);

    // Check if user is admin
    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/user-dashboard.html';
        return;
    }

    // Load admin dashboard data
    loadAdminData();

    async function loadAdminData() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            
            // Fetch platform statistics (placeholder - endpoint doesn't exist yet)
            // For now, we'll use the users endpoint to get user count
            // const statsResponse = await fetch('/v1/api/admin/stats', {
            //     headers: {
            //         'Authorization': `Bearer ${accessToken}`,
            //     },
            // });
            
            // Fetch users (using existing /v1/api/users endpoint)
            const usersResponse = await fetch('/v1/api/users', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                if (usersData.status === 'success' && usersData.data.users) {
                    const userCount = usersData.data.count || usersData.data.users.length || 0;
                    
                    // Update stats with user count
                    updateStats({
                        totalUsers: userCount,
                        totalProperties: 0, // Will be updated when properties are loaded
                        activeListings: 0, // Will be updated when properties are loaded
                        revenue: 0, // Will be updated when revenue endpoint exists
                    });
                    
                    // Update users table
                    updateUsersTable(usersData.data.users || []);
                } else {
                    updateStats({
                        totalUsers: 0,
                        totalProperties: 0,
                        activeListings: 0,
                        revenue: 0,
                    });
                    showEmptyUsersState();
                }
            } else {
                const errorText = await usersResponse.text();
                console.error('Failed to fetch users:', errorText);
                // Show empty state if fetch fails
                updateStats({
                    totalUsers: 0,
                    totalProperties: 0,
                    activeListings: 0,
                    revenue: 0,
                });
                showEmptyUsersState();
            }

            // Fetch all properties (if endpoint exists)
            try {
                const propertiesResponse = await fetch('/v1/api/properties', {
                headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                },
            });

            if (propertiesResponse.ok) {
                const propertiesData = await propertiesResponse.json();
                    if (propertiesData.status === 'success' && propertiesData.data && propertiesData.data.properties) {
                        const properties = propertiesData.data.properties;
                        const activeCount = properties.filter(p => p.status === 'active').length;
                        
                        // Update stats with property counts
                        const currentStats = {
                            totalUsers: document.getElementById('totalUsers')?.textContent || 0,
                            totalProperties: properties.length,
                            activeListings: activeCount,
                            revenue: 0, // Will be updated when revenue endpoint exists
                        };
                        updateStats(currentStats);
                        
                        updatePropertiesTable(properties);
                    } else {
                        showEmptyPropertiesState();
                    }
                } else {
                    // Endpoint doesn't exist or error - show empty state
                    showEmptyPropertiesState();
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                showEmptyPropertiesState();
            }

            // Load analytics data
            loadAnalytics(accessToken);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    function updateStats(stats) {
        if (document.getElementById('totalUsers')) {
            document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        }
        if (document.getElementById('totalProperties')) {
            document.getElementById('totalProperties').textContent = stats.totalProperties || 0;
        }
        if (document.getElementById('activeListings')) {
            document.getElementById('activeListings').textContent = stats.activeListings || 0;
        }
        if (document.getElementById('revenue')) {
            document.getElementById('revenue').textContent = `$${(stats.revenue || 0).toLocaleString()}`;
        }
    }

    function updateUsersTable(users) {
        const tableBody = document.getElementById('usersTable');
        if (!tableBody) return;
        
        if (users.length === 0) {
            showEmptyUsersState();
            return;
        }

        // Replace sample data with actual data
        tableBody.innerHTML = '';
        users.forEach(user => {
            const row = createUserRow(user);
            tableBody.appendChild(row);
        });
    }

    function showEmptyUsersState() {
        const tableBody = document.getElementById('usersTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
                    <p>No users found in the database.</p>
                </td>
            </tr>
        `;
    }

    function updatePropertiesTable(properties) {
        const tableBody = document.getElementById('propertiesTable');
        if (!tableBody) return;

        if (!properties || properties.length === 0) {
            showEmptyPropertiesState();
            return;
        }

        tableBody.innerHTML = '';
        properties.forEach(property => {
            const row = createPropertyRow(property);
            tableBody.appendChild(row);
        });
    }

    function showEmptyPropertiesState() {
        const tableBody = document.getElementById('propertiesTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                    <p>No properties found in the database.</p>
                </td>
            </tr>
        `;
    }

    function createUserRow(user) {
        const tr = document.createElement('tr');
        const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
        const isActive = user.account_status === 'active';
        const displayName = user.name || user.email || 'Unknown';

        tr.innerHTML = `
      <td>${displayName}</td>
      <td>${user.email || 'N/A'}</td>
      <td><span class="badge badge-info">${user.role || 'user'}</span></td>
      <td><span class="badge badge-${isActive ? 'success' : 'warning'}">${user.account_status || 'unknown'}</span></td>
      <td>${joinDate}</td>
      <td>
        <button class="btn btn-outline btn-small" onclick="editUser('${user.id}')">Edit</button>
        <button class="btn btn-secondary btn-small" onclick="toggleUserStatus('${user.id}', ${isActive})">
          ${isActive ? 'Suspend' : 'Activate'}
        </button>
      </td>
    `;
        return tr;
    }

    function createPropertyRow(property) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
      <td>${property.name}</td>
      <td>${property.owner?.firstName || 'Unknown'} ${property.owner?.surname || ''}</td>
      <td>${property.location}</td>
      <td>$${property.price.toLocaleString()}</td>
      <td><span class="badge badge-${getStatusBadge(property.status)}">${property.status}</span></td>
      <td>${property.views || 0}</td>
      <td>
        <button class="btn btn-outline btn-small" onclick="viewProperty('${property._id}')">View</button>
        <button class="btn btn-secondary btn-small" onclick="togglePropertyStatus('${property._id}')">
          ${property.status === 'Active' ? 'Suspend' : 'Approve'}
        </button>
      </td>
    `;
        return tr;
    }

    function getStatusBadge(status) {
        const statusMap = {
            'active': 'success',
            'Active': 'success',
            'pending': 'warning',
            'Pending Review': 'warning',
            'suspended': 'error',
            'Suspended': 'error',
            'deleted': 'error',
            'Sold': 'info',
        };
        return statusMap[status] || 'info';
    }

    async function loadAnalytics(accessToken) {
        try {
            // Try to fetch analytics data
            const analyticsResponse = await fetch('/v1/api/admin/analytics', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const analyticsContainer = document.getElementById('analyticsCards');
            if (!analyticsContainer) return;

            if (analyticsResponse.ok) {
                const analyticsData = await analyticsResponse.json();
                if (analyticsData.status === 'success' && analyticsData.data) {
                    updateAnalyticsCards(analyticsData.data);
                } else {
                    showEmptyAnalyticsState();
                }
            } else {
                // Endpoint doesn't exist - show empty state or hide section
                showEmptyAnalyticsState();
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            showEmptyAnalyticsState();
        }
    }

    function updateAnalyticsCards(analytics) {
        const container = document.getElementById('analyticsCards');
        if (!container) return;

        container.innerHTML = '';
        
        if (analytics.platformGrowth) {
            const card = createAnalyticsCard('Platform Growth', analytics.platformGrowth.message, analytics.platformGrowth.detail);
            container.appendChild(card);
        }
        
        if (analytics.listingPerformance) {
            const card = createAnalyticsCard('Listing Performance', analytics.listingPerformance.message, analytics.listingPerformance.detail);
            container.appendChild(card);
        }
        
        if (analytics.revenueMetrics) {
            const card = createAnalyticsCard('Revenue Metrics', analytics.revenueMetrics.message, analytics.revenueMetrics.detail);
            container.appendChild(card);
        }

        if (container.children.length === 0) {
            showEmptyAnalyticsState();
        }
    }

    function createAnalyticsCard(title, message, detail) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${title}</h3>
            <p class="text-secondary mb-md">${message || 'No data available'}</p>
            ${detail ? `<p class="text-small text-muted">${detail}</p>` : ''}
        `;
        return card;
    }

    function showEmptyAnalyticsState() {
        const container = document.getElementById('analyticsCards');
        if (!container) return;
        
        container.innerHTML = `
            <div class="card" style="grid-column: 1 / -1;">
                <h3>Analytics</h3>
                <p class="text-secondary mb-md">Analytics data will appear here once properties and user activity data is available.</p>
            </div>
        `;
    }
    
    // Add logout functionality
    const logoutLinks = document.querySelectorAll('a[href="/"]');
    logoutLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase() === 'logout') {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const accessToken = localStorage.getItem('accessToken');
                try {
                    await fetch('/v1/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                }
            });
        }
    });
});

async function editUser(userId) {
    console.log('Edit user:', userId);
    alert('Edit user feature coming soon!');
}

async function toggleUserStatus(userId, isActive) {
    const accessToken = localStorage.getItem('accessToken');
    const action = isActive ? 'suspend' : 'activate';
    const newStatus = isActive ? 'suspended' : 'active';

    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }

    try {
        // Use the PATCH /v1/api/users/:id endpoint to update user status
        // Note: This requires admin privileges, which should be checked server-side
        const response = await fetch(`/v1/api/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ account_status: newStatus }),
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            alert(`User ${action}d successfully!`);
            location.reload();
        } else {
            alert(data.message || `Failed to ${action} user.`);
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        alert('An error occurred. Please try again.');
    }
}

async function viewProperty(propertyId) {
    console.log('View property:', propertyId);
    alert('View property feature coming soon!');
}

async function togglePropertyStatus(propertyId) {
    console.log('Toggle property status:', propertyId);
    alert('Property status toggle coming soon!');
}
