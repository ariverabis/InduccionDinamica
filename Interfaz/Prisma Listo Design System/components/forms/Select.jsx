import React from 'react';

export function Select({ label, options = [], value, onChange }) {
  return React.createElement('label', { style: { display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)' } },
    label && React.createElement('span', { style: { fontSize:'var(--fs-body)', fontWeight: 600 } }, label),
    React.createElement('select', {
      value, onChange: e => onChange && onChange(e.target.value),
      style: {
        fontFamily: 'var(--font-body)', fontSize:'var(--fs-body)', padding: '10px 12px',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-strong)',
        background: 'var(--white)', color: 'var(--color-text-primary)',
      }
    }, options.map(o => React.createElement('option', { key: o, value: o }, o)))
  );
}
