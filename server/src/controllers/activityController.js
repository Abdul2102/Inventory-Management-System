const InventoryActivity = require('../models/InventoryActivity');

// @desc    Get all inventory activity history (filtered by user role)
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    let query = {};

    // Staff can only view stock-in / stock-out updates, Admin gets all actions
    if (req.user.role === 'staff') {
      query.action = { $in: ['STOCK_IN', 'STOCK_OUT'] };
    }

    const activities = await InventoryActivity.find(query)
      .populate('user', 'name email role')
      .populate('product', 'name category price')
      .sort({ createdAt: -1 });

    return res.json(activities);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActivities
};
