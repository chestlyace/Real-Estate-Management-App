const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const userRepository = require('../database/user.repository');
const propertyRepository = require('../database/property.repository');
const transactionRepository = require('../database/transaction.repository');
const maintenanceRepository = require('../database/maintenance.repository');
const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /v1/api/admin/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get user count
    const users = await userRepository.findAll();
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.account_status === 'active').length;

    // Get property stats
    const propertyStats = await propertyRepository.getStats();

    // Get revenue stats (last 30 days and all time)
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalRevenue = await transactionRepository.getRevenueStats(null, null);
    const lastWeekRevenue = await transactionRepository.getRevenueStats(lastWeek.toISOString().split('T')[0], null);
    const lastMonthRevenue = await transactionRepository.getRevenueStats(lastMonth.toISOString().split('T')[0], null);
    
    // Get maintenance costs
    const totalMaintenance = await maintenanceRepository.getTotalMaintenanceCost(null, null);
    const lastWeekMaintenance = await maintenanceRepository.getTotalMaintenanceCost(lastWeek.toISOString().split('T')[0], null);
    const lastMonthMaintenance = await maintenanceRepository.getTotalMaintenanceCost(lastMonth.toISOString().split('T')[0], null);

    // Calculate percentage changes (simplified - comparing to previous period)
    const revenueChange = lastMonthRevenue.total_revenue > 0 
      ? ((totalRevenue.total_revenue - lastMonthRevenue.total_revenue) / lastMonthRevenue.total_revenue * 100).toFixed(0)
      : 0;
    
    const maintenanceChange = lastMonthMaintenance > 0
      ? ((totalMaintenance - lastMonthMaintenance) / lastMonthMaintenance * 100).toFixed(0)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        properties: {
          total: propertyStats.total,
          active: propertyStats.active,
          sold: propertyStats.sold,
        },
        revenue: {
          total: parseFloat(totalRevenue.total_revenue) || 0,
          sales: parseFloat(totalRevenue.sales_revenue) || 0,
          rent: parseFloat(totalRevenue.rent_revenue) || 0,
          change: parseFloat(revenueChange),
          lastWeek: parseFloat(lastWeekRevenue.total_revenue) || 0,
        },
        maintenance: {
          total: parseFloat(totalMaintenance) || 0,
          change: parseFloat(maintenanceChange),
          lastWeek: parseFloat(lastWeekMaintenance) || 0,
        },
      },
      message: 'Dashboard statistics retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /v1/api/admin/sales-report - Get sales report with transaction details
router.get('/sales-report', async (req, res) => {
  try {
    const transactions = await transactionRepository.findAll({});
    
    // Format transactions for the sales report table
    const salesReport = transactions.map(t => ({
      id: t.id,
      salesBy: t.buyer_name || `${t.buyer_first_name || ''} ${t.buyer_last_name || ''}`.trim() || t.buyer_email || 'Unknown',
      email: t.buyer_email || 'N/A',
      salesType: t.transaction_type === 'sale' ? 'Sale' : 'Rent',
      price: parseFloat(t.amount) || 0,
      status: t.status === 'paid' ? 'Paid' : t.status === 'completed' ? 'Paid' : 'Pending',
      propertyName: t.property_name || 'N/A',
      transactionDate: t.transaction_date || t.created_at,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        salesReport,
        count: salesReport.length,
      },
      message: 'Sales report retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /v1/api/admin/revenue-chart - Get revenue chart data
router.get('/revenue-chart', async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const monthlyData = await transactionRepository.getMonthlyRevenue(months);
    
    res.status(200).json({
      status: 'success',
      data: {
        monthlyRevenue: monthlyData,
      },
      message: 'Revenue chart data retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /v1/api/admin/properties - Get all properties for admin
router.get('/properties', async (req, res) => {
  try {
    const properties = await propertyRepository.findAll({});
    
    res.status(200).json({
      status: 'success',
      data: {
        properties,
        count: properties.length,
      },
      message: 'Properties retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /v1/api/admin/analytics - Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const propertyStats = await propertyRepository.getStats();
    const revenueStats = await transactionRepository.getRevenueStats(null, null);
    const totalMaintenance = await maintenanceRepository.getTotalMaintenanceCost(null, null);
    
    const netProfit = (parseFloat(revenueStats.total_revenue) || 0) - (parseFloat(totalMaintenance) || 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        platformGrowth: {
          message: `Platform has ${propertyStats.total} properties and ${propertyStats.active} active listings`,
          detail: `${propertyStats.sold} properties have been sold`,
        },
        listingPerformance: {
          message: `${propertyStats.active} active listings generating revenue`,
          detail: `Conversion rate: ${propertyStats.total > 0 ? ((propertyStats.sold / propertyStats.total) * 100).toFixed(1) : 0}%`,
        },
        revenueMetrics: {
          message: `Total revenue: ${parseFloat(revenueStats.total_revenue || 0).toLocaleString()} FCFA`,
          detail: `Net profit: ${netProfit.toLocaleString()} FCFA (after maintenance costs)`,
        },
      },
      message: 'Analytics data retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;

