import React from 'react';

export function Input({ label, placeholder, value, disabled, onChange }) {
  const [focused, setFocused] = React.useState(false);
  return React.createElement('label', { style: { display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)' } },
    label && React.createElement('span', { style: { fontSize:'var(--fs-body)', fontWeight: 600, color: 'var(--color-text-primary)' } }, label),
    React.createElement('input', {
      value, placeholder, disabled,
      onChange: e => onChange && onChange(e.target.value),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      style: {
        fontFamily: 'var(--font-body)',
        fontSize:'var(--fs-body)',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${focused ? 'var(--gray-400)' : 'var(--color-border-strong)'}`,
        outline: focused ? '2px solid var(--color-focus-ring)' : 'none',
        outlineOffset: 1,
        background: disabled ? 'var(--gray-50)' : 'var(--white)',
        color: 'var(--color-text-primary)',
        transition: 'border-color var(--transition-fast)',
      }
    })
  );
}
