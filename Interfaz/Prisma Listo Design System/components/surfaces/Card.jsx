import React from 'react';

export function Card({ title, children }) {
  return React.createElement('div', {
    style: {
      background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', padding: 'var(--space-5)',
      fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)'
    }
  },
    title && React.createElement('div', { style: { fontSize:'var(--fs-body-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' } }, title),
    children
  );
}
