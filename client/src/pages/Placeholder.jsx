import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Placeholder = ({ title }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <Navbar />
        <main className="p-6 md:p-8 flex-grow">
          <div className="mb-8 select-none">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-slate-400 mt-2">This module is scheduled for implementation in Phase 2.</p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800/80 max-w-2xl mx-auto my-12">
            <div className="inline-flex bg-purple-500/10 p-4 rounded-full text-purple-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Module Offline (Phase 1)</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              The {title.toLowerCase()} feature is fully mapped in the backend (with schemas and models built). 
              The user interface forms and transaction handlers will be implemented in the next phase.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Placeholder;
