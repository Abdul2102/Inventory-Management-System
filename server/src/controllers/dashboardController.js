const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const InventoryActivity = require('../models/InventoryActivity');

// @desc    Get dashboard analytics and metrics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const products = await Product.find({});
    
    let totalStockValue = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      totalStockValue += p.price * p.quantity;
      if (p.quantity === 0) {
        outOfStockCount++;
      } else if (p.quantity <= p.minimumStock) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    // Fetch low/out of stock items list for alerts (up to 10 sorted by stock level)
    const lowStockAlerts = await Product.find({
      $expr: { $lte: [ "$quantity", "$minimumStock" ] }
    })
    .populate('category', 'name')
    .sort({ quantity: 1 })
    .limit(10);

    // Fetch recent stock transactions (last 5)
    const recentTransactions = await StockTransaction.find({})
      .populate('product', 'name')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch category overview count
    const categoryOverview = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          name: '$categoryInfo.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate today's activities (from midnight local time)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const stockInTodayRes = await StockTransaction.aggregate([
      {
        $match: {
          type: 'stock-in',
          createdAt: { $gte: startOfToday }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);
    const stockInToday = stockInTodayRes.length > 0 ? stockInTodayRes[0].total : 0;

    const stockOutTodayRes = await StockTransaction.aggregate([
      {
        $match: {
          type: 'stock-out',
          createdAt: { $gte: startOfToday }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);
    const stockOutToday = stockOutTodayRes.length > 0 ? stockOutTodayRes[0].total : 0;

    const recentUpdates = await InventoryActivity.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    const recentActivities = await InventoryActivity.find({})
      .populate('user', 'name role')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      totalProducts: products.length,
      totalStockValue,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      lowStockAlerts,
      recentTransactions,
      categoryOverview,
      stockInToday,
      stockOutToday,
      recentUpdates,
      recentActivities
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
