import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, Lock, History, RefreshCw, 
  Eye, EyeOff, Sliders, AlertTriangle, Users
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserRole } from '../../types';
import { UserManagementView } from './UserManagementView';

interface SettingsAuditViewProps {
  currentRole: UserRole;
}

type Tab = 'users' | 'privacy' | 'acoustic' | 'audit';

const TABS: { id: Tab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: 'users',    label: 'Comptes Utilisateurs', icon: <Users size={15} />, adminOnly: true },
  { id: 'privacy',  label: 'Confidentialité & RGPD', icon: <ShieldCheck size={15} /> },
  { id: 'acoustic', label: 'Paramètres Acoustiques', icon: <Sliders size={15} /> },
  { id: 'audit',    label: "Journal d'Audit", icon: <History size={15} /> },
];

export const SettingsAuditView: React.FC<SettingsAuditViewProps> = ({ currentRole }) => {
  const isAdmin = currentRole === 'ADMIN';
  const defaultTab: Tab = isAdmin ? 'users' : 'privacy';
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const auditLogs = storageService.getAuditLogs();
  const currentUser = storageService.getCurrentUser();

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

  const visibleTabs = TABS.filter(t => !t.adminOnly || isAdmin);

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
            Gestion des comptes, conformité RGPD, journalisation des opérations et configuration acoustique.
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

      {/* Navigation par onglets */}
      <div style={{
        display: 'flex', gap: '4px',
        background: 'rgba(0,0,0,0.3)', padding: '4px',
        borderRadius: 'var(--radius-lg)', width: 'fit-content',
        border: '1px solid rgba(255,255,255,0.07)'
      }}>
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 16px', borderRadius: 'calc(var(--radius-lg) - 4px)',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              transition: 'all 0.2s',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? '0 1px 6px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.id === 'audit' && (
              <span style={{
                background: 'var(--primary)', color: 'white',
                fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '10px'
              }}>
                {auditLogs.length}
              </span>
            )}
            {tab.id === 'users' && (
              <span style={{
                background: 'rgba(192,132,252,0.3)', color: '#c084fc',
                fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '10px'
              }}>
                {storageService.getUsers().length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Onglet : Gestion des Utilisateurs ── */}
      {activeTab === 'users' && isAdmin && (
        <UserManagementView currentUserId={currentUser.id} />
      )}

      {/* ── Onglet : Confidentialité & RGPD ── */}
      {activeTab === 'privacy' && (
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

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Durée de Conservation des Données</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Enregistrements audio supprimés après 90 jours (RGPD Art. 5.1.e).
                </div>
              </div>
              <span className="badge badge-blue">90 jours</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Chiffrement des Données au Repos</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  AES-256 pour les transcriptions, SHA-256 pour les journaux d'audit.
                </div>
              </div>
              <span className="badge badge-green">AES-256</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet : Paramètres Acoustiques ── */}
      {activeTab === 'acoustic' && (
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

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Modèle ASR Actif</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Pipeline : <strong>Whisper-small (non branché en démonstration)</strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Aucun WER mesuré pour le moment : aucune transcription réelle n'a encore été évaluée.
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={18} color="#fb923c" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fb923c' }}>Avertissement IA</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Toutes les suggestions IA nécessitent une validation humaine. Les scores automatiques sont indicatifs.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet : Journal d'Audit ── */}
      {activeTab === 'audit' && (
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
                {auditLogs.map(log => {
                  const isUserAction = ['CREATION_UTILISATEUR', 'MODIFICATION_UTILISATEUR', 'SUPPRESSION_UTILISATEUR', 'CHANGEMENT_ROLE'].includes(log.action);
                  return (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {log.timestamp}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.userName}</div>
                        <span className="badge badge-gray" style={{ fontSize: '10px' }}>{log.userRole}</span>
                      </td>
                      <td>
                        <span className={`badge ${isUserAction ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '11px' }}>
                          {log.action.replace(/_/g, ' ')}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
