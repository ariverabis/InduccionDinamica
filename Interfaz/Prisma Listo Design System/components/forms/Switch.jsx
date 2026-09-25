import React from 'react';

export function Switch({ checked, onChange }) {
  return React.createElement('span', {
    onClick: () => onChange && onChange(!checked),
    style: {
      width: 40, height: 22, borderRadius: 'var(--radius-pill)', background: checked ? 'var(--gray-400)' : 'var(--gray-200)',
      display: 'inline-flex', alignItems: 'center', padding: 2, cursor: 'pointer', transition: 'background var(--transition-fast)', boxSizing: 'border-box'
    }
  }, React.createElement('span', {
    style: { width: 18, height: 18, borderRadius: 'var(--radius-pill)', background: 'var(--white)', transform: checked ? 'translateX(18px)' : 'translateX(0)', transition: 'transform var(--transition-fast)', boxShadow: 'var(--shadow-card)' }
  }));
}
