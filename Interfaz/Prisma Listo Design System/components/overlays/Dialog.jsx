import React from 'react';
import { Button } from '../forms/Button.jsx';

export function Dialog({ title, children, open = true, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onCancel, inline = false }) {
  if (!open) return null;
  const surface = React.createElement('div', {
    style: {
      width: '100%', maxWidth: 480, boxSizing: 'border-box',
      background: 'var(--white)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-dialog)',
      padding: 'var(--space-5)', fontFamily: 'var(--font-body)',
      color: 'var(--color-text-primary)', textAlign: 'left',
    },
  },
    title && React.createElement('div', {
      style: { fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, lineHeight: 'var(--lh-heading)', marginBottom: 'var(--space-3)' },
    }, title),
    React.createElement('div', {
      style: { fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-body)', color: 'var(--color-text-secondary)', textWrap: 'pretty' },
    }, children),
    React.createElement('div', {
      style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' },
    },
      cancelLabel && React.createElement(Button, { variant: 'secondary', onClick: onCancel, key: 'c' }, cancelLabel),
      confirmLabel && React.createElement(Button, { variant: 'primary', onClick: onConfirm, key: 'k' }, confirmLabel)
    )
  );
  return React.createElement('div', {
    style: {
      position: inline ? 'absolute' : 'fixed', inset: 0, zIndex: 40,
      background: 'var(--color-scrim)', display: 'grid', placeItems: 'center',
      padding: 'var(--space-5)', boxSizing: 'border-box',
    },
    onClick: onCancel,
  }, React.createElement('div', { onClick: e => e.stopPropagation() }, surface));
}
