import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  PieChart,
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      const res = await login('demo@finsight.com', 'Password123');
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--accent-primary)',
              color: '#06241e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px var(--accent-glow)',
            }}
          >
            <Wallet size={22} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            FinSight
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Open Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <button
                onClick={handleDemoLogin}
                className="btn btn-secondary btn-sm"
                style={{ border: '1px solid rgba(63, 191, 159, 0.3)', color: 'var(--accent-primary)' }}
              >
                <Sparkles size={14} /> Demo Account
              </button>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '3.5rem 1.5rem 5rem',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '3rem',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              background: 'rgba(63, 191, 159, 0.1)',
              border: '1px solid rgba(63, 191, 159, 0.25)',
              color: 'var(--accent-primary)',
              fontSize: '0.825rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={15} />
            <span>Personal Finance & Planning Platform</span>
          </div>

          <h1
            style={{
              fontSize: '3.2rem',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
            }}
          >
            Manage Today.{' '}
            <span className="text-gradient">Understand Tomorrow.</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '540px',
              marginBottom: '2rem',
            }}
          >
            Track spending, analyze cashflows, forecast upcoming expenses, and plan your financial goals with confidence.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '0.95rem' }}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <button
              onClick={handleDemoLogin}
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}
            >
              Explore Live Demo
            </button>
          </div>
        </div>

        {/* Hero Interactive Mock Card */}
        <div style={{ position: 'relative' }}>
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 107, 92, 0.4) 0%, rgba(11, 61, 61, 0.3) 100%)',
              border: '1px solid rgba(63, 191, 159, 0.3)',
              padding: '1.75rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 35px rgba(63, 191, 159, 0.15)',
            }}
          >
            {/* Header Mini */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Net Portfolio Balance</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  ₹48,250.00
                </div>
              </div>
              <span className="badge badge-income">+14.2% Saved</span>
            </div>

            {/* Quick Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  padding: '0.9rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Monthly Income</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>₹65,000</div>
              </div>
              <div
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  padding: '0.9rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Monthly Outflow</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fb7185' }}>₹23,500</div>
              </div>
            </div>

            {/* Expense Forecast Snapshot */}
            <div
              style={{
                background: 'rgba(63, 191, 159, 0.08)',
                border: '1px dashed rgba(63, 191, 159, 0.35)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  <Sparkles size={15} /> Next Month's Estimate
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smart Forecast</span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                ₹12,350 <span style={{ fontSize: '0.785rem', fontWeight: 400, color: 'var(--text-secondary)' }}>est.</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Based on your recent spending history
              </div>
            </div>

            {/* Savings Goal Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600 }}>Emergency Fund Goal</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>₹48,000 / ₹1,00,000 (48%)</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '48%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Feature Cards */}
      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
            Comprehensive Feature Suite
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
            Everything You Need in One Unified Hub
          </h2>
        </div>

        <div className="grid-3">
          <div className="card card-interactive">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Wallet size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Income & Expense Tracking</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Log daily spending and income across UPI, cards, cash, or bank transfers. Keep every transaction organized in one central place.
            </p>
          </div>

          <div className="card card-interactive">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(230, 167, 60, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <PieChart size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Category Budgets & Alerts</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Set monthly spending limits for groceries, dining, and bills. Receive instant visual warnings before you overspend.
            </p>
          </div>

          <div className="card card-interactive">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Milestone Savings Goals</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Save toward emergency funds, gadgets, or travel. FinSight automatically calculates how much to put away each month.
            </p>
          </div>

          <div className="card card-interactive">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. Visual Spending Insights</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              See where your money goes with clear cashflow charts, category breakdowns, and monthly spending comparisons.
            </p>
          </div>

          <div className="card card-interactive">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(63, 191, 159, 0.15)', color: '#3fbf9f', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>5. AI Financial Assistant</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Ask natural-language questions about your spending, upcoming monthly estimates, and budget limits to plan ahead with confidence.
            </p>
          </div>

          <div className="card card-interactive">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>6. Private & Secure</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your financial data is encrypted and visible only to you. We protect your account with modern security safeguards.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 107, 92, 0.4) 0%, rgba(11, 61, 61, 0.5) 100%)',
            border: '1px solid rgba(63, 191, 159, 0.35)',
            padding: '3.5rem 2rem',
          }}
        >
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Take Control of Your Financial Future?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
            Join FinSight and build healthy financial habits — track spending, import statements, monitor monthly limits, and plan tomorrow with confidence.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
              Create Free Account <ArrowRight size={18} />
            </Link>
            <button onClick={handleDemoLogin} className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
              Launch Demo Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '2rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <p>© 2026 FinSight — Personal Financial Planning</p>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            padding-top: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
