const mongoose = require('mongoose');

const inventoryActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['STOCK_IN', 'STOCK_OUT', 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryActivity', inventoryActivitySchema);
