import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { ToastContext } from '../context/ToastContext';
import Layout from '../components/Layout';

const ActivityHistory = () => {
  const { showToast } = useContext(ToastContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities');
      setActivities(res.data);
    } catch (err) {
      showToast('Failed to load activity logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Helper to group activities by day (Today, Yesterday, Older Date)
  const groupActivities = () => {
    const groups = {};
    activities.forEach((act) => {
      const date = new Date(act.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey = date.toLocaleDateString(undefined, { dateStyle: 'long' });
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(act);
    });
    return groups;
  };

  const activityGroups = groupActivities();

  // Badge colors helper
  const getActionBadge = (action) => {
    switch (action) {
      case 'STOCK_IN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'STOCK_OUT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PRODUCT_CREATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PRODUCT_UPDATED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PRODUCT_DELETED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper text builder
  const getActivityDescription = (act) => {
    const qtyText = act.quantity > 0 ? ` ${act.quantity} units of ` : ' ';
    switch (act.action) {
      case 'STOCK_IN':
        return (
          <span>
            added <strong className="text-slate-800 font-bold">{act.quantity} units</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{act.productName}</strong>.{' '}
            {act.reason && <span className="text-slate-400 text-xs italic">({act.reason})</span>}
          </span>
        );
      case 'STOCK_OUT':
        return (
          <span>
            removed <strong className="text-slate-800 font-bold">{act.quantity} units</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{act.productName}</strong>.{' '}
            {act.reason && <span className="text-slate-400 text-xs italic">({act.reason})</span>}
          </span>
        );
      case 'PRODUCT_CREATED':
        return (
          <span>
            created product profile for <strong className="text-slate-905 font-semibold">{act.productName}</strong>.
          </span>
        );
      case 'PRODUCT_UPDATED':
        return (
          <span>
            updated details for product <strong className="text-slate-905 font-semibold">{act.productName}</strong>.
          </span>
        );
      case 'PRODUCT_DELETED':
        return (
          <span>
            deleted product profile <strong className="text-slate-905 font-semibold">{act.productName}</strong> permanently.
          </span>
        );
      default:
        return <span>modified product details.</span>;
    }
  };

  return (
    <Layout>
      <main className="p-4 sm:p-6 lg:p-8 grow animate-slide-up select-none">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Activity History
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Audit log of all products creation, editing, and stock movements.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto my-12 animate-slide-up">
            <div className="inline-flex bg-slate-50 p-4 rounded-full text-slate-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-805 mb-2">No Activities Yet</h3>
            <p className="text-slate-500 text-xs sm:text-sm">Operations will show up here once recorded.</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl">
            {Object.keys(activityGroups).map((day) => (
              <div key={day} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 select-none">{day}</h3>
                
                <div className="glass-card divide-y divide-slate-100 overflow-hidden">
                  {activityGroups[day].map((act) => (
                    <div key={act._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/20 transition-colors animate-slide-up">
                      <div className="flex items-start gap-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 select-none ${getActionBadge(act.action)}`}>
                          {act.action.replace('_', ' ')}
                        </span>
                        <div className="text-xs sm:text-sm text-slate-600">
                          <span className="font-bold text-slate-800 mr-1.5">{act.userName}</span>
                          {getActivityDescription(act)}
                        </div>
                      </div>
                      <span className="text-slate-400 text-xs font-mono font-medium self-end sm:self-center select-none">
                        {new Date(act.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default ActivityHistory;
