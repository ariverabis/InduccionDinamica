import React from 'react';

export function NavItem({ icon, label, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  return React.createElement('div', {
    onClick, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
    style: {
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)', fontSize:'var(--fs-body)', cursor: 'pointer',
      background: active ? 'var(--gray-300)' : hover ? 'var(--gray-50)' : 'transparent',
      color: 'var(--color-text-primary)', fontWeight: active ? 600 : 400,
      transition: 'background var(--transition-fast)'
    }
  }, icon, React.createElement('span', null, label));
}
