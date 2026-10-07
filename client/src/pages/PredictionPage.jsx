import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const PredictionPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrediction = async () => {
    try {
      setRefreshing(true);
      const res = await api.post('/prediction');
      setData(res.data);
    } catch (err) {
      console.error('[PredictionPage] Request failed:', err);
      setData({
        status: 'service_unavailable',
        predictedExpense: null,
        message: 'Could not connect to the forecast service. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Brain size={36} color="var(--accent-primary)" style={{ margin: '0 auto 1rem', animation: 'pulse 1.5s infinite' }} />
        <p>Calculating your spending forecast...</p>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }`}</style>
      </div>
    );
  }

  const isInsufficient = data?.status === 'insufficient_data';
  const isAvailable = data?.status === 'success' && data?.predictedExpense != null;
  const isServiceDown = data?.status === 'service_unavailable';

  // Build chart timeline combining historical data points + forecasted point
  const history = data?.details?.monthly_history || [];
  const chartData = history.map((item, idx) => ({
    label: item.label,
    actual: item.amount,
    forecast: null,
  }));

  if (isAvailable && chartData.length > 0) {
    // Add the next month predicted point
    chartData.push({
      label: 'Next Month (Est.)',
      actual: null,
      forecast: data.predictedExpense,
      isPrediction: true,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 107, 92, 0.4) 0%, rgba(11, 61, 61, 0.25) 100%)',
          border: '1px solid var(--border-highlight)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(63, 191, 159, 0.18)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px var(--accent-glow)',
            }}
          >
            <Brain size={26} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="heading-md">Your Expense Forecast</h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              A smart estimate of what you might spend next month, based on your spending history.
            </p>
          </div>
        </div>

        <button
          onClick={fetchPrediction}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          style={{ border: '1px solid var(--border-highlight)' }}
        >
          <Sparkles size={14} />
          <span>{refreshing ? 'Updating...' : 'Refresh Forecast'}</span>
        </button>
      </div>

      {/* 2. Insufficient Data State Banner */}
      {isInsufficient && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid #e6a73c',
            background: 'rgba(230, 167, 60, 0.08)',
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <AlertCircle size={28} color="#e6a73c" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fbbf24' }}>
                Insufficient Data for Reliable Prediction
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.6 }}>
                {data.message}
              </p>

              {/* Progress towards 3 months */}
              <div style={{ marginTop: '1.25rem', maxWidth: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '0.35rem' }}>
                  <span>Historical Data Requirement</span>
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                    {data.historicalMonthsCount || 0} of {data.requiredMonths || 3} Months Recorded
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill warning"
                    style={{ width: `${Math.min(100, ((data.historicalMonthsCount || 0) / 3) * 100)}%` }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                }}
              >
                💡 <strong>Why does FinSight require 3 months?</strong> We need at least 3 months of spending history to accurately understand your habits and provide a reliable projection. As you record transactions, your forecast will appear automatically.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2b. Service Unavailable Banner */}
      {isServiceDown && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid #f43f5e',
            background: 'var(--danger-bg)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertCircle size={24} color="#f43f5e" />
            <div>
              <h4 style={{ fontWeight: 700, color: '#fb7185' }}>Forecast Service Unavailable</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                {data.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Successful Prediction View */}
      {isAvailable && (
        <>
          {/* Hero Forecast Result Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Next Month Expenditure Forecast
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: '0.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                }}
              >
                {formatCurrency(data.predictedExpense)}
              </span>
              {data.trend === 'upward' && (
                <TrendingUp size={28} color="#f43f5e" strokeWidth={2.5} />
              )}
              {data.trend === 'downward' && (
                <TrendingDown size={28} color="#3fbf9f" strokeWidth={2.5} />
              )}
              {data.trend === 'stable' && (
                <Minus size={28} color="#94a3b8" strokeWidth={2.5} />
              )}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Based on your last {data.historicalMonthsCount} months of spending.
            </p>
          </div>

          {/* Historical Trend vs Next Month Forecast Chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 className="heading-md">Historical Spending vs Next-Month Forecast</h3>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                  Your monthly spending trend and upcoming forecast
                </p>
              </div>
              <span className="badge badge-info">Monthly Trend</span>
            </div>

            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 25, left: -10, bottom: 0 }}>
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
                    formatter={(val, name) => [
                      formatCurrency(val),
                      name === 'actual' ? 'Actual Expense' : 'Forecasted Expense',
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual Expense"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ fill: '#38bdf8', r: 5 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Forecasted Expense"
                    stroke="#3fbf9f"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#3fbf9f', r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Disclaimer Banner */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <Info size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Disclaimer:</strong> {data?.disclaimer || 'FinSight forecasts are estimates based on your past spending patterns and do not constitute guaranteed financial advice.'}
        </span>
      </div>
    </div>
  );
};

export default PredictionPage;
