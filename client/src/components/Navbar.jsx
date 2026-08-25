import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center justify-between shadow-xs relative z-20 select-none">
      <div className="flex items-center">
        {/* Mobile Hamburger toggle button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors mr-3 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400 hidden sm:inline">Workspace /</span>
          <span className="font-semibold text-slate-700 uppercase tracking-wider">{user?.role} Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-700">Welcome, {user?.name}</span>
          <span className="text-xs text-slate-400">{user?.email}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-650 border border-slate-200 hover:border-red-200/50 transition-all duration-200 text-xs sm:text-sm font-medium cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2050/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden xs:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
