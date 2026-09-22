import React from 'react';
import { Inbox } from 'lucide-react';

// État vide honnête : aucune donnée fictive n'est affichée tant qu'aucun appel réel
// n'a été transcrit. Les vrais appels proviennent du backend (page Appels).
export const EmptyState: React.FC<{ title?: string; hint?: string }> = ({
  title = 'Aucun appel pour le moment',
  hint = 'Importez un audio depuis la page Appels pour lancer une transcription réelle.',
}) => (
  <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center' }}>
    <Inbox size={34} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{title}</div>
    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{hint}</div>
  </div>
);
