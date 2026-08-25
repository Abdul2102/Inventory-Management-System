import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import StockTransactions from './pages/StockTransactions';
import StockAlerts from './pages/StockAlerts';
import ActivityHistory from './pages/ActivityHistory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Placeholder from './pages/Placeholder';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock"
              element={
                <ProtectedRoute>
                  <StockTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-alerts"
              element={
                <ProtectedRoute>
                  <StockAlerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity-history"
              element={
                <ProtectedRoute>
                  <ActivityHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Placeholder title="Users Management" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Placeholder title="System Reports" />
                </ProtectedRoute>
              }
            />

            {/* Default Route redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Wildcard 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
