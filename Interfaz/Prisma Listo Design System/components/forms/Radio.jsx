import React from 'react';

export function Radio({ label, checked, onChange }) {
  return React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize:'var(--fs-body)', cursor: 'pointer', color: 'var(--color-text-primary)' } },
    React.createElement('span', {
      onClick: onChange,
      style: {
        width: 20, height: 20, borderRadius: 'var(--radius-pill)', border: `1px solid ${checked ? 'var(--gray-400)' : 'var(--color-border-strong)'}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color var(--transition-fast)'
      }
    }, checked && React.createElement('span', { style: { width: 10, height: 10, borderRadius: 'var(--radius-pill)', background: 'var(--gray-400)' } })),
    label
  );
}
