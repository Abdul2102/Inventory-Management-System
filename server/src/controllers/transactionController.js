const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');
const InventoryActivity = require('../models/InventoryActivity');

// @desc    Record a stock movement
// @route   POST /api/transactions
// @access  Private
const recordTransaction = async (req, res) => {
  const { product, type, quantity, reason } = req.body;

  // Validation
  if (!product || !type || !quantity || !reason) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  if (type !== 'stock-in' && type !== 'stock-out') {
    return res.status(400).json({ message: 'Invalid transaction type' });
  }

  const transactionQty = Number(quantity);
  if (isNaN(transactionQty) || transactionQty <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive number' });
  }

  try {
    const productRecord = await Product.findById(product);
    if (!productRecord) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle stock-out negative checks
    if (type === 'stock-out') {
      if (productRecord.quantity < transactionQty) {
        return res.status(400).json({ 
          message: `Insufficient stock. Current stock is ${productRecord.quantity}, but requested stock-out is ${transactionQty}.` 
        });
      }
      productRecord.quantity -= transactionQty;
    } else {
      productRecord.quantity += transactionQty;
    }

    // Save product
    await productRecord.save();

    // Create transaction log
    const transaction = await StockTransaction.create({
      product,
      type,
      quantity: transactionQty,
      reason: reason.trim(),
      performedBy: req.user._id
    });

    await InventoryActivity.create({
      user: req.user._id,
      userName: req.user.name || req.user.email || 'System',
      action: type === 'stock-in' ? 'STOCK_IN' : 'STOCK_OUT',
      product,
      productName: productRecord.name,
      quantity: transactionQty,
      reason: reason.trim()
    });

    const populatedTransaction = await StockTransaction.findById(transaction._id)
      .populate('product', 'name sku')
      .populate('performedBy', 'name');

    return res.status(201).json(populatedTransaction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions with filters
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { product, startDate, endDate } = req.query;
    let query = {};

    if (product) {
      query.product = product;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const transactions = await StockTransaction.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 });

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get transactions by product ID
// @route   GET /api/transactions/product/:productId
// @access  Private
const getTransactionsByProduct = async (req, res) => {
  try {
    const transactions = await StockTransaction.find({ product: req.params.productId })
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 });

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  recordTransaction,
  getTransactions,
  getTransactionsByProduct
};
