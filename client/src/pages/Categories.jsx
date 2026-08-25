import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { ToastContext } from '../context/ToastContext';
import Layout from '../components/Layout';

const Categories = () => {
  const { showToast } = useContext(ToastContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Submit loader
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories.');
      showToast(err.response?.data?.message || 'Failed to fetch categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Add Category
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await api.post('/categories', { name, description });
      setName('');
      setDescription('');
      setShowAddModal(false);
      showToast('Category created successfully!', 'success');
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Category
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedCategory) return;

    try {
      setSubmitting(true);
      await api.put(`/categories/${selectedCategory._id}`, { name, description });
      setName('');
      setDescription('');
      setSelectedCategory(null);
      setShowEditModal(false);
      showToast('Category updated successfully!', 'success');
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Category
  const handleDeleteSubmit = async () => {
    if (!selectedCategory) return;

    try {
      setSubmitting(true);
      await api.delete(`/categories/${selectedCategory._id}`);
      showToast('Category deleted successfully!', 'success');
      setSelectedCategory(null);
      setShowDeleteModal(false);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete category.', 'error');
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Dialog
  const openEdit = (category) => {
    setSelectedCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setShowEditModal(true);
  };

  // Open Delete Dialog
  const openDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 select-none">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Category Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Create and organize product classification groups.</p>
          </div>
          <button
            onClick={() => {
              setName('');
              setDescription('');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-primary-500 to-indigo-650 hover:from-primary-400 hover:to-indigo-550 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 hover:scale-[1.01] flex items-center gap-2 cursor-pointer select-none"
          >
            Add Category
          </button>
        </div>

        {/* Content catalog view */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-slate-800/80 max-w-xl mx-auto my-12 animate-slide-up">
            <div className="inline-flex bg-primary-500/10 p-4 rounded-full text-primary-400 mb-4 select-none">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-2 select-none">No Categories</h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6 select-none">Create groups to categorize your products inventory.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-250 font-semibold text-xs border border-slate-700 transition-colors select-none cursor-pointer"
            >
              Add First Category
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-120">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider select-none">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Created By</th>
                    <th className="px-6 py-4">Date Added</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm text-slate-350">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-200">{category.name}</td>
                      <td className="px-6 py-3.5 text-slate-400 max-w-xs truncate">{category.description || '-'}</td>
                      <td className="px-6 py-3.5 text-slate-300">{category.createdBy?.name || 'System'}</td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(category.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2 select-none">
                        <button
                          onClick={() => openEdit(category)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-700/60 transition-colors text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(category)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 transition-colors text-xs font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 md:p-8 shadow-2xl relative border border-slate-800 animate-slide-up">
            <h3 className="text-lg font-bold text-slate-200 mb-6">Create Category</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5 select-none">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hardware, Office Supplies"
                  required
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-505 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-1.5 select-none">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief details about category usage..."
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-550 text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-primary-500 to-indigo-650 hover:from-primary-450 hover:to-indigo-550 text-white font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 md:p-8 shadow-2xl relative border border-slate-800 animate-slide-up">
            <h3 className="text-lg font-bold text-slate-200 mb-6">Edit Category</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-1.5 select-none">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category Name"
                  required
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-505 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-1.5 select-none">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief details about category usage..."
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-550 text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-primary-500 to-indigo-650 hover:from-primary-450 hover:to-indigo-550 text-white font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-slide-up">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 shadow-2xl relative border border-red-950/20">
            <h3 className="text-lg font-bold text-slate-200 mb-2">Delete Category?</h3>
            <p className="text-slate-450 text-xs sm:text-sm mb-6 leading-relaxed select-none">
              Are you sure you want to delete the category <strong className="text-slate-200">"{selectedCategory?.name}"</strong>? 
              This action will fail if products are linked.
            </p>
            <div className="flex justify-end gap-3 select-none">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-350 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-red-650 hover:bg-red-650/90 text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Categories;
