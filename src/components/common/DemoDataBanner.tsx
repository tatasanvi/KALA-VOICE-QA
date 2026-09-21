import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Bandeau affiché sur toutes les vues : les appels, transcriptions, scores et
// indicateurs présents dans l'application sont des données de démonstration,
// pas des résultats de mesure.
export const DemoDataBanner: React.FC = () => (
  <div
    role="note"
    style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(251, 146, 60, 0.12)', border: '1px solid rgba(251, 146, 60, 0.45)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '18px',
      fontSize: '12.5px', color: '#fed7aa'
    }}
  >
    <AlertTriangle size={16} color="#fb923c" style={{ flexShrink: 0 }} />
    <span>
      <strong>Données de démonstration.</strong> Les appels, transcriptions, scores, SNR et indicateurs affichés
      sont fictifs et ne constituent pas des résultats de mesure.
    </span>
  </div>
);

export const DemoDataBadge: React.FC = () => (
  <span className="badge badge-amber" style={{ fontSize: '10px' }} title="Données fictives, pas un résultat de mesure">
    Données de démonstration
  </span>
);
