import React from 'react';

export function SegmentedControl({ label, options = [], value, onChange }) {
  const [hover, setHover] = React.useState(null);
  const norm = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)' } },
    label && React.createElement('span', { style: { fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--color-text-primary)' } }, label),
    React.createElement('div', {
      role: 'radiogroup',
      style: { display: 'inline-flex', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-md)', overflow: 'hidden', alignSelf: 'flex-start' },
    }, norm.map((o, i) => {
      const active = o.value === value;
      return React.createElement('button', {
        key: o.value,
        role: 'radio',
        'aria-checked': active,
        onClick: () => onChange && onChange(o.value),
        onMouseEnter: () => setHover(o.value),
        onMouseLeave: () => setHover(null),
        style: {
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body)',
          fontWeight: active ? 600 : 400,
          border: 'none',
          borderLeft: i === 0 ? 'none' : '1px solid var(--color-border-strong)',
          background: active ? 'var(--gray-300)' : hover === o.value ? 'var(--gray-50)' : 'var(--white)',
          color: 'var(--color-text-primary)',
          transition: 'background var(--transition-fast)',
        },
      }, o.icon, o.label);
    }))
  );
}
