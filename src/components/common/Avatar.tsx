import React from 'react';

// Avatar sans photo : initiales sur pastille de couleur, dérivée du nom.
// Aucune image externe, donc aucune dépendance réseau ni photo de personne réelle.
const PALETTE = ['#4a6fa5', '#3f9a7a', '#c98d2e', '#7d7aa6', '#5b8fa8', '#94a3b8'];

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

const colorFor = (seed: string): string => {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return PALETTE[sum % PALETTE.length];
};

export const Avatar: React.FC<{ name?: string | null; size?: number; title?: string }> = ({
  name, size = 36, title,
}) => {
  const label = name?.trim() || 'Utilisateur';
  return (
    <span
      title={title ?? label}
      aria-label={label}
      style={{
        width: size, height: size, borderRadius: 'var(--radius-full)',
        background: colorFor(label), color: '#ffffff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(10, Math.round(size * 0.38)), fontWeight: 700,
        flexShrink: 0, userSelect: 'none',
      }}
    >
      {initials(label)}
    </span>
  );
};
