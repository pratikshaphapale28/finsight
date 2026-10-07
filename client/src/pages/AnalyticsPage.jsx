import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieIcon,
  Percent,
  Calendar,
  CreditCard,
  Target,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const CATEGORY_COLORS = [
  '#3fbf9f',
  '#e6a73c',
  '#38bdf8',
  '#f43f5e',
  '#a855f7',
  '#10b981',
  '#f97316',
  '#ec4899',
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('[Analytics] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No analytics data available. Please add transactions to view analytics.
      </div>
    );
  }

  const { metrics, categoryBreakdown, paymentMethods, monthlyTrends, savingsSummary } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header Metrics Row */}
      <div className="grid-4">
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Net Savings Ratio</span>
            <Percent size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.4rem' }}>
            {metrics.savingsRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            of total income retained
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avg Monthly Spending</span>
            <TrendingDown size={18} color="#fb7185" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '0.4rem' }}>
            {formatCurrency(metrics.averageMonthlyExpense)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            across {metrics.activeMonthsCount} active months
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Top Expense Category</span>
            <PieIcon size={18} color="#e6a73c" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e6a73c', marginTop: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {metrics.highestCategory}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {formatCurrency(metrics.highestCategoryAmount)} total spent
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Budget Adherence</span>
            <Target size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: metrics.budgetUtilization > 100 ? '#fb7185' : '#38bdf8', marginTop: '0.4rem' }}>
            {metrics.budgetUtilization}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            current month budget utilized
          </span>
        </div>
      </div>

      {/* 2. 12-Month Inflow vs Outflow Cashflow Trend */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="heading-md">12-Month Cashflow</h3>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
              Monthly comparison of income versus expenses
            </p>
          </div>
          <span className="badge badge-info">Cashflow Trend</span>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Income (Inflow)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense (Outflow)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Category Breakdown & Payment Methods Grid */}
      <div className="grid-2">
        {/* Category Expense Distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="heading-md">Spending by Category</h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                All-time expenses grouped by category
              </p>
            </div>
            <span className="badge badge-warning">{categoryBreakdown.length} Categories</span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No expense categories recorded yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '260px', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0d221d',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    }}
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', overflowY: 'auto', maxHeight: '240px', paddingRight: '0.5rem' }}>
                {categoryBreakdown.map((item, index) => (
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
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="heading-md">Payment Methods</h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Total spending by payment method
              </p>
            </div>
            <span className="badge badge-info">{paymentMethods.length} Methods</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentMethods}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="method" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    background: '#0d221d',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                  formatter={(val) => [formatCurrency(val), 'Volume']}
                />
                <Bar dataKey="amount" name="Volume" fill="#3fbf9f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Net Monthly Balance / Surplus Trend */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="heading-md">Net Monthly Savings</h3>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
              Net amount saved each month
            </p>
          </div>
        </div>

        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: '#0d221d',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}
                formatter={(val) => [formatCurrency(val), 'Net Surplus']}
              />
              <Line
                type="monotone"
                dataKey="net"
                name="Net Surplus"
                stroke="#3fbf9f"
                strokeWidth={3}
                dot={{ fill: '#3fbf9f', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
