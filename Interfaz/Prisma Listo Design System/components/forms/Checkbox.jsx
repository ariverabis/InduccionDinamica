import React from 'react';

export function Checkbox({ label, checked, onChange }) {
  return React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize:'var(--fs-body)', cursor: 'pointer', color: 'var(--color-text-primary)' } },
    React.createElement('span', {
      onClick: () => onChange && onChange(!checked),
      style: {
        width: 20, height: 20, borderRadius: 'var(--radius-pill)', border: `1px solid ${checked ? 'var(--gray-400)' : 'var(--color-border-strong)'}`,
        background: checked ? 'var(--gray-400)' : 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background var(--transition-fast), border-color var(--transition-fast)'
      }
    }, checked && React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none' },
      React.createElement('path', { d: 'M2 6l3 3 5-6', stroke: 'var(--white)', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
    label
  );
}
