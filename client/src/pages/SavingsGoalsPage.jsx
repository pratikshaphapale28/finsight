import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Target,
  PiggyBank,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const SavingsGoalsPage = () => {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // Deposit Modal
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/savings');
      if (res.data.success) {
        setGoals(res.data.goals);
        setSummary(res.data.summary);
      }
    } catch (err) {
      toast.error('Failed to load savings targets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    // Default deadline: 6 months ahead
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setDeadline(d.toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleOpenEdit = (g) => {
    setIsEditing(true);
    setEditingId(g._id);
    setTitle(g.title);
    setTargetAmount(g.targetAmount);
    setCurrentAmount(g.currentAmount);
    setDeadline(new Date(g.deadline).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || Number(targetAmount) <= 0 || !deadline) {
      toast.error('Please fill in title, positive target amount, and target deadline.');
      return;
    }

    try {
      if (isEditing && editingId) {
        const res = await api.put(`/savings/${editingId}`, {
          title,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount) || 0,
          deadline,
        });
        if (res.data.success) {
          toast.success('Savings target updated successfully.');
        }
      } else {
        const res = await api.post('/savings', {
          title,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount) || 0,
          deadline,
        });
        if (res.data.success) {
          toast.success('Savings target created successfully!');
        }
      }

      setModalOpen(false);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goal');
    }
  };

  // Quick Deposit Handler
  const handleOpenDeposit = (g) => {
    setDepositGoal(g);
    setDepositAmount('');
    setDepositModalOpen(true);
  };

  const handleSaveDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount.');
      return;
    }

    try {
      const res = await api.patch(`/savings/${depositGoal._id}/deposit`, {
        amount: Number(depositAmount),
      });
      if (res.data.success) {
        toast.success(`Deposited ${formatCurrency(depositAmount)} to "${depositGoal.title}"!`);
        setDepositModalOpen(false);
        fetchGoals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    }
  };

  // Delete Handler
  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await api.delete(`/savings/${deletingId}`);
      if (res.data.success) {
        toast.success('Goal removed.');
        setDeleteModalOpen(false);
        fetchGoals();
      }
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div>
          <h2 className="heading-md">Savings Goals</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Plan major milestones, deposit savings, and track automatic monthly contribution targets
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={16} /> Create Savings Goal
        </button>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid-4">
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Target</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
              {formatCurrency(summary.totalTarget)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {summary.totalGoals} Total Goal{summary.totalGoals !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Saved</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
              {formatCurrency(summary.totalSaved)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {summary.overallProgress}% achieved
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining to Save</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.25rem' }}>
              {formatCurrency(summary.totalRemaining)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Amount left across all goals
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed Goals</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>
              {summary.completedGoals} / {summary.totalGoals}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Goals fully funded
            </span>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your savings targets...
        </div>
      ) : goals.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <PiggyBank size={36} color="var(--accent-primary)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 className="heading-md" style={{ color: '#fff' }}>No Savings Goals Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Set targets for an emergency fund, travel, or major purchases to stay motivated.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={15} /> Set Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {goals.map((g) => (
            <div
              key={g._id}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                borderLeft: g.isCompleted ? '4px solid #10b981' : '4px solid var(--accent-primary)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                      {g.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <Calendar size={13} />
                      <span>
                        Target: {new Date(g.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="btn-icon"
                      title="Edit target"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(g._id)}
                      className="btn-icon"
                      title="Delete goal"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                {g.isCompleted ? (
                  <div
                    style={{
                      background: 'var(--success-bg)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#34d399',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      marginBottom: '0.85rem',
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Goal 100% Achieved! 🎉</span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'rgba(63, 191, 159, 0.08)',
                      border: '1px solid rgba(63, 191, 159, 0.25)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.785rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Need ~<strong style={{ color: 'var(--accent-primary)' }}>{formatCurrency(g.monthlySavingRequired)}/mo</strong>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {g.monthsLeft} mo{g.monthsLeft !== 1 ? 's' : ''} left
                    </span>
                  </div>
                )}

                {/* Progress Bar */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Savings Progress</span>
                    <span style={{ fontWeight: 700, color: g.isCompleted ? '#34d399' : 'var(--text-primary)' }}>
                      {g.progressPercentage}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${g.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Target vs Saved Numbers */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Saved So Far:</span>
                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {formatCurrency(g.currentAmount)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Target Amount:</span>
                    <div style={{ fontWeight: 700, color: '#fff' }}>
                      {formatCurrency(g.targetAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Action */}
              <button
                onClick={() => handleOpenDeposit(g)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', border: '1px solid rgba(63, 191, 159, 0.3)' }}
              >
                <ArrowUpRight size={14} color="var(--accent-primary)" />
                <span>+ Deposit / Add Savings</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Savings Target' : 'Create New Savings Target'}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="goal-form" className="btn btn-primary btn-sm">
              {isEditing ? 'Update Target' : 'Create Goal'}
            </button>
          </>
        }
      >
        <form id="goal-form" onSubmit={handleSaveGoal}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. MacBook Pro M3, Emergency Safety Net"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Target Amount (₹) *</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                placeholder="e.g. 80000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Already Saved (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="e.g. 20000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Deadline *</label>
            <input
              type="date"
              required
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              FinSight uses your deadline to calculate your required monthly saving.
            </span>
          </div>
        </form>
      </Modal>

      {/* Quick Deposit Modal */}
      <Modal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        title={`Deposit into "${depositGoal?.title}"`}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDepositModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="deposit-form" className="btn btn-primary btn-sm">
              Confirm Deposit
            </button>
          </>
        }
      >
        <form id="deposit-form" onSubmit={handleSaveDeposit}>
          <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
            <div>Target: <strong>{formatCurrency(depositGoal?.targetAmount)}</strong></div>
            <div>Current Saved: <strong>{formatCurrency(depositGoal?.currentAmount)}</strong></div>
            <div>Remaining: <strong style={{ color: 'var(--accent-primary)' }}>{formatCurrency(depositGoal?.remainingAmount)}</strong></div>
          </div>

          <div className="form-group">
            <label className="form-label">Deposit Amount (₹) *</label>
            <input
              type="number"
              min="1"
              required
              className="form-input"
              placeholder="e.g. 5000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              style={{ fontSize: '1.1rem', fontWeight: 600 }}
            />
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[1000, 2500, 5000, 10000].map((preset) => (
              <button
                key={preset}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDepositAmount(preset.toString())}
                style={{ fontSize: '0.75rem' }}
              >
                +{formatCurrency(preset)}
              </button>
            ))}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Savings Target"
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmDelete}>
              Delete Goal
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Are you sure you want to remove this savings target?
        </p>
      </Modal>
    </div>
  );
};

export default SavingsGoalsPage;
