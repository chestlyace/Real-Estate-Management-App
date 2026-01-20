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

    // Update user info in sidebar
    updateUserInfo(user);

    // Load admin dashboard data
    loadAdminData();

    async function loadAdminData() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            
            // Fetch dashboard statistics
            await loadDashboardStats(accessToken);
            
            // Fetch sales report
            await loadSalesReport(accessToken);
            
            // Fetch revenue chart data
            await loadRevenueChart(accessToken);
            
            // Fetch properties list
            await loadPropertiesList(accessToken);
            
            // Load analytics data
            await loadAnalytics(accessToken);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    async function loadDashboardStats(accessToken) {
        try {
            const response = await fetch('/v1/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data) {
                    updateStats(data.data);
                }
            } else {
                console.error('Failed to fetch dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    }

    function updateStats(stats) {
        // Update Total Revenue
        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl) {
            const revenue = parseFloat(stats.revenue?.total || 0);
            totalRevenueEl.textContent = `${revenue.toLocaleString('en-US')} FCFA`;
        }

        // Update Revenue Trend
        const revenueChangeEl = document.getElementById('revenueChange');
        const revenueTrendEl = document.getElementById('revenueTrend');
        if (revenueChangeEl && revenueTrendEl) {
            const change = parseFloat(stats.revenue?.change || 0);
            revenueChangeEl.textContent = `${change >= 0 ? '+' : ''}${change}%`;
            revenueTrendEl.className = `stat-trend ${change >= 0 ? 'trend-up' : 'trend-down'}`;
            const icon = revenueTrendEl.querySelector('i');
            if (icon) {
                icon.className = change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            }
        }

        // Update Maintenance Cost
        const maintenanceCostEl = document.getElementById('maintenanceCost');
        if (maintenanceCostEl) {
            const maintenance = parseFloat(stats.maintenance?.total || 0);
            maintenanceCostEl.textContent = `${maintenance.toLocaleString('en-US')} FCFA`;
        }

        // Update Maintenance Trend
        const maintenanceChangeEl = document.getElementById('maintenanceChange');
        const maintenanceTrendEl = document.getElementById('maintenanceTrend');
        if (maintenanceChangeEl && maintenanceTrendEl) {
            const change = parseFloat(stats.maintenance?.change || 0);
            maintenanceChangeEl.textContent = `${change >= 0 ? '+' : ''}${change}%`;
            maintenanceTrendEl.className = `stat-trend ${change >= 0 ? 'trend-up' : 'trend-down'}`;
            const icon = maintenanceTrendEl.querySelector('i');
            if (icon) {
                icon.className = change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            }
        }
    }

    async function loadSalesReport(accessToken) {
        try {
            const response = await fetch('/v1/api/admin/sales-report', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data && data.data.salesReport) {
                    updateSalesReportTable(data.data.salesReport);
                } else {
                    showEmptySalesReport();
                }
            } else {
                showEmptySalesReport();
            }
        } catch (error) {
            console.error('Error fetching sales report:', error);
            showEmptySalesReport();
        }
    }

    function updateSalesReportTable(salesReport) {
        const tableBody = document.getElementById('salesReportTable');
        if (!tableBody) return;

        if (!salesReport || salesReport.length === 0) {
            showEmptySalesReport();
            return;
        }

        tableBody.innerHTML = '';
        salesReport.forEach(sale => {
            const row = createSalesReportRow(sale);
            tableBody.appendChild(row);
        });
    }

    function createSalesReportRow(sale) {
        const tr = document.createElement('tr');
        const statusClass = sale.status === 'Paid' ? 'status-paid' : 'status-pending';
        
        tr.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="avatar-sm" style="background-image: url('')"></div>
                    <span>${escapeHtml(sale.salesBy)}</span>
                </div>
            </td>
            <td>${escapeHtml(sale.email)}</td>
            <td>${escapeHtml(sale.salesType)}</td>
            <td>${parseFloat(sale.price || 0).toLocaleString('en-US')} FCFA</td>
            <td><span class="status-badge ${statusClass}">${escapeHtml(sale.status)}</span></td>
        `;
        return tr;
    }

    function showEmptySalesReport() {
        const tableBody = document.getElementById('salesReportTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
                    <p>No sales data available.</p>
                </td>
            </tr>
        `;
    }

    async function loadRevenueChart(accessToken) {
        try {
            const response = await fetch('/v1/api/admin/revenue-chart?months=6', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data && data.data.monthlyRevenue) {
                    updateRevenueChart(data.data.monthlyRevenue);
                }
            }
        } catch (error) {
            console.error('Error fetching revenue chart:', error);
        }
    }

    function updateRevenueChart(monthlyData) {
        const chartContainer = document.getElementById('revenueChart');
        const chartLabels = document.getElementById('chartLabels');
        
        if (!chartContainer || !chartLabels) return;

        if (!monthlyData || monthlyData.length === 0) {
            chartContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No revenue data available</div>';
            chartLabels.innerHTML = '';
            return;
        }

        // Find max revenue for scaling
        const maxRevenue = Math.max(...monthlyData.map(m => parseFloat(m.revenue || 0)), 1);
        
        // Generate bars
        chartContainer.innerHTML = '';
        monthlyData.forEach((month, index) => {
            const height = (parseFloat(month.revenue || 0) / maxRevenue) * 100;
            const isCurrentMonth = index === monthlyData.length - 1;
            const bar = document.createElement('div');
            bar.className = `bar ${isCurrentMonth ? 'active' : ''}`;
            bar.style.height = `${height}%`;
            chartContainer.appendChild(bar);
        });

        // Generate labels
        chartLabels.innerHTML = '';
        monthlyData.forEach(month => {
            const label = document.createElement('span');
            const date = new Date(month.month + '-01');
            label.textContent = date.toLocaleDateString('en-US', { month: 'short' });
            chartLabels.appendChild(label);
        });
    }

    async function loadPropertiesList(accessToken) {
        try {
            const response = await fetch('/v1/api/admin/properties', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data && data.data.properties) {
                    updatePropertiesList(data.data.properties);
                } else {
                    showEmptyPropertiesList();
                }
            } else {
                showEmptyPropertiesList();
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
            showEmptyPropertiesList();
        }
    }

    function updatePropertiesList(properties) {
        const widget = document.getElementById('propertyListWidget');
        if (!widget) return;

        if (!properties || properties.length === 0) {
            showEmptyPropertiesList();
            return;
        }

        // Show only first 2 properties
        const displayProperties = properties.slice(0, 2);
        
        widget.innerHTML = '';
        displayProperties.forEach(property => {
            const card = createPropertyCard(property);
            widget.appendChild(card);
        });
    }

    function createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card-sm';
        
        const imageUrl = property.image_url || 'https://images.unsplash.com/photo-1600596542815-22b5c1275efb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        const statusBadge = property.status === 'active' ? '<span class="badge-overlay">Active</span>' : '';
        
        card.innerHTML = `
            <div class="property-img" style="background-image: url('${imageUrl}')">
                ${statusBadge}
            </div>
            <div class="property-info">
                <h4>${escapeHtml(property.name || 'Unnamed Property')}</h4>
                <p class="text-secondary" style="font-size: 12px;">${escapeHtml(property.location || 'Location not specified')}</p>
                <div class="property-price">${parseFloat(property.price || 0).toLocaleString('en-US')} FCFA</div>
            </div>
        `;
        return card;
    }

    function showEmptyPropertiesList() {
        const widget = document.getElementById('propertyListWidget');
        if (!widget) return;
        
        widget.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>No properties available.</p>
            </div>
        `;
    }

    async function loadAnalytics(accessToken) {
        try {
            const response = await fetch('/v1/api/admin/analytics', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data) {
                    // Analytics data is available but not displayed in current HTML structure
                    // This can be used for future enhancements
                    console.log('Analytics data:', data.data);
                }
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    function updateUserInfo(user) {
        // Update sidebar user name
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = user.name || user.email || 'Admin';
        }

        // Update greeting
        const greetingEl = document.getElementById('greetingText');
        if (greetingEl) {
            const hour = new Date().getHours();
            let greeting = 'Good Morning';
            if (hour >= 12 && hour < 17) {
                greeting = 'Good Afternoon';
            } else if (hour >= 17) {
                greeting = 'Good Evening';
            }
            const name = user.name || user.email || 'Admin';
            greetingEl.textContent = `${greeting} ${name}`;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Add logout functionality
    const logoutLinks = document.querySelectorAll('a[href="/"]');
    logoutLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase().includes('logout')) {
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
