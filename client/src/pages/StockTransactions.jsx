import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { ToastContext } from '../context/ToastContext';
import Layout from '../components/Layout';

const StockTransactions = () => {
  const { showToast } = useContext(ToastContext);
  
  // Data lists
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filters state
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('stock-in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('New purchase');

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch initial products
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products list:', err.message);
    }
  };

  // Fetch transactions log
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedProductFilter) params.product = selectedProductFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve transaction logs.');
      showToast(err.response?.data?.message || 'Failed to retrieve transaction logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Refetch logs on filter updates
  useEffect(() => {
    fetchTransactions();
  }, [selectedProductFilter, startDate, endDate]);

  // Load products list on load
  useEffect(() => {
    fetchProducts();
  }, []);

  // Clear filters
  const handleClearFilters = () => {
    setSelectedProductFilter('');
    setStartDate('');
    setEndDate('');
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!productId || !type || !quantity || !reason) {
      setFormError('Please fill in all fields.');
      return;
    }

    const qtyNumber = Number(quantity);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      setFormError('Quantity must be a positive number.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/transactions', {
        product: productId,
        type,
        quantity: qtyNumber,
        reason
      });
      
      // Reset form fields
      setProductId('');
      setType('stock-in');
      setQuantity('');
      setReason('New purchase');
      setShowAddModal(false);
      
      showToast('Stock movement logged successfully!', 'success');
      fetchTransactions();
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit stock movement.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Set default reason on type changes
  useEffect(() => {
    if (type === 'stock-in') {
      setReason('New purchase');
    } else {
      setReason('Sale');
    }
  }, [type]);

  // Helper to find selected product details for preview
  const getSelectedProductDetails = () => {
    return products.find(p => p._id === productId);
  };

  const activeProduct = getSelectedProductDetails();

  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Stock Movements
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Log and audit product stock in/out adjustments.</p>
          </div>
          <button
            onClick={() => {
              setFormError('');
              setProductId('');
              setQuantity('');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors duration-200 flex items-center gap-2 cursor-pointer"
          >
            Record Movement
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="glass-card p-4 sm:p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {/* Product filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Filter by Product</label>
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-xs sm:text-sm h-10 bg-white"
              >
                <option value="">All Products</option>
                {products.map((prod) => (
                  <option key={prod._id} value={prod._id}>
                    {prod.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-750 text-xs sm:text-sm h-10 bg-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-750 text-xs sm:text-sm h-10 bg-white"
              />
            </div>

            {/* Reset button */}
            <div>
              {(selectedProductFilter || startDate || endDate) ? (
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors h-10 cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                <div className="h-10 hidden md:block"></div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table/Cards logs list */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto my-12 animate-slide-up">
            <div className="inline-flex bg-primary-50 p-4 rounded-full text-primary-500 mb-4 select-none">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">No Transaction Logs</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">No stock movement logs found matching active filters.</p>
            {(selectedProductFilter || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table view */}
            <div className="hidden lg:block glass-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider select-none">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Performed By</th>
                    <th className="px-6 py-4 text-right">Date/Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-650">
                  {transactions.map((trans) => (
                    <tr key={trans._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">
                        {trans.product ? trans.product.name : 'Deleted Product'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide select-none ${
                          trans.type === 'stock-in'
                            ? 'bg-emerald-50 text-emerald-705'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {trans.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">{trans.quantity}</td>
                      <td className="px-6 py-3.5 text-slate-500">{trans.reason}</td>
                      <td className="px-6 py-3.5 text-slate-600">{trans.performedBy?.name || 'System'}</td>
                      <td className="px-6 py-3.5 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(trans.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Stacked Card List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
              {transactions.map((trans) => (
                <div key={trans._id} className="glass-card p-5 relative overflow-hidden flex flex-col justify-between animate-slide-up">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-800">
                        {trans.product ? trans.product.name : 'Deleted Product'}
                      </h4>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      trans.type === 'stock-in'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {trans.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3 text-slate-600">
                    <div>
                      <span className="text-slate-400 block select-none">Quantity</span>
                      <span className="font-semibold text-slate-800">{trans.quantity} units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block select-none">Reason</span>
                      <span className="font-semibold text-slate-800">{trans.reason}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block select-none">Operator</span>
                      <span className="font-semibold text-slate-800">{trans.performedBy?.name || 'System'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block select-none">Date</span>
                      <span className="font-semibold text-slate-500 font-mono text-[11px]">
                        {new Date(trans.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Record Stock Movement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl relative animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Record Stock Movement</h3>
            
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-250 text-rose-700 text-xs flex items-center gap-2 select-none">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Select Product *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-700 text-sm h-10 bg-white"
                >
                  <option value="">Select Product...</option>
                  {products.map((prod) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.name} (Qty in stock: {prod.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Movement Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setType('stock-in');
                      setFormError('');
                    }}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      type === 'stock-in'
                        ? 'bg-emerald-50 border-emerald-550 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Stock In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType('stock-out');
                      setFormError('');
                    }}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      type === 'stock-out'
                        ? 'bg-rose-50 border-rose-550 text-rose-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Stock Out
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setFormError('');
                    }}
                    placeholder="e.g. 10"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Reason *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-700 text-sm h-10 bg-white"
                  >
                    {type === 'stock-in' ? (
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
              {activeProduct && quantity && Number(quantity) > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between select-none">
                  <span className="text-slate-550 font-medium">Projected stock level:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {activeProduct.quantity}{' '}
                    {type === 'stock-in' ? '+' : '-'}{' '}
                    {quantity} ={' '}
                    {type === 'stock-in' 
                      ? activeProduct.quantity + Number(quantity) 
                      : Math.max(0, activeProduct.quantity - Number(quantity))}
                  </span>
                </div>
              )}

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
                  {submitting ? 'Recording...' : 'Submit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StockTransactions;
