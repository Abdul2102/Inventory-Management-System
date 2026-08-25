import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const res = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Logged in successfully!', 'success');
      navigate('/dashboard');
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-[#f1f5f9] via-primary-100/30 to-[#f8fafc] px-4 py-12 relative overflow-hidden">
      {/* Premium Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/35 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 select-none pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100/50 relative z-10 animate-slide-up">
        <div className="text-center mb-8 select-none">
          <div className="inline-flex bg-linear-to-tr from-primary-500 to-indigo-650 p-3.5 rounded-2xl shadow-lg shadow-primary-500/10 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">StockFlow Sign In</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">Sign in to manage your inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 select-none">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@company.com"
              className={`w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-slate-900 placeholder-slate-400 text-sm outline-hidden transition-all duration-200 ${
                errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' : ''
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 select-none">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-slate-900 placeholder-slate-400 text-sm outline-hidden transition-all duration-200 ${
                errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' : ''
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-primary-500/10 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs sm:text-sm text-slate-500 font-medium select-none">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-500 hover:text-primary-600 transition-colors">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
