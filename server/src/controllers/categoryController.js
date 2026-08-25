const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const categoryExists = await Category.findOne({ name: name.trim() });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      createdBy: req.user._id
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) {
      // Check if name is taken by another category
      const nameExists = await Category.findOne({ 
        name: name.trim(), 
        _id: { $ne: req.params.id } 
      });
      if (nameExists) {
        return res.status(400).json({ message: 'Category name already in use' });
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    const updatedCategory = await category.save();
    return res.json(updatedCategory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if products are linked to this category
    const productsLinked = await Product.findOne({ category: req.params.id });
    if (productsLinked) {
      return res.status(400).json({ 
        message: 'Cannot delete category: products are currently linked to it' 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Category removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
