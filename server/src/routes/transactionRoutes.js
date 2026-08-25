const express = require('express');
const router = express.Router();
const { 
  recordTransaction, 
  getTransactions, 
  getTransactionsByProduct 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, recordTransaction)
  .get(protect, getTransactions);

router.route('/product/:productId')
  .get(protect, getTransactionsByProduct);

module.exports = router;
