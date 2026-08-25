const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Please add a product']
  },
  type: {
    type: String,
    enum: ['stock-in', 'stock-out'],
    required: [true, 'Please specify transaction type']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add transaction quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  reason: {
    type: String,
    required: [true, 'Please add a reason'],
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
