import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Plus,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const CATEGORY_COLORS = [
  '#3fbf9f',
  '#e6a73c',
  '#38bdf8',
  '#f43f5e',
  '#a855f7',
  '#10b981',
  '#f97316',
  '#6366f1',
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const DashboardPage = () => {
  const { refreshTrigger, onOpenAddTransaction } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryRes, predRes] = await Promise.allSettled([
        api.get('/dashboard/summary'),
        api.post('/prediction'),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value.data.success) {
        setData(summaryRes.value.data);
      } else {
        throw new Error('Failed to load dashboard summary');
      }

      if (predRes.status === 'fulfilled') {
        setPrediction(predRes.value.data);
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ height: '120px', opacity: 0.5 }} />
          ))}
        </div>
        <div className="grid-2">
          <div className="card" style={{ height: '300px', opacity: 0.5 }} />
          <div className="card" style={{ height: '300px', opacity: 0.5 }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <AlertTriangle size={36} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h3 className="heading-md">{error || 'Data Unavailable'}</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          An error occurred while fetching your financial data.
        </p>
        <button onClick={fetchDashboardData} className="btn btn-primary btn-sm">
          Retry
        </button>
      </div>
    );
  }

  const { summaryCards, categoryData, monthlyTrends, budgetOverview, activeSavingsGoals, recentTransactions } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Overspending Banner Alert (if any budget exceeded) */}
      {budgetOverview?.overspentCount > 0 && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="var(--danger)" />
            <div>
              <div style={{ fontWeight: 700, color: '#fb7185', fontSize: '0.9rem' }}>
                Budget Warning: {budgetOverview.overspentCount} categor{budgetOverview.overspentCount > 1 ? 'ies have' : 'y has'} exceeded spending limit!
              </div>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Review your category budgets to maintain financial discipline.
              </div>
            </div>
          </div>
          <Link to="/budgets" className="btn btn-danger btn-sm">
            View Budgets <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* 1. Summary Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(summaryCards.totalIncome)}
          subtitle={`This Month: ${formatCurrency(summaryCards.thisMonthIncome)}`}
          icon={TrendingUp}
          color="emerald"
          badge="Inflow"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summaryCards.totalExpenses)}
          subtitle={`This Month: ${formatCurrency(summaryCards.thisMonthExpenses)}`}
          icon={TrendingDown}
          color="rose"
          badge="Outflow"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(summaryCards.balance)}
          subtitle={summaryCards.balance >= 0 ? 'Positive Cash Flow' : 'Deficit / Needs Review'}
          icon={Wallet}
          color={summaryCards.balance >= 0 ? 'teal' : 'amber'}
          badge={summaryCards.balance >= 0 ? 'Healthy' : 'Caution'}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(summaryCards.totalSavings)}
          subtitle={`${activeSavingsGoals.length} Active Goal${activeSavingsGoals.length !== 1 ? 's' : ''}`}
          icon={PiggyBank}
          color="amber"
          badge="Allocated"
        />
      </div>

      {/* 2. ML Prediction Highlight Bar */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 107, 92, 0.25) 0%, rgba(12, 28, 24, 0.9) 100%)',
          border: '1px solid var(--border-highlight)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(63, 191, 159, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Next Month Forecast
              </span>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
              {prediction?.status === 'success' && prediction?.predictedExpense ? (
                <>
                  Estimated Next Month Expense:{' '}
                  <span style={{ color: 'var(--accent-primary)' }}>
                    {formatCurrency(prediction.predictedExpense)}
                  </span>
                </>
              ) : (
                'Pending Sufficient Historical Spending'
              )}
            </div>
            <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
              {prediction?.message || 'FinSight forecasts your next month expenses based on your spending history.'}
            </div>
          </div>
        </div>

        <Link to="/prediction" className="btn btn-secondary btn-sm" style={{ border: '1px solid var(--border-highlight)' }}>
          View Forecast Details <ArrowRight size={14} />
        </Link>
      </div>

      {/* 3. Core Charts Grid */}
      <div className="grid-2">
        {/* Income vs Expense Monthly Comparison */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="heading-md">Cash Flow Comparison</h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Monthly Income vs Outflow
              </p>
            </div>
            <span className="badge badge-info">Last 6 Months</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: '#0d221d',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                  formatter={(val) => [formatCurrency(val), '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Expense Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="heading-md">Spending by Category</h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Current month expense allocation
              </p>
            </div>
            <span className="badge badge-warning">{categoryData.length} Categories</span>
          </div>

          {categoryData.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem' }}>No expenses recorded this month yet.</p>
              <button onClick={onOpenAddTransaction} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                <Plus size={14} /> Add First Expense
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', height: '260px', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0d221d',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    }}
                    formatter={(val) => [formatCurrency(val), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Mini Legend List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', overflowY: 'auto', maxHeight: '240px', paddingRight: '0.5rem' }}>
                {categoryData.map((item, index) => (
                  <div key={item.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.785rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.category}
                      </span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Budgets & Savings Goals Split */}
      <div className="grid-2">
        {/* Monthly Budget Usage Status */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="heading-md">Current Month Budgets</h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Total Budget: {formatCurrency(budgetOverview?.totalBudget)} • Utilization: {budgetOverview?.usagePercentage}%
              </p>
            </div>
            <Link to="/budgets" className="btn btn-secondary btn-sm">
              Manage Budgets
            </Link>
          </div>

          {budgetOverview?.budgets?.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem' }}>No category budgets configured for this month.</p>
              <Link to="/budgets" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Set Category Budget
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {budgetOverview.budgets.slice(0, 4).map((b) => (
                <div key={b.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{b.category}</span>
                      {b.isOverspent && (
                        <span className="badge badge-expense" style={{ fontSize: '0.7rem' }}>
                          Exceeded by {formatCurrency(b.spent - b.budget)}
                        </span>
                      )}
                    </div>
                    <span style={{ color: b.isOverspent ? '#fb7185' : 'var(--text-secondary)' }}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.budget)} ({b.percent}%)
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${b.isOverspent ? 'danger' : b.percent > 85 ? 'warning' : ''}`}
                      style={{ width: `${Math.min(100, b.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Savings Goals */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="heading-md">Savings Targets</h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Target-based financial planning
              </p>
            </div>
            <Link to="/savings" className="btn btn-secondary btn-sm">
              All Goals
            </Link>
          </div>

          {activeSavingsGoals.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem' }}>No active savings goals found.</p>
              <Link to="/savings" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Create Savings Goal
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeSavingsGoals.map((g) => (
                <div key={g._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{g.title}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {g.percent}%
                    </span>
                  </div>

                  <div className="progress-bar-track" style={{ marginBottom: '0.4rem' }}>
                    <div className="progress-bar-fill" style={{ width: `${g.percent}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Saved: {formatCurrency(g.currentAmount)}</span>
                    <span>Target: {formatCurrency(g.targetAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Transactions Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="heading-md">Recent Transactions</h3>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
              Latest financial activity recorded
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={onOpenAddTransaction} className="btn btn-primary btn-sm">
              <Plus size={15} /> Add Transaction
            </button>
            <Link to="/transactions" className="btn btn-secondary btn-sm">
              View All Transactions <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem' }}>No transactions recorded yet.</p>
            <button onClick={onOpenAddTransaction} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
              <Plus size={15} /> Record Your First Transaction
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Payment Method</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {tx.description || tx.category}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${tx.type}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: tx.type === 'income' ? '#34d399' : '#fb7185',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
