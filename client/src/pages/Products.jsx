import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../services/productService';
import api from '../utils/api';

const Products = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  // State Management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [sortField, setSortField] = useState('newest');

  // Supplier dropdown options list
  const [suppliersList, setSuppliersList] = useState([]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form Fields
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minimumStock, setMinimumStock] = useState('10');
  const [supplier, setSupplier] = useState('');
  const [image, setImage] = useState('');
  
  // Submit loader
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  };

  // Fetch products
  const fetchProductsList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (supplierFilter) params.supplier = supplierFilter;
      if (sortField) params.sort = sortField;

      const data = await getProducts(params);
      setProducts(data);

      // Collect unique suppliers list dynamically
      const suppliers = [...new Set(data.map(p => p.supplier).filter(Boolean))];
      setSuppliersList(suppliers);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger query refetch on filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProductsList();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [search, categoryFilter, statusFilter, supplierFilter, sortField]);

  // Load initial settings
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle focusing the search input field if ?focus=search is set in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('focus') === 'search') {
      const input = document.getElementById('search-input');
      if (input) {
        setTimeout(() => {
          input.focus();
        }, 300);
      }
    }
  }, [location.search]);

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
    setSupplierFilter('');
    setSortField('newest');
  };

  // Form inputs validation rules
  const validateForm = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Product name is required.';
    if (!category) errs.category = 'Category is required.';
    if (!supplier.trim()) errs.supplier = 'Supplier is required.';
    
    if (price === '' || Number(price) <= 0) {
      errs.price = 'Price must be greater than 0.';
    }
    if (quantity === '' || Number(quantity) < 0) {
      errs.quantity = 'Quantity must be at least 0.';
    }
    if (minimumStock === '' || Number(minimumStock) < 0) {
      errs.minimumStock = 'Minimum stock must be at least 0.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Add Product
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await createProduct({
        name,
        category,
        description,
        price: Number(price),
        quantity: Number(quantity),
        minimumStock: Number(minimumStock),
        supplier,
        image
      });
      setShowAddModal(false);
      showToast('Product added successfully.', 'success');
      fetchProductsList();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Product
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedProduct) return;

    try {
      setSubmitting(true);
      await updateProduct(selectedProduct._id, {
        name,
        category,
        description,
        price: Number(price),
        quantity: Number(quantity),
        minimumStock: Number(minimumStock),
        supplier,
        image
      });
      setShowEditModal(false);
      setSelectedProduct(null);
      showToast('Product updated successfully.', 'success');
      fetchProductsList();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteSubmit = async () => {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await deleteProduct(selectedProduct._id);
      showToast('Product deleted successfully.', 'success');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProductsList();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modals
  const openEdit = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setCategory(product.category?._id || '');
    setDescription(product.description || '');
    setPrice(product.price);
    setQuantity(product.quantity);
    setMinimumStock(product.minimumStock);
    setSupplier(product.supplier || '');
    setImage(product.image || '');
    setFormErrors({});
    setShowEditModal(true);
  };

  // Open Delete Confirms
  const openDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Open Add Dialog
  const openAdd = () => {
    setName('');
    setCategory('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setMinimumStock('10');
    setSupplier('');
    setImage('');
    setFormErrors({});
    setShowAddModal(true);
  };

  // Stock badge status calculation
  const getStatusBadge = (qty, minStock) => {
    if (qty === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60 uppercase tracking-wider select-none">
          Out of Stock
        </span>
      );
    }
    if (qty <= minStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 uppercase tracking-wider select-none">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250/60 uppercase tracking-wider select-none">
        In Stock
      </span>
    );
  };

  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Products
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage your inventory and monitor stock levels.</p>
          </div>
          {isAdmin && (
            <button
              onClick={openAdd}
              className="px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors duration-200 cursor-pointer"
            >
              Add Product
            </button>
          )}
        </div>

        {/* Toolbar: Search, Filters & Sorting */}
        <div className="glass-card p-4 sm:p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Search</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  id="search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, Supplier..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-slate-900 placeholder-slate-400 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-xs sm:text-sm h-10 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-xs sm:text-sm h-10 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Supplier</label>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-xs sm:text-sm h-10 bg-white"
              >
                <option value="">All Suppliers</option>
                {suppliersList.map((sup) => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            </div>

            {/* Sort options */}
            <div className="flex gap-2">
              <div className="grow">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sort By</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-xs sm:text-sm h-10 bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="name-a-z">Name A-Z</option>
                  <option value="name-z-a">Name Z-A</option>
                  <option value="price-low-high">Price Low → High</option>
                  <option value="price-high-low">Price High → Low</option>
                  <option value="stock-low-high">Stock Low → High</option>
                  <option value="stock-high-low">Stock High → Low</option>
                </select>
              </div>

              {(search || categoryFilter || statusFilter || supplierFilter || sortField !== 'newest') && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors h-10 mt-auto cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Catalog List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto my-12 animate-slide-up">
            <div className="inline-flex bg-primary-50 p-4 rounded-full text-primary-500 mb-4 select-none">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">
              {search || categoryFilter || statusFilter || supplierFilter 
                ? 'No products match the selected filters.' 
                : 'No products yet.'}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">
              {search || categoryFilter || statusFilter || supplierFilter 
                ? 'Try adjusting your search criteria.' 
                : 'Get started by creating your first product profile.'}
            </p>
            {search || categoryFilter || statusFilter || supplierFilter ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            ) : (
              isAdmin && (
                <button
                  onClick={openAdd}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  Add Product
                </button>
              )
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block glass-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider select-none">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">
                        <Link to={`/products/${product._id}`} className="hover:text-primary-500 transition-colors flex items-center gap-2.5">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span>{product.name}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-slate-550">{product.category?.name || 'Unassigned'}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-805">₹{product.price.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-slate-650">
                        <span className="font-bold text-slate-800">{product.quantity}</span>
                        <span className="text-slate-400 text-xs font-normal"> / {product.minimumStock} min</span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{product.supplier}</td>
                      <td className="px-6 py-3.5">
                        {getStatusBadge(product.quantity, product.minimumStock)}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2 select-none">
                        <Link
                          to={`/products/${product._id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors text-xs font-semibold inline-block"
                        >
                          View
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEdit(product)}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 text-primary-600 border border-slate-200 transition-colors text-xs font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openDelete(product)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50/40 hover:bg-rose-50 text-rose-600 border border-rose-100 transition-colors text-xs font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Stacked Card List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
              {products.map((product) => (
                <div key={product._id} className="glass-card p-5 relative overflow-hidden flex flex-col justify-between animate-slide-up">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <Link to={`/products/${product._id}`} className="text-sm sm:text-base font-bold text-slate-800 hover:text-primary-500 transition-colors">
                            {product.name}
                          </Link>
                        </div>
                      </div>
                      {getStatusBadge(product.quantity, product.minimumStock)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-100 py-3 mb-4 text-slate-600">
                      <div>
                        <span className="text-slate-400 block select-none">Category</span>
                        <span className="font-semibold text-slate-800">{product.category?.name || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block select-none">Price</span>
                        <span className="font-semibold text-slate-800">₹{product.price.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block select-none">Stock Level</span>
                        <span className="font-semibold text-slate-800">{product.quantity} units</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block select-none">Supplier</span>
                        <span className="font-semibold truncate text-slate-800">{product.supplier}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end select-none">
                    <Link
                      to={`/products/${product._id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold"
                    >
                      View
                    </Link>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEdit(product)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 text-primary-600 border border-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(product)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50/40 hover:bg-rose-50 text-rose-650 border border-rose-100 text-xs font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl relative my-8 max-h-[90vh] overflow-y-auto animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Add Product</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product Name"
                  className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm ${formErrors.name ? 'border-red-500/40' : ''}`}
                />
                {formErrors.name && <p className="text-red-500 text-[11px] mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-sm bg-white ${formErrors.category ? 'border-red-500/40' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-[11px] mt-1">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Supplier *</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Supplier Vendor Name"
                    className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm ${formErrors.supplier ? 'border-red-500/40' : ''}`}
                  />
                  {formErrors.supplier && <p className="text-red-500 text-[11px] mt-1">{formErrors.supplier}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm ${formErrors.price ? 'border-red-500/40' : ''}`}
                  />
                  {formErrors.price && <p className="text-red-500 text-[11px] mt-1">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quantity *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm ${formErrors.quantity ? 'border-red-500/40' : ''}`}
                  />
                  {formErrors.quantity && <p className="text-red-500 text-[11px] mt-1">{formErrors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Minimum Stock *</label>
                  <input
                    type="number"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(e.target.value)}
                    placeholder="10"
                    className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm ${formErrors.minimumStock ? 'border-red-500/40' : ''}`}
                  />
                  {formErrors.minimumStock && <p className="text-red-500 text-[11px] mt-1">{formErrors.minimumStock}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-405 mb-1.5">Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/product.jpg"
                    className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-405 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of product features..."
                    rows="2.5"
                    className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl relative my-8 max-h-[90vh] overflow-y-auto animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Edit Product</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product Name"
                  className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-405 text-sm ${formErrors.name ? 'border-red-500/40' : ''}`}
                />
                {formErrors.name && <p className="text-red-500 text-[11px] mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-sm bg-white ${formErrors.category ? 'border-red-500/40' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-[11px] mt-1">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Supplier *</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Supplier Vendor Name"
                    className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-405 text-sm ${formErrors.supplier ? 'border-red-500/40' : ''}`}
                  />
                  {formErrors.supplier && <p className="text-red-500 text-[11px] mt-1">{formErrors.supplier}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-405 text-sm ${formErrors.price ? 'border-red-500/40' : ''}`}
                  />
                  {formErrors.price && <p className="text-red-500 text-[11px] mt-1">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quantity *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-405 text-sm ${formErrors.quantity ? 'border-red-500/40' : ''}`}
                  />
                  {formErrors.quantity && <p className="text-red-500 text-[11px] mt-1">{formErrors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Minimum Stock *</label>
                  <input
                    type="number"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(e.target.value)}
                    placeholder="10"
                    className={`w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-405 text-sm ${formErrors.minimumStock ? 'border-red-500/40' : ''}`}
                  />
                  {formErrors.minimumStock && <p className="text-red-500 text-[11px] mt-1">{formErrors.minimumStock}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-405 mb-1.5">Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/product.jpg"
                    className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-405 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of product features..."
                    rows="2.5"
                    className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-slide-up">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product?</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed select-none">
              Are you sure you want to remove <strong className="text-slate-800">"{selectedProduct?.name}"</strong> from your inventory? 
              This will remove the product profile from the database permanently.
            </p>
            <div className="flex justify-end gap-3 select-none">
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
