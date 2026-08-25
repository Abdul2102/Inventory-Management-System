import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { getProducts, updateStock } from '../services/productService';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  
  // State variables
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stock In / Stock Out Action Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productId, setProductId] = useState('');
  const [actionType, setActionType] = useState('stock-in'); // 'stock-in' or 'stock-out'
  const [qtyValue, setQtyValue] = useState('');
  const [reasonValue, setReasonValue] = useState('New purchase');
  const [updating, setUpdating] = useState(false);

  // Fetch Dashboard Stats & All Products
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsRes, productsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        getProducts()
      ]);

      setStats(statsRes.data);
      setProducts(productsRes);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard metrics.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen to url search params (e.g. ?action=stock-in)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'stock-in') {
      setSelectedProduct(null);
      setProductId('');
      setActionType('stock-in');
      setQtyValue('');
      setReasonValue('New purchase');
      setShowActionModal(true);
    } else if (action === 'stock-out') {
      setSelectedProduct(null);
      setProductId('');
      setActionType('stock-out');
      setQtyValue('');
      setReasonValue('Sale');
      setShowActionModal(true);
    }
  }, [location.search]);

  // Adjust reasons automatically on type change
  useEffect(() => {
    if (actionType === 'stock-in') {
      setReasonValue('New purchase');
    } else {
      setReasonValue('Sale');
    }
  }, [actionType]);

  // Submit stock-in or stock-out transaction
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    
    const targetProduct = selectedProduct || products.find(p => p._id === productId);
    if (!targetProduct) {
      showToast('Please select a product.', 'warning');
      return;
    }

    const qty = Number(qtyValue);
    if (isNaN(qty) || qty <= 0) {
      showToast('Quantity must be a positive number.', 'warning');
      return;
    }

    // Insufficient stock validation for stock-out
    if (actionType === 'stock-out' && targetProduct.quantity < qty) {
      showToast(`Insufficient stock. Only ${targetProduct.quantity} units are available.`, 'error');
      return;
    }

    try {
      setUpdating(true);
      await api.post('/api/transactions', {
        product: targetProduct._id,
        type: actionType,
        quantity: qty,
        reason: reasonValue
      });

      showToast(
        actionType === 'stock-in' 
          ? 'Stock added successfully.' 
          : 'Stock removed successfully.', 
        'success'
      );
      
      // Reset Modal and query params
      setShowActionModal(false);
      setQtyValue('');
      setProductId('');
      setSelectedProduct(null);
      if (location.search) {
        navigate('/dashboard', { replace: true });
      }
      loadDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openQuickAction = (product, type) => {
    setSelectedProduct(product);
    setActionType(type);
    setQtyValue('');
    setShowActionModal(true);
  };

  const getStatusBadge = (qty, minStock) => {
    if (qty === 0) {
      return (
        <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-250/60 rounded-full uppercase tracking-wider select-none">
          Out of Stock
        </span>
      );
    }
    if (qty <= minStock) {
      return (
        <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-250/60 rounded-full uppercase tracking-wider select-none">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250/60 rounded-full uppercase tracking-wider select-none">
        In Stock
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="grow flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  const recentProducts = products.slice(0, 5);

  // --- RENDERING STAFF DASHBOARD ---
  const renderStaffDashboard = () => (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Good morning, {user?.name || 'User'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Here's your inventory activity for today.
          </p>
        </div>
      </div>

      {/* Actionable statistics KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock In Today</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{stats?.stockInToday || 0}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2">Units received today</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock Out Today</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{stats?.stockOutToday || 0}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2">Units dispatched today</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-slate-550">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock Items</span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-amber-600">{stats?.lowStockCount || 0}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2">Items below thresholds</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-slate-550">
            <span className="text-[11px] font-bold uppercase tracking-wider">Recent Updates</span>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{stats?.recentUpdates || 0}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2">Operations completed today</p>
        </div>
      </div>

      {/* Prominent Quick Actions Section */}
      <div className="glass-card p-5 sm:p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4 select-none">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setProductId('');
              setActionType('stock-in');
              setQtyValue('');
              setShowActionModal(true);
            }}
            className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm transition-all duration-200 border border-emerald-100 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            + Stock In
          </button>

          <button
            onClick={() => {
              setSelectedProduct(null);
              setProductId('');
              setActionType('stock-out');
              setQtyValue('');
              setShowActionModal(true);
            }}
            className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 font-semibold text-sm transition-all duration-200 border border-rose-100 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            - Stock Out
          </button>

          <button
            onClick={() => navigate('/products')}
            className="p-4 rounded-2xl bg-primary-50 hover:bg-primary-100 text-primary-650 font-semibold text-sm transition-all duration-200 border border-primary-100 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Product
          </button>

          <button
            onClick={() => navigate('/stock-alerts')}
            className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-sm transition-all duration-200 border border-amber-100 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            View Alerts
          </button>
        </div>
      </div>

      {/* Spacing columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Activity history list */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6">
          <div className="flex justify-between items-center mb-5 select-none">
            <h3 className="text-base font-bold text-slate-800">Recent Updates</h3>
            <Link to="/activity-history" className="text-xs font-semibold text-primary-500 hover:text-primary-600">
              View History →
            </Link>
          </div>

          {!stats?.recentActivities || stats.recentActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs select-none">
              No updates logged today.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivities.map((act) => (
                <div key={act._id} className="p-3.5 rounded-xl border border-slate-100 flex justify-between items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                      act.action === 'STOCK_IN' 
                        ? 'bg-emerald-50 text-emerald-705 border-emerald-100' 
                        : 'bg-rose-50 text-rose-650 border-rose-100'
                    }`}>
                      {act.action}
                    </span>
                    <span className="text-slate-600">
                      <strong className="text-slate-800">{act.userName}</strong>{' '}
                      {act.action === 'STOCK_IN' ? 'added' : 'removed'} {act.quantity} units of{' '}
                      <strong className="text-slate-805">{act.productName}</strong>.
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs font-mono font-medium">
                    {new Date(act.createdAt).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-800 mb-5 select-none flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Low Stock alerts
          </h3>

          {!stats?.lowStockAlerts || stats.lowStockAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs select-none">
              ✓ All inventory levels are healthy.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.lowStockAlerts.slice(0, 3).map((prod) => (
                <div key={prod._id} className="p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-750">{prod.name}</h4>
                    <span className="text-slate-500 block">
                      {prod.quantity === 0 ? 'Out of stock' : `Only ${prod.quantity} remaining`}
                    </span>
                  </div>
                  <button
                    onClick={() => openQuickAction(prod, 'stock-in')}
                    className="px-2.5 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-100 font-semibold cursor-pointer"
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // --- RENDERING ADMIN DASHBOARD ---
  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Good morning, {user?.name || 'User'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Here's what's happening with your inventory today.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link
            to="/products"
            className="px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </Link>
        )}
      </div>

      {/* Dynamic statistics cards grid (Desktop: 4, Tablet: 2, Mobile: 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 select-none">
        {/* Total Products */}
        <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Products</span>
            <div className="p-2 bg-primary-50 text-primary-500 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{stats?.totalProducts || 0}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2 select-none">
            +8 this month
          </p>
        </div>

        {/* In Stock */}
        <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-slate-555">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Stock</span>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{stats?.inStockCount || 0}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2 select-none">
            Healthy stock levels
          </p>
        </div>

        {/* Low Stock */}
        <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-slate-550">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock</span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-amber-600">{stats?.lowStockCount || 0}</h3>
          <p className="text-[11px] text-amber-705 font-semibold mt-2 select-none">
            Needs attention
          </p>
        </div>

        {/* Out of Stock */}
        <div className="glass-card p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-3 text-slate-550">
            <span className="text-[11px] font-bold uppercase tracking-wider">Out of Stock</span>
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-rose-600">{stats?.outOfStockCount || 0}</h3>
          <p className="text-[11px] text-rose-705 font-semibold mt-2 select-none">
            Restock required
          </p>
        </div>
      </div>

      {/* Responsive Content Grids (Desktop: 2 columns, Mobile: 1 column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recently Added Section */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-800 select-none">Recently Added</h3>
              <Link to="/products" className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                View All Products →
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 select-none text-xs">
                No products added yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-120">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider select-none">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600">
                    {recentProducts.map((prod) => (
                      <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-semibold text-slate-700">
                          <Link to={`/products/${prod._id}`} className="hover:text-primary-500 transition-colors">
                            {prod.name}
                          </Link>
                        </td>
                        <td className="py-3.5 text-slate-500">{prod.category?.name || 'General'}</td>
                        <td className="py-3.5 font-bold text-slate-700">{prod.quantity}</td>
                        <td className="py-3.5">{getStatusBadge(prod.quantity, prod.minimumStock)}</td>
                        <td className="py-3.5 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(prod.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Category Overview */}
        <div className="glass-card p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-800 mb-6 select-none">Inventory Overview</h3>
          
          {!stats?.categoryOverview || stats.categoryOverview.length === 0 ? (
            <div className="py-12 text-center text-slate-400 select-none text-xs">
              No categories available.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.categoryOverview.map((cat) => (
                <div key={cat.name} className="space-y-1.5 select-none">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <span className="text-slate-400 font-medium">{cat.count} products</span>
                  </div>
                  {/* Weight bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/20">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / (stats.totalProducts || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Critical Stock Alerts */}
        <div className="lg:col-span-3 glass-card p-5 sm:p-6 mt-2">
          <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2 select-none">
            <svg className="w-4.5 h-4.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Critical Stock Alerts
          </h3>

          {!stats?.lowStockAlerts || stats.lowStockAlerts.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs sm:text-sm select-none">
              ✕ No stock alerts. Your inventory is healthy!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.lowStockAlerts.map((prod) => (
                <div 
                  key={prod._id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                    prod.quantity === 0 
                      ? 'bg-rose-50/40 border-rose-100 text-rose-900' 
                      : 'bg-amber-50/40 border-amber-100 text-amber-900'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1 select-none">
                      <Link to={`/products/${prod._id}`} className="font-bold text-slate-800 hover:text-primary-500 text-xs sm:text-sm transition-colors">
                        {prod.name}
                      </Link>
                    </div>
                    <div className="text-xs text-slate-500 mb-4 select-none">
                      {prod.quantity === 0 ? (
                        <span className="text-rose-600 font-semibold">✕ Out of stock</span>
                      ) : (
                        <span>
                          ⚠ Only <strong className="text-amber-600 font-bold">{prod.quantity}</strong> left (Minimum: {prod.minimumStock})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openQuickAction(prod, 'stock-in')}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      prod.quantity === 0 
                        ? 'bg-white hover:bg-rose-100/50 text-rose-700 border border-rose-200' 
                        : 'bg-white hover:bg-amber-100/50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                    </svg>
                    {prod.quantity === 0 ? 'Restock' : 'Update Stock'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none">
        {isAdmin ? renderAdminDashboard() : renderStaffDashboard()}
      </main>

      {/* Stock In / Stock Out Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl relative animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {actionType === 'stock-in' ? 'Stock In' : 'Stock Out'} Operation
            </h3>
            <p className="text-slate-500 text-xs mb-6 select-none">
              Record inventory {actionType === 'stock-in' ? 'intake' : 'release'} movements.
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Select Product *</label>
                {selectedProduct ? (
                  <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold">
                    {selectedProduct.name} (Current: {selectedProduct.quantity})
                  </div>
                ) : (
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-sm h-10 bg-white"
                  >
                    <option value="">Select Product...</option>
                    {products.map((prod) => (
                      <option key={prod._id} value={prod._id}>
                        {prod.name} (Available: {prod.quantity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Display Current Stock level */}
              {(selectedProduct || productId) && (
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 select-none">Current Stock</span>
                  <span className="text-xl font-bold text-slate-800 font-mono">
                    {selectedProduct ? selectedProduct.quantity : products.find(p => p._id === productId)?.quantity || 0} units
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={qtyValue}
                    onChange={(e) => setQtyValue(e.target.value)}
                    placeholder="e.g. 10"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-900 placeholder-slate-400 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Reason / Note *</label>
                  <select
                    value={reasonValue}
                    onChange={(e) => setReasonValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-700 text-sm h-10 bg-white"
                  >
                    {actionType === 'stock-in' ? (
                      <>
                        <option value="New purchase">New purchase</option>
                        <option value="Correction">Correction</option>
                      </>
                    ) : (
                      <>
                        <option value="Sale">Sale</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Correction">Correction</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Projection preview inside modal */}
              {(selectedProduct || productId) && qtyValue && Number(qtyValue) > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between select-none">
                  <span className="text-slate-500 font-medium">Projected stock level:</span>
                  <span className="font-bold font-mono text-slate-850">
                    {selectedProduct ? selectedProduct.quantity : products.find(p => p._id === productId)?.quantity || 0}{' '}
                    {actionType === 'stock-in' ? '+' : '-'}{' '}
                    {qtyValue} ={' '}
                    {actionType === 'stock-in' 
                      ? (selectedProduct ? selectedProduct.quantity : products.find(p => p._id === productId)?.quantity || 0) + Number(qtyValue) 
                      : Math.max(0, (selectedProduct ? selectedProduct.quantity : products.find(p => p._id === productId)?.quantity || 0) - Number(qtyValue))}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedProduct(null);
                    setProductId('');
                    if (location.search) {
                      navigate('/dashboard', { replace: true });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {updating ? 'Recording...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
