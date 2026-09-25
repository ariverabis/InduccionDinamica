import React from 'react';

export function Textarea({ label, value, placeholder, rows = 3, disabled, onChange }) {
  const [focused, setFocused] = React.useState(false);
  return React.createElement('label', { style: { display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)' } },
    label && React.createElement('span', { style: { fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--color-text-primary)' } }, label),
    React.createElement('textarea', {
      value, placeholder, disabled, rows,
      onChange: e => onChange && onChange(e.target.value),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body-lg)',
        lineHeight: 'var(--lh-body)',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid ' + (focused ? 'var(--color-focus-ring)' : 'var(--color-border-strong)'),
        background: disabled ? 'var(--gray-50)' : 'var(--white)',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color var(--transition-fast)',
      },
    })
  );
}
