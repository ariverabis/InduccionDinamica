import React from 'react';

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { background: 'var(--gray-300)', color: 'var(--black)' },
    dark: { background: 'var(--white)', color: 'var(--black)', border: '1px solid var(--black)' },
  };
  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-body)', fontSize:'var(--fs-caption)', fontWeight: 600, ...tones[tone]
    }
  }, children);
}
