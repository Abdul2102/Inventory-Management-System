import React from 'react';
import Layout from '../components/Layout';

const Settings = () => {
  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            System Settings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Configure workspace rules and system alerts levels.</p>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Stock Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-primary-500 focus:ring-primary-500/20 w-4 h-4 border-slate-300" />
                <div className="text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold text-slate-700 block">Low Stock email alerts</span>
                  <span>Receive email reports when items fall below reorder thresholds.</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-primary-500 focus:ring-primary-500/20 w-4 h-4 border-slate-300" />
                <div className="text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold text-slate-700 block">Out of Stock alerts</span>
                  <span>Alert managers instantly when stock reaches zero.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">System Parameters</h3>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="font-semibold text-slate-700 block">Default Minimum Stock</span>
                  <span>Used as default threshold when creating new items.</span>
                </div>
                <span className="font-bold text-slate-800 font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">10 units</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="font-semibold text-slate-700 block">Database Backup</span>
                  <span>Auto-backup collection states daily.</span>
                </div>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold uppercase select-none">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Settings;
