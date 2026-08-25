import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' // default selection
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.name) {
      tempErrors.name = 'Full Name is required';
    }

    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      tempErrors.role = 'Role selection is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const res = await register(formData.name, formData.email, formData.password, formData.role);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Account registered successfully!', 'success');
      navigate('/dashboard');
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070a13] px-4 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-650/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 select-none pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 animate-slide-up">
        <div className="text-center mb-8 select-none">
          <div className="inline-flex bg-linear-to-tr from-primary-500 to-indigo-650 p-3 rounded-2xl shadow-md shadow-primary-500/10 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-linear-to-r from-white to-slate-350 bg-clip-text text-transparent">Create Account</h2>
          <p className="text-slate-450 text-xs sm:text-sm mt-1.5">Get started with role-based access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5 select-none">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className={`w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-550 text-sm ${
                errors.name ? 'border-red-500/50 focus:border-red-505 focus:ring-red-505/20' : ''
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5 select-none">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@company.com"
              className={`w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-550 text-sm ${
                errors.email ? 'border-red-500/50 focus:border-red-550 focus:ring-red-550/20' : ''
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5 select-none">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`w-full px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-555 text-sm ${
                errors.password ? 'border-red-500/50 focus:border-red-550 focus:ring-red-550/20' : ''
              }`}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-1.5 select-none">Access Role</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 select-none ${
                formData.role === 'staff'
                  ? 'bg-primary-500/10 border-primary-500/50 text-primary-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="staff"
                  checked={formData.role === 'staff'}
                  onChange={handleChange}
                  className="sr-only"
                />
                Staff Access
              </label>

              <label className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 select-none ${
                formData.role === 'admin'
                  ? 'bg-primary-500/10 border-primary-500/50 text-primary-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                  className="sr-only"
                />
                Admin Access
              </label>
            </div>
            {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-xl bg-linear-to-r from-primary-500 to-indigo-650 hover:from-primary-450 hover:to-indigo-550 text-white font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs sm:text-sm text-slate-450 select-none">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-400 hover:text-primary-350 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
