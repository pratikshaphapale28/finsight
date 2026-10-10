import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Navbar = ({ pageTitle, pageSubtitle, onToggleMobile, onOpenAddTransaction }) => {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const showAddTransaction = ['/dashboard', '/transactions', '/budgets', '/import'].includes(currentPath) && Boolean(onOpenAddTransaction);

  return (
    <header
      style={{
        height: '70px',
        padding: '0 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(7, 18, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobile}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            color: 'var(--text-primary)',
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            {pageTitle || 'FinSight'}
          </h1>
          {pageSubtitle && (
            <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>

        {showAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Transaction</span>
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-menu-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .hide-on-mobile {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
