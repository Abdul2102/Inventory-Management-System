import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ToastContext } from '../context/ToastContext';
import Layout from '../components/Layout';
import { updateStock } from '../services/productService';

const StockAlerts = () => {
  const { showToast } = useContext(ToastContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stock In Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Restock');
  const [updating, setUpdating] = useState(false);

  // Fetch low-stock and out-of-stock products
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      // Filter out-of-stock or low-stock items
      const items = res.data.filter(p => p.quantity <= p.minimumStock);
      setAlerts(items);
    } catch (err) {
      showToast('Failed to retrieve stock alerts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Handle restock submission
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = Number(adjustQty);
    if (isNaN(qty) || qty <= 0) {
      showToast('Quantity must be a positive number', 'warning');
      return;
    }

    try {
      setUpdating(true);
      await updateStock(selectedProduct._id, {
        type: 'add',
        quantity: qty,
        reason: adjustReason
      });

      showToast('Restocked successfully!', 'success');
      setShowStockModal(false);
      setAdjustQty('');
      setSelectedProduct(null);
      fetchAlerts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openRestock = (product) => {
    setSelectedProduct(product);
    setAdjustQty('');
    setAdjustReason('Restock');
    setShowStockModal(true);
  };

  const getStatusBadge = (qty, minStock) => {
    if (qty === 0) {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60 rounded-full uppercase tracking-wider select-none">
          Out of Stock
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-750 border border-amber-200/60 rounded-full uppercase tracking-wider select-none">
        Low Stock
      </span>
    );
  };

  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none animate-slide-up">
        {/* Title Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Stock Alerts
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Review and restock items that have fallen below minimum thresholds.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto my-12">
            <div className="inline-flex bg-emerald-50 p-4 rounded-full text-emerald-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">No Low-Stock Products</h3>
            <p className="text-slate-500 text-xs sm:text-sm">Your inventory levels are healthy right now.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block glass-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4">Minimum Threshold</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600">
                  {alerts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">
                        <Link to={`/products/${product._id}`} className="hover:text-primary-500 transition-colors">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-slate-550">{product.category?.name || 'Unassigned'}</td>
                      <td className={`px-6 py-3.5 font-bold ${product.quantity === 0 ? 'text-rose-650' : 'text-amber-700'}`}>
                        {product.quantity}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono">{product.minimumStock}</td>
                      <td className="px-6 py-3.5">
                        {getStatusBadge(product.quantity, product.minimumStock)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => openRestock(product)}
                          className="px-3.5 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-100 transition-colors text-xs font-semibold cursor-pointer"
                        >
                          Stock In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
              {alerts.map((product) => (
                <div key={product._id} className="glass-card p-5 border border-slate-200/80 relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Link to={`/products/${product._id}`} className="text-sm sm:text-base font-bold text-slate-800 hover:text-primary-500 transition-colors">
                        {product.name}
                      </Link>
                      {getStatusBadge(product.quantity, product.minimumStock)}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-100 py-3 mb-4 text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Current Stock</span>
                        <span className={`font-bold ${product.quantity === 0 ? 'text-rose-655' : 'text-amber-700'}`}>
                          {product.quantity} units
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Minimum Stock</span>
                        <span className="font-semibold text-slate-800">{product.minimumStock} units</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openRestock(product)}
                    className="w-full py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Stock In
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Stock In Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl relative animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Restock Item</h3>
            <p className="text-slate-500 text-xs mb-6">
              Record inventory intake for <strong className="text-slate-800">"{selectedProduct.name}"</strong>
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Current Stock</span>
                <span className="text-xl font-bold text-slate-800 font-mono">{selectedProduct.quantity} units</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quantity to Add *</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="e.g. 20"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-900 placeholder-slate-400 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Notes / Reason</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="New supplier delivery..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-700 text-sm"
                  />
                </div>
              </div>

              {adjustQty && Number(adjustQty) > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                  <span className="text-slate-505 font-medium">New projected stock:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {selectedProduct.quantity} + {adjustQty} = {selectedProduct.quantity + Number(adjustQty)}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {updating ? 'Recording...' : 'Confirm Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StockAlerts;
