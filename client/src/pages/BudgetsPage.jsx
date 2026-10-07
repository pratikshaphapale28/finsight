import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  PieChart,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

const expenseCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other',
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BudgetsPage = () => {
  const toast = useToast();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formCategory, setFormCategory] = useState('Food');
  const [formAmount, setFormAmount] = useState('');

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budgets', {
        params: { month: selectedMonth, year: selectedYear },
      });
      if (res.data.success) {
        setBudgets(res.data.budgets);
        setSummary(res.data.summary);
      }
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormCategory('Food');
    setFormAmount('');
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setIsEditing(true);
    setEditingId(b._id);
    setFormCategory(b.category);
    setFormAmount(b.amount);
    setModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      toast.error('Please enter a valid positive budget amount.');
      return;
    }

    try {
      if (isEditing && editingId) {
        const res = await api.put(`/budgets/${editingId}`, {
          category: formCategory,
          amount: Number(formAmount),
          month: selectedMonth,
          year: selectedYear,
        });
        if (res.data.success) {
          toast.success('Budget limit updated successfully.');
        }
      } else {
        const res = await api.post('/budgets', {
          category: formCategory,
          amount: Number(formAmount),
          month: selectedMonth,
          year: selectedYear,
        });
        if (res.data.success) {
          toast.success('Budget created successfully.');
        }
      }

      setModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await api.delete(`/budgets/${deletingId}`);
      if (res.data.success) {
        toast.success('Budget removed.');
        setDeleteModalOpen(false);
        fetchBudgets();
      }
    } catch (err) {
      toast.error('Failed to delete budget');
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
          <h2 className="heading-md">Category Budgets</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Set category spending limits and get alerts before you overspend.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Month Selector */}
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={16} /> Set Category Budget
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Selected Month */}
      {summary && (
        <div className="grid-4">
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Monthly Budget</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
              {formatCurrency(summary.totalBudget)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Across {budgets.length} configured categories
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Actual Spent</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: summary.overspentCount > 0 ? '#fb7185' : 'var(--accent-primary)', marginTop: '0.25rem' }}>
              {formatCurrency(summary.totalSpent)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              From recorded transactions
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Allowance</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: summary.totalRemaining >= 0 ? '#34d399' : '#fb7185', marginTop: '0.25rem' }}>
              {formatCurrency(summary.totalRemaining)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {summary.totalRemaining >= 0 ? 'Within budget limit' : 'Overall deficit'}
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overspending Alerts</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: summary.overspentCount > 0 ? '#fb7185' : '#34d399', marginTop: '0.25rem' }}>
              {summary.overspentCount} Alert{summary.overspentCount !== 1 ? 's' : ''}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {summary.overspentCount > 0 ? 'Requires attention' : 'All categories on track'}
            </span>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading budgets for {monthNames[selectedMonth - 1]} {selectedYear}...
        </div>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <PieChart size={36} color="var(--accent-primary)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 className="heading-md" style={{ color: '#fff' }}>No Budgets for {monthNames[selectedMonth - 1]} {selectedYear}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Set category limits to track where your money goes and get warned before overspending.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={15} /> Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {budgets.map((b) => (
            <div
              key={b._id}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                borderLeft: b.isOverspent ? '4px solid #f43f5e' : '4px solid var(--accent-primary)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                      {b.category}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {monthNames[b.month - 1]} {b.year}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="btn-icon"
                      title="Edit budget"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(b._id)}
                      className="btn-icon"
                      title="Delete budget"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Overspending Banner Badge */}
                {b.isOverspent ? (
                  <div
                    style={{
                      background: 'var(--danger-bg)',
                      border: '1px solid var(--danger-border)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#fb7185',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      marginBottom: '0.85rem',
                    }}
                  >
                    <AlertTriangle size={15} />
                    <span>Overspent by {formatCurrency(b.overspentAmount)}!</span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
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
                    <span>On Track ({formatCurrency(b.remaining)} left)</span>
                  </div>
                )}

                {/* Progress Bar */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Usage</span>
                    <span style={{ fontWeight: 700, color: b.isOverspent ? '#fb7185' : 'var(--text-primary)' }}>
                      {b.percentageUsed}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${b.isOverspent ? 'danger' : b.percentageUsed > 80 ? 'warning' : ''}`}
                      style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                    />
                  </div>
                </div>

                {/* Details Breakdown */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Budget Limit:</span>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{formatCurrency(b.amount)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Actual Spent:</span>
                    <div style={{ fontWeight: 700, color: b.isOverspent ? '#fb7185' : 'var(--text-primary)' }}>
                      {formatCurrency(b.spent)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Category Budget' : 'Set Category Budget'}
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="budget-form" className="btn btn-primary btn-sm">
              {isEditing ? 'Update Budget' : 'Save Budget'}
            </button>
          </>
        }
      >
        <form id="budget-form" onSubmit={handleSaveBudget}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              disabled={isEditing} // keep category fixed on edit or update
            >
              {expenseCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit (₹) *</label>
            <input
              type="number"
              step="1"
              min="1"
              required
              className="form-input"
              placeholder="e.g. 6000"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
            />
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Applying to: <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong>. If a budget for this category already exists for this month, its limit will be updated.
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Budget"
        footer={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={confirmDelete}>
              Delete Budget
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Are you sure you want to remove this category budget? Your recorded transactions will remain safe.
        </p>
      </Modal>
    </div>
  );
};

export default BudgetsPage;
