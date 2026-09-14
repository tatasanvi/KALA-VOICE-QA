// =============================================================================
// KALA VOICE QA — Écran 403 : Accès Restreint (RBAC Security)
// Protection des routes d'administration et d'audit contre les accès non autorisés
// =============================================================================
import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

interface AccessDeniedViewProps {
  requiredRoles?: UserRole[];
  currentRole?: UserRole | null;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ 
  requiredRoles = ['ADMIN'],
  currentRole = 'AGENT'
}) => {
  const navigate = useNavigate();

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur Système',
    MANAGER: 'Manager Opérations',
    SUPERVISOR: 'Superviseur de Plateau',
    QA_MANAGER: 'Responsable Qualité & Audit',
    TRAINER: 'Formateur Métier',
    AGENT: 'Conseiller Client'
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.1)',
        textAlign: 'center',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Shield Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '2px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)'
        }}>
          <ShieldAlert size={36} color="#f87171" />
        </div>

        {/* Badge Code Erreur */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '14px' }}>
          <Lock size={12} color="#f87171" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fca5a5', letterSpacing: '0.5px' }}>
            HTTP 403 • ACCÈS STRICTEMENT RESTREINT (RBAC)
          </span>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
          Privilèges Insuffisants
        </h2>

        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 24px 0' }}>
          Vous tentez d'accéder à une ressource sécurisée du centre de contacts réservée aux profils à privilèges élevés.
          Conformément à la politique de conformité et de confidentialité des données, cet accès a été consigné dans le journal d'audit.
        </p>

        {/* Tableau comparatif des rôles */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '28px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Votre rôle actif :</span>
            <span style={{ fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <UserX size={13} />
              {currentRole ? roleLabels[currentRole] || currentRole : 'Non identifié'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rôles autorisés pour cette section :</span>
            <span style={{ fontWeight: 700, color: '#34d399' }}>
              {requiredRoles.map(r => roleLabels[r] || r).join(', ')}
            </span>
          </div>
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} />
            <span>Retourner au Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
