import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden relative">
      {/* Sidebar Menu Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="grow flex flex-col min-h-screen overflow-y-auto relative">
        {/* Navbar Header with hamburger trigger */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Body */}
        {children}
      </div>
    </div>
  );
};

export default Layout;
