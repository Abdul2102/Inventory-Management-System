import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  // Helper active classes
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm border-l-2 ${
      isActive
        ? 'bg-white/10 text-white border-primary-400 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
    }`;

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-35 bg-slate-950/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0f172a] border-r border-slate-800/20 min-h-screen p-4 flex flex-col justify-between select-none transform transition-transform duration-200 ease-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between px-3 py-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-tr from-primary-500 to-indigo-650 p-2.5 rounded-xl shadow-md shadow-primary-500/10">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">StockFlow</h1>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Inventory, simplified.</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <NavLink to="/dashboard" onClick={onClose} end className={linkClasses}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </NavLink>

            <NavLink to="/products" onClick={onClose} className={linkClasses}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Products
            </NavLink>

            {/* Staff-only Stock In / Stock Out links */}
            {!isAdmin && (
              <>
                <Link
                  to="/dashboard?action=stock-in"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent"
                >
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Stock In
                </Link>
                <Link
                  to="/dashboard?action=stock-out"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent"
                >
                  <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Stock Out
                </Link>
              </>
            )}

            <NavLink to="/stock-alerts" onClick={onClose} className={linkClasses}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Stock Alerts
            </NavLink>

            {/* Admin-only Links */}
            {isAdmin && (
              <>
                <NavLink to="/categories" onClick={onClose} className={linkClasses}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2050/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Categories
                </NavLink>
                <NavLink to="/reports" onClick={onClose} className={linkClasses}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Reports
                </NavLink>
                <NavLink to="/settings" onClick={onClose} className={linkClasses}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </NavLink>
              </>
            )}

            {/* Staff-only Activity History link */}
            {!isAdmin && (
              <NavLink to="/activity-history" onClick={onClose} className={linkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activity History
              </NavLink>
            )}

            <NavLink to="/profile" onClick={onClose} className={linkClasses}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </NavLink>
          </nav>
        </div>

        {/* Profile Operator Tag */}
        <div className="px-3 py-4 border-t border-slate-800/60 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 font-bold border border-slate-700 uppercase text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="grow overflow-hidden">
              <h4 className="text-xs font-bold truncate text-slate-200">{user?.name}</h4>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-1 ${
                user?.role === 'admin' 
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/20' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
