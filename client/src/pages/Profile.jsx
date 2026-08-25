import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            User Profile
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Review your operator details and security settings.</p>
        </div>

        <div className="max-w-xl">
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 font-extrabold text-2xl border border-primary-200 uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-650 border border-primary-100 uppercase tracking-wider mt-1">
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Email Address</span>
                <span className="text-slate-800 font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Joined Date</span>
                <span className="text-slate-805 font-semibold font-mono">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'August 2026'}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-400 font-medium">Workspace permissions</span>
                <span className="text-emerald-600 font-bold uppercase tracking-wider text-[11px] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Profile;
