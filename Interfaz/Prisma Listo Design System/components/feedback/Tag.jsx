import React from 'react';

export function Tag({ children }) {
  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border-strong)', fontFamily: 'var(--font-body)', fontSize:'var(--fs-caption)',
      color: 'var(--color-text-secondary)', background: 'var(--white)'
    }
  }, children);
}
