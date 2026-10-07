import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AddTransactionModal from '../components/AddTransactionModal';

const titlesMap = {
  '/dashboard': { title: 'Financial Dashboard', subtitle: 'Real-time overview of your income, expenses, and goals' },
  '/transactions': { title: 'Transactions Manager', subtitle: 'Track, categorize, and filter your financial records' },
  '/budgets': { title: 'Budget Management', subtitle: 'Set monthly category limits and monitor spending thresholds' },
  '/savings': { title: 'Savings Goals', subtitle: 'Track targets, deadlines, and calculate required monthly deposits' },
  '/analytics': { title: 'Financial Analytics', subtitle: 'In-depth visual insights into your cashflow and category distributions' },
  '/prediction': { title: 'Expense Forecast', subtitle: 'A smart estimate of what you might spend next month, based on your spending history.' },
  '/profile': { title: 'Profile & Settings', subtitle: 'Manage your personal baseline settings and preferences' },
};

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(63, 191, 159, 0.2)',
            borderTopColor: 'var(--accent-primary)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.9rem' }}>Loading FinSight...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentMeta = titlesMap[location.pathname] || {
    title: 'FinSight',
    subtitle: 'Smart Expense & Financial Planning',
  };

  const handleTransactionAdded = () => {
    // Increment trigger to notify active child views
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar
          pageTitle={currentMeta.title}
          pageSubtitle={currentMeta.subtitle}
          onToggleMobile={() => setMobileOpen((prev) => !prev)}
          onOpenAddTransaction={() => setAddModalOpen(true)}
        />

        <main style={{ flex: 1, padding: '1.75rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet context={{ refreshTrigger, onOpenAddTransaction: () => setAddModalOpen(true) }} />
        </main>
      </div>

      <AddTransactionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  );
};

export default DashboardLayout;
