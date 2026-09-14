import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, Lock, History, RefreshCw, 
  Eye, EyeOff, Sliders, Database, AlertTriangle
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserRole } from '../../types';

interface SettingsAuditViewProps {
  currentRole: UserRole;
}

export const SettingsAuditView: React.FC<SettingsAuditViewProps> = () => {
  const auditLogs = storageService.getAuditLogs();
  const criteria = storageService.getCriteria();

  const [anonymizationActive, setAnonymizationActive] = useState<boolean>(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(80);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = () => {
    if (confirm("Réinitialiser toutes les données de démonstration à leur état initial ?")) {
      storageService.resetToFactoryDefaults();
      setResetMessage("Données réinitialisées avec succès.");
      setTimeout(() => setResetMessage(null), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* En-tête */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} color="var(--primary-light)" />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Paramètres Système, Sécurité & Traçabilité</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Gestion de la conformité RGPD, journalisation des opérations et configuration acoustique.
          </p>
        </div>

        <button className="btn btn-outline-danger btn-sm" onClick={handleReset}>
          <RefreshCw size={14} />
          <span>Réinitialiser les Données Démo</span>
        </button>
      </div>

      {resetMessage && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#a7f3d0', fontSize: '13px', fontWeight: 600 }}>
          {resetMessage}
        </div>
      )}

      {/* Confidentialité & Conformité RGPD */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ShieldCheck size={18} color="#34d399" />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Confidentialité des Données & Protection de la Vie Privée</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Anonymisation Automatique (PII)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Masquage systématique des numéros de téléphone (+33 6 •• ••) et patronymes.
              </div>
            </div>
            <button 
              className={`btn btn-sm ${anonymizationActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setAnonymizationActive(!anonymizationActive)}
            >
              {anonymizationActive ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>{anonymizationActive ? 'Actif' : 'Désactivé'}</span>
            </button>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Contrôle d'Accès par Rôle (RBAC)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cloisonnement strict des accès par profil (Agent, Superviseur, Formateur, QA).
              </div>
            </div>
            <span className="badge badge-green">Verrouillé</span>
          </div>
        </div>
      </div>

      {/* Paramètres Acoustiques & Moteur IA */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sliders size={18} color="var(--primary-light)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Paramètres Acoustiques & Inférence ASR</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Seuil d'Alerte Confiance Faible :</span>
              <strong style={{ color: 'var(--primary-light)' }}>{confidenceThreshold} %</strong>
            </div>
            <input 
              type="range"
              min="50"
              max="95"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Tout mot ayant une probabilité token &lt; {confidenceThreshold}% est surligné en orange/rouge.
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Filtre Téléphonique Pré-ASR</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Bande passante : <strong>300 Hz - 3 400 Hz</strong> (Passe-bande ITU-T G.712)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Atténuation des grondements de climatisation et des bruits de frappe clavier.
            </div>
          </div>
        </div>
      </div>

      {/* Journal d'Audit & Traçabilité (Mémoire & Conformité) */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#c084fc" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Journal d'Audit & Traçabilité des Opérations</h3>
          </div>
          <span className="badge badge-purple">{auditLogs.length} Événements Journalisés</span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Horodatage</th>
                <th>Utilisateur & Rôle</th>
                <th>Action Exécutée</th>
                <th>Ressource Ciblée</th>
                <th>Détails & Modifications</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {log.timestamp}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.userName}</div>
                    <span className="badge badge-gray" style={{ fontSize: '10px' }}>{log.userRole}</span>
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px', fontWeight: 600 }}>
                    {log.targetResource}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '340px' }}>
                    {log.details}
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
