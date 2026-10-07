import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
  TrendingUp,
  User,
  LogOut,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Savings Goals', path: '/savings', icon: Target },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Expense Forecast', path: '/prediction', icon: TrendingUp },
  { name: 'Profile & Settings', path: '/profile', icon: User },
];

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          background: 'rgba(8, 22, 19, 0.95)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          backdropFilter: 'blur(16px)',
          transition: 'transform 0.3s ease',
        }}
        className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--accent-primary)',
                color: '#06241e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--accent-glow)',
              }}
            >
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#fff' }}>
                FinSight
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Smart Financial Planning
              </div>
            </div>
          </div>

          <button
            className="mobile-close-btn"
            onClick={onCloseMobile}
            style={{
              display: 'none',
              color: 'var(--text-secondary)',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            Overview & Planning
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(63, 191, 159, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(63, 191, 159, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      color={isActive ? 'var(--accent-primary)' : 'currentColor'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Mini Profile & Logout */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #0e6b5c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || 'FinSight User'}
                </div>
                <div
                  style={{
                    fontSize: '0.725rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Add mobile CSS rules */}
      <style>{`
        @media (max-width: 900px) {
          .sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .sidebar-mobile-open {
            transform: translateX(0) !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
