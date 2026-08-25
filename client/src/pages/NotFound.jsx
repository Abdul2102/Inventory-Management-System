import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-955 px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 select-none pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 text-center border border-slate-800/80">
        <h1 className="text-8xl font-extrabold tracking-widest bg-linear-to-tr from-purple-500 to-indigo-400 bg-clip-text text-transparent select-none animate-pulse">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-200 mt-4">Page Not Found</h2>
        <p className="text-slate-400 text-sm mt-3 mb-8 leading-relaxed">
          The page you are looking for does not exist, has been removed, or is offline for this phase of testing.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 w-full rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.01]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
