import React from 'react';

const colorThemes = {
  emerald: {
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  teal: {
    iconBg: 'rgba(63, 191, 159, 0.15)',
    iconColor: '#3fbf9f',
    border: 'rgba(63, 191, 159, 0.2)',
  },
  amber: {
    iconBg: 'rgba(230, 167, 60, 0.15)',
    iconColor: '#fbbf24',
    border: 'rgba(230, 167, 60, 0.2)',
  },
  rose: {
    iconBg: 'rgba(244, 63, 94, 0.15)',
    iconColor: '#fb7185',
    border: 'rgba(244, 63, 94, 0.2)',
  },
  blue: {
    iconBg: 'rgba(56, 189, 248, 0.15)',
    iconColor: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.2)',
  },
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'teal', badge }) => {
  const theme = colorThemes[color] || colorThemes.teal;

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {title}
        </span>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: theme.iconBg,
            color: theme.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${theme.border}`,
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            fontFeatureSettings: '"tnum"',
          }}
        >
          {value}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
          {badge && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                background: theme.iconBg,
                color: theme.iconColor,
                fontWeight: 600,
              }}
            >
              {badge}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
