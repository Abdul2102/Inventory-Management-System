import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { getProduct, updateStock } from '../services/productService';
import api from '../utils/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const isAdmin = user?.role === 'admin';

  // State Management
  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stock Update Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Restock');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch product specifications
  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [productData, transRes] = await Promise.all([
        getProduct(id),
        api.get(`/transactions/product/${id}`)
      ]);

      setProduct(productData);
      setTransactions(transRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to retrieve product details.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  // Handle Quick Stock Update Submission
  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setModalError('');

    const qty = Number(adjustQty);
    if (isNaN(qty) || qty <= 0) {
      setModalError('Quantity must be a positive number.');
      return;
    }

    if (adjustmentType === 'remove' && product.quantity - qty < 0) {
      setModalError('Stock quantity cannot be negative.');
      return;
    }

    try {
      setUpdating(true);
      await updateStock(product._id, {
        type: adjustmentType,
        quantity: qty,
        reason: adjustReason
      });

      showToast('Stock updated successfully.', 'success');
      setShowStockModal(false);
      setAdjustQty('');
      loadProductDetails();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update stock.';
      setModalError(msg);
      showToast(msg, 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Adjust stock movement reasons
  useEffect(() => {
    if (adjustmentType === 'add') {
      setAdjustReason('Restock');
    } else {
      setAdjustReason('Sale');
    }
  }, [adjustmentType]);

  // Stock status styling helpers
  const getStockBadgeColor = (qty, minStock) => {
    if (qty === 0) return 'bg-rose-50 text-rose-600 border border-rose-200/60';
    if (qty <= minStock) return 'bg-amber-50 text-amber-700 border border-amber-200/60';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-250/60';
  };

  const getStockStatusText = (qty, minStock) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= minStock) return 'Low Stock';
    return 'In Stock';
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

  if (error || !product) {
    return (
      <Layout>
        <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none">
          <div className="max-w-2xl mx-auto my-12 text-center bg-white border border-rose-100 rounded-2xl p-8">
            <svg className="w-12 h-12 text-rose-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Product</h2>
            <p className="text-slate-500 mb-6">{error || 'The requested product could not be found.'}</p>
            <Link to="/products" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl border border-slate-200 transition-colors inline-block text-sm cursor-pointer">
              Back to Catalog
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6">
          <Link to="/products" className="text-xs sm:text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1.5 font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>
        </div>

        {/* Product Details Header Panel */}
        <div className="glass-card p-6 sm:p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover bg-slate-50 border border-slate-200 shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          
          <div className="grow text-center md:text-left">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-2.5 ${getStockBadgeColor(product.quantity, product.minimumStock)}`}>
              {getStockStatusText(product.quantity, product.minimumStock)}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{product.name}</h1>
          </div>

          <div className="flex gap-8 border-t md:border-t-0 md:border-l border-slate-200 pt-5 md:pt-0 pl-0 md:pl-8 py-1.5 w-full md:w-auto justify-center">
            <div className="text-center md:text-left">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Current Stock</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">{product.quantity}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Price</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">₹{product.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Specifications grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          <div className="lg:col-span-2 glass-card p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Product Details</h3>
            <p className="text-slate-650 text-xs sm:text-sm leading-relaxed mb-6">
              {product.description || 'No description provided for this product.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Category</span>
                <span className="text-slate-800 font-semibold">{product.category?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Supplier</span>
                <span className="text-slate-800 font-semibold">{product.supplier}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Minimum Stock</span>
                <span className="text-slate-800 font-semibold font-mono">{product.minimumStock} units</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Created Date</span>
                <span className="text-slate-800 font-semibold font-mono">
                  {new Date(product.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Updated Date</span>
                <span className="text-slate-800 font-semibold font-mono">
                  {new Date(product.updatedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Created By</span>
                <span className="text-slate-800 font-semibold">{product.createdBy?.name || 'System'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Quick Status</h3>
              <div className="space-y-4 text-xs sm:text-sm mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Valuation</span>
                  <span className="text-base sm:text-lg font-bold text-slate-800 font-mono">₹{(product.quantity * product.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    product.quantity === 0 
                      ? 'text-rose-600 bg-rose-50' 
                      : product.quantity <= product.minimumStock 
                        ? 'text-amber-700 bg-amber-50 animate-pulse' 
                        : 'text-emerald-700 bg-emerald-50'
                  }`}>
                    {product.quantity === 0 ? 'Out' : product.quantity <= product.minimumStock ? 'Restock Warning' : 'Healthy'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={() => openStockUpdate(product, 'add')}
                className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                </svg>
                Update Stock
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/products')} 
                  className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Product
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Transaction Logs */}
        <div className="glass-card p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Product Stock Log</h3>

          {transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs sm:text-sm select-none">
              No movements recorded for this product yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-120">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase select-none">
                    <th className="py-3">Type</th>
                    <th className="py-3">Quantity</th>
                    <th className="py-3">Reason</th>
                    <th className="py-3">Performed By</th>
                    <th className="py-3 text-right">Date Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600">
                  {transactions.map((trans) => (
                    <tr key={trans._id} className="hover:bg-slate-50/20">
                      <td className="py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase select-none ${
                          trans.type === 'stock-in' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {trans.type}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-800">{trans.quantity}</td>
                      <td className="py-3.5 text-slate-500">{trans.reason}</td>
                      <td className="py-3.5 text-slate-500">{trans.performedBy?.name || 'System'}</td>
                      <td className="py-3.5 text-right text-slate-400 font-mono text-[11px]">
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
          )}
        </div>
      </main>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl relative animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Update Stock</h3>
            <p className="text-slate-500 text-xs mb-6 select-none">
              Modify inventory for <strong className="text-slate-800">"{product.name}"</strong>
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-250 text-rose-700 text-xs flex items-center gap-2 select-none">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Current Stock</span>
                <span className="text-xl font-bold text-slate-850 font-mono">{product.quantity} units</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Operation</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('add');
                      setModalError('');
                    }}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      adjustmentType === 'add'
                        ? 'bg-emerald-50 border-emerald-550 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-650 hover:border-slate-350'
                    }`}
                  >
                    Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('remove');
                      setModalError('');
                    }}
                    className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      adjustmentType === 'remove'
                        ? 'bg-rose-50 border-rose-550 text-rose-700'
                        : 'bg-slate-50 border-slate-200 text-slate-650 hover:border-slate-350'
                    }`}
                  >
                    Remove Stock
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQty}
                    onChange={(e) => {
                      setAdjustQty(e.target.value);
                      setModalError('');
                    }}
                    placeholder="e.g. 10"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 select-none">Reason</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-700 text-sm h-10.5 bg-white"
                  >
                    {adjustmentType === 'add' ? (
                      <>
                        <option value="Restock">Restock</option>
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

              {/* Calculated result preview */}
              {adjustQty && Number(adjustQty) > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-250 text-xs flex justify-between select-none">
                  <span className="text-slate-500 font-medium">Calculated result:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {product.quantity}{' '}
                    {adjustmentType === 'add' ? '+' : '-'}{' '}
                    {adjustQty} ={' '}
                    {adjustmentType === 'add' 
                      ? product.quantity + Number(adjustQty) 
                      : Math.max(0, product.quantity - Number(adjustQty))}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 select-none">
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
                  {updating ? 'Updating...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetails;
