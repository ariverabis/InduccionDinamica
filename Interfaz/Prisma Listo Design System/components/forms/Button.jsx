import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', onClick, disabled }) {
  const isDisabled = disabled || variant === 'disabled';
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: size === 'sm' ? 'var(--fs-caption)' : 'var(--fs-body)',
    padding: size === 'sm' ? '8px 16px' : '10px 20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: isDisabled ? 'default' : 'pointer',
    transition: 'background var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast), border-color var(--transition-fast)',
  };
  const variants = {
    primary: { background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' },
    secondary: { background: 'var(--color-btn-secondary-bg)', color: 'var(--color-text-primary)', borderColor: 'var(--color-btn-secondary-border)' },
    ghost: { background: 'transparent', color: 'var(--color-text-primary)' },
    disabled: { background: 'var(--color-btn-disabled-bg)', color: 'var(--color-btn-disabled-text)' },
  };
  const style = { ...base, ...variants[isDisabled ? 'disabled' : variant] };
  const [state, setState] = React.useState('idle');
  if (!isDisabled) {
    if (state === 'hover') {
      if (variant === 'primary') { style.background = 'var(--color-btn-primary-hover)'; style.color = 'var(--color-btn-primary-hover-text)'; }
      else if (variant === 'secondary') { style.borderColor = 'var(--color-btn-secondary-hover-border)'; }
      else if (variant === 'ghost') { style.color = 'var(--color-text-secondary)'; }
    }
    if (state === 'press') { style.opacity = 0.7; }
  }
  return React.createElement('button', {
    style,
    disabled: isDisabled,
    onClick,
    onMouseEnter: () => setState('hover'),
    onMouseLeave: () => setState('idle'),
    onMouseDown: () => setState('press'),
    onMouseUp: () => setState('hover'),
  }, children);
}
