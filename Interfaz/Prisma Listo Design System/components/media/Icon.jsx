import React from 'react';

// Official Prisma icon set — 301 glyphs in assets/icons/icons.svg.
// Each icon is a <symbol id='icon-NN'> inside the sprite. Use <Icon name={N} />.
export function Icon({ name, size = 20, color }) {
  const n = String(name).padStart(2, '0');
  return React.createElement('svg', {
    width: size, height: size,
    viewBox: '0 0 78 78',
    style: { display: 'inline-block', flexShrink: 0, color: color || 'inherit' },
    'aria-hidden': 'true'
  },
    React.createElement('use', { href: `../../assets/icons/icons.svg#icon-${n}` })
  );
}
