const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  updateProductStock,
  deleteProduct 
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin'), createProduct);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/stock')
  .patch(protect, updateProductStock);

module.exports = router;
