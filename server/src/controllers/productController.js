const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const InventoryActivity = require('../models/InventoryActivity');

// @desc    Get all products with search, filters & sorting
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const { search, category, status, supplier, sort } = req.query;
    let query = {};

    // Search by Name or Supplier
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Supplier (exact matching)
    if (supplier) {
      query.supplier = { $regex: supplier, $options: 'i' };
    }

    // Filter by Stock Status (computed dynamically)
    if (status) {
      if (status === 'in-stock') {
        query.$expr = { $gt: [ "$quantity", "$minimumStock" ] };
      } else if (status === 'low-stock') {
        query.quantity = { $gt: 0 };
        query.$expr = { $lte: [ "$quantity", "$minimumStock" ] };
      } else if (status === 'out-of-stock') {
        query.quantity = 0;
      }
    }

    // Set sorting parameters
    let sortOptions = { createdAt: -1 }; // default: newest
    if (sort) {
      if (sort === 'name-a-z') sortOptions = { name: 1 };
      else if (sort === 'name-z-a') sortOptions = { name: -1 };
      else if (sort === 'price-low-high') sortOptions = { price: 1 };
      else if (sort === 'price-high-low') sortOptions = { price: -1 };
      else if (sort === 'stock-low-high') sortOptions = { quantity: 1 };
      else if (sort === 'stock-high-low') sortOptions = { quantity: -1 };
      else if (sort === 'newest') sortOptions = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'name')
      .sort(sortOptions);

    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { 
    name, 
    category, 
    description, 
    price, 
    quantity, 
    minimumStock, 
    supplier,
    image
  } = req.body;

  // Validate required fields
  if (!name || !category || price === undefined || quantity === undefined || !supplier) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  // Validate numeric ranges
  if (Number(price) <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }
  if (Number(quantity) < 0) {
    return res.status(400).json({ message: 'Quantity in stock must be at least 0' });
  }
  if (minimumStock !== undefined && Number(minimumStock) < 0) {
    return res.status(400).json({ message: 'Minimum stock limit must be at least 0' });
  }

  try {
    const product = await Product.create({
      name: name.trim(),
      category,
      description: description || '',
      price: Number(price),
      quantity: Number(quantity),
      minimumStock: minimumStock !== undefined ? Number(minimumStock) : 10,
      supplier: supplier.trim(),
      image: image || '',
      createdBy: req.user._id
    });

    await InventoryActivity.create({
      user: req.user._id,
      userName: req.user.name || req.user.email || 'System',
      action: 'PRODUCT_CREATED',
      product: product._id,
      productName: product.name
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { 
    name, 
    category, 
    description, 
    price, 
    quantity, 
    minimumStock, 
    supplier,
    image
  } = req.body;

  // Validate numeric fields if they are updated
  if (price !== undefined && Number(price) <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }
  if (quantity !== undefined && Number(quantity) < 0) {
    return res.status(400).json({ message: 'Quantity must be at least 0' });
  }
  if (minimumStock !== undefined && Number(minimumStock) < 0) {
    return res.status(400).json({ message: 'Minimum stock must be at least 0' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (minimumStock !== undefined) product.minimumStock = Number(minimumStock);
    if (supplier) product.supplier = supplier.trim();
    if (image !== undefined) product.image = image.trim();

    const updatedProduct = await product.save();

    await InventoryActivity.create({
      user: req.user._id,
      userName: req.user.name || req.user.email || 'System',
      action: 'PRODUCT_UPDATED',
      product: updatedProduct._id,
      productName: updatedProduct.name
    });

    return res.json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product's stock count (Add / Remove)
// @route   PATCH /api/products/:id/stock
// @access  Private
const updateProductStock = async (req, res) => {
  const { type, quantity, reason } = req.body;

  if (!type || quantity === undefined) {
    return res.status(400).json({ message: 'Type (add/remove) and quantity are required' });
  }

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive number' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (type === 'add') {
      product.quantity += qty;
    } else if (type === 'remove') {
      if (product.quantity - qty < 0) {
        return res.status(400).json({ message: 'Stock quantity cannot be negative.' });
      }
      product.quantity -= qty;
    } else {
      return res.status(400).json({ message: 'Invalid stock adjustment type' });
    }

    await product.save();

    // Log the transaction
    await StockTransaction.create({
      product: product._id,
      type: type === 'add' ? 'stock-in' : 'stock-out',
      quantity: qty,
      reason: reason || (type === 'add' ? 'Add Stock' : 'Remove Stock'),
      performedBy: req.user._id
    });

    await InventoryActivity.create({
      user: req.user._id,
      userName: req.user.name || req.user.email || 'System',
      action: type === 'add' ? 'STOCK_IN' : 'STOCK_OUT',
      product: product._id,
      productName: product.name,
      quantity: qty,
      reason: reason || (type === 'add' ? 'Add Stock' : 'Remove Stock')
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('createdBy', 'name');

    return res.json(populatedProduct);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    await InventoryActivity.create({
      user: req.user._id,
      userName: req.user.name || req.user.email || 'System',
      action: 'PRODUCT_DELETED',
      productName: product.name
    });

    return res.json({ message: 'Product removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct
};
