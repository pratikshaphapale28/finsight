import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  User,
  Mail,
  IndianRupee,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  LogOut,
  Save,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome || 0);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        monthlyIncome: Number(monthlyIncome),
      };
      if (password) {
        if (password.length < 6) {
          toast.error('New password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        payload.password = password;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        toast.success('Profile details updated successfully.');
        updateUserProfile(res.data.user);
        setPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '850px' }}>
      {/* User Header Profile Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(14, 107, 92, 0.3) 0%, rgba(12, 28, 24, 0.8) 100%)',
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #0e6b5c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            {user?.name}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
            <Mail size={14} /> {user?.email}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.65rem' }}>
            <span className="badge badge-info">
              <Calendar size={13} /> Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
            <span className="badge badge-income">
              <ShieldCheck size={13} /> Verified Account
            </span>
          </div>
        </div>

        <button onClick={logout} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      {/* Edit Profile Form */}
      <div className="card">
        <h3 className="heading-md" style={{ marginBottom: '1.25rem' }}>
          Account Settings
        </h3>

        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read Only)</label>
            <input
              type="email"
              disabled
              className="form-input"
              value={user?.email || ''}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Email address cannot be changed to preserve transaction data ownership.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Baseline Monthly Income (₹)</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Used to calculate savings capacity and benchmark monthly budgets.
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Change Password (leave blank to keep current)</label>
            <input
              type="password"
              minLength={6}
              className="form-input"
              placeholder="Enter new password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
