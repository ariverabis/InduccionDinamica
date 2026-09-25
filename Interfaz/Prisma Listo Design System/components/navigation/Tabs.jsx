import React from 'react';

export function Tabs({ tabs = [], active, onChange }) {
  return React.createElement('div', { style: { display: 'flex', gap: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', fontFamily: 'var(--font-body)' } },
    tabs.map(t => React.createElement('div', {
      key: t,
      onClick: () => onChange && onChange(t),
      style: {
        padding: '10px 2px', cursor: 'pointer', fontSize:'var(--fs-body)',
        fontWeight: t === active ? 600 : 400,
        color: t === active ? 'var(--black)' : 'var(--color-text-secondary)',
        borderBottom: t === active ? '2px solid var(--black)' : '2px solid transparent',
        transition: 'color var(--transition-fast), border-color var(--transition-fast)'
      }
    }, t))
  );
}
