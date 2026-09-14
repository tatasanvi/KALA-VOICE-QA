import React from 'react';
import { UserRole } from '../../types';
import { storageService } from '../../services/storageService';
import { ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeViewTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange, activeViewTitle }) => {
  const currentUser = storageService.getCurrentUser();

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    ADMIN: { label: 'Administrateur', badge: 'Système & IA', color: 'badge-purple' },
    MANAGER: { label: 'Manager Opérations', badge: 'Direction Métier', color: 'badge-blue' },
    SUPERVISOR: { label: 'Superviseur', badge: 'Plateau Télécom', color: 'badge-blue' },
    QA_MANAGER: { label: 'Responsable Qualité', badge: 'Audit & Conformité', color: 'badge-green' },
    TRAINER: { label: 'Formateur / Coach', badge: 'Académie Métier', color: 'badge-amber' },
    AGENT: { label: 'Conseiller Client', badge: 'Équipe Alpha', color: 'badge-gray' }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{activeViewTitle}</h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Plateforme KALA VOICE QA • Soutenance Master 2 IA & Big Data
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Statut Moteur IA & Débruiteur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.08)', padding: '5px 12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Sparkles size={14} color="#60a5fa" />
          <span style={{ fontSize: '11.5px', color: '#93c5fd', fontWeight: 600 }}>
            ASR & Dénosing : <strong style={{ color: '#ffffff' }}>KALA-Whisper-v3</strong> (+11.2 dB SNR)
          </span>
        </div>

        {/* Switcher de rôle persona */}
        <div className="role-switcher-container">
          <UserCheck size={16} color="var(--primary-light)" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Profil :</span>
          <select 
            value={currentRole} 
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="role-select"
            title="Basculez entre les rôles pour tester les permissions et les vues dédiées"
          >
            <option value="QA_MANAGER">Claire Delattre (Responsable Qualité)</option>
            <option value="SUPERVISOR">Marc Vasseur (Superviseur Plateau)</option>
            <option value="TRAINER">Patrick Simon (Formateur / Coach)</option>
            <option value="AGENT">Jean Dupont (Agent Conseiller)</option>
            <option value="MANAGER">Sophie Laurent (Directrice Opérations)</option>
            <option value="ADMIN">Alexandre Moreau (Administrateur IA)</option>
          </select>
        </div>

        {/* Utilisateur Actif */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.name} 
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', border: '2px solid var(--border-active)', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{currentUser.name}</div>
            <span className={`badge ${roleLabels[currentRole].color}`} style={{ padding: '1px 6px', fontSize: '10.5px', marginTop: '2px' }}>
              <ShieldCheck size={10} style={{ marginRight: '3px' }} />
              {roleLabels[currentRole].label}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
