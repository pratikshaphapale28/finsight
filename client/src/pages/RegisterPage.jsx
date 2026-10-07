import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Wallet, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, monthlyIncome);
      if (res.success) {
        toast.success('Account created successfully! Welcome to FinSight.');
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.25rem',
          background: 'rgba(12, 28, 24, 0.88)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'var(--accent-primary)',
              color: '#06241e',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 15px var(--accent-glow)',
            }}
          >
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Create Your Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Start tracking, budgeting, and forecasting your finances
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: '#fb7185',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password * (min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Estimated Monthly Income (₹, Optional)</label>
            <input
              type="number"
              min="0"
              className="form-input"
              placeholder="e.g. 50000"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Used to calculate your monthly savings capacity.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? (
              'Creating Account...'
            ) : (
              <>
                <UserPlus size={18} /> Register & Continue
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
