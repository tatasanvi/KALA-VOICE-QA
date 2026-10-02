// =============================================================================
// KALA VOICE QA · Barre de Navigation Latérale (Sidebar)
// Organisation structurée en 6 sections métiers, profil utilisateur & déconnexion
// =============================================================================
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PhoneCall, Mic, CheckCircle2, 
  TrendingUp, GraduationCap, Users, FolderGit2, Flag, 
  Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Avatar } from './Avatar';

export type ViewType = 
  | 'calls'
  | 'transcriptions'
  | 'analytics'
  | 'quality'
  | 'coaching'
  | 'training'
  | 'agents'
  | 'teams'
  | 'campaigns'
  | 'reports'
  | 'settings'
  | 'users';

interface SidebarProps {
  onSelectView?: (view: ViewType) => void;
  currentRole?: UserRole;
  activeView?: string;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();

  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath.startsWith(path);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    ADMIN:             { label: 'Administrateur',     badge: 'badge-red',   color: '#d98383' },
    QUALITE_FORMATION: { label: 'Qualité & Formation', badge: 'badge-blue',  color: '#9fb7d6' },
    AGENT:             { label: 'Conseiller',          badge: 'badge-gray',  color: '#94a3b8' },
  };

  const currentRoleMeta = role ? roleLabels[role] : roleLabels.AGENT;

  // Filtrage RBAC des sections
  const isAgent = role === 'AGENT';
  // Le conseiller n'accède qu'à ses propres données : pas de pilotage global,
  // ni de vues d'équipe (le backend renvoie 403 sur ces données de toute façon).
  const showPerformance = !isAgent;
  const showAdminSection = role === 'ADMIN';

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      {/* Brand Header */}
      <div 
        className="sidebar-header" 
        onClick={() => handleNavigate('/appels')} 
        style={{ cursor: 'pointer' }}
      >
        <div className="logo-badge">
          <Mic size={20} />
        </div>
        <div>
          <div className="brand-title">KALA VOICE</div>
          <div className="brand-tagline">Intelligence & Qualité</div>
        </div>
      </div>

      <div style={{ flex: 1, paddingBottom: '16px' }}>
        {/* Studio de transcription */}
        <div className="nav-section">
          <div className="nav-section-title" style={{ color: '#b3aed1', letterSpacing: '0.6px' }}>
            Transcription
          </div>
          <button 
            className={`nav-item ${isActive('/transcriptions') ? 'active' : ''}`}
            onClick={() => handleNavigate('/transcriptions')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <Mic size={18} color="#6db89a" />
            <span style={{ fontWeight: 700 }}>Studio Transcription</span>
            <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '10px' }}>Live</span>
          </button>
        </div>

        {/* 2. OPÉRATIONS PLATEAU (APPELS & QUALITÉ) */}
        <div className="nav-section">
          <div className="nav-section-title" style={{ color: '#9fb7d6' }}>
            Opérations & Supervision
          </div>

          <button 
            className={`nav-item ${isActive('/appels') ? 'active' : ''}`}
            onClick={() => handleNavigate('/appels')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <PhoneCall size={18} />
            <span>Appels & Enregistrements</span>
            <span className="nav-badge">Sortant</span>
          </button>

          <button 
            className={`nav-item ${isActive('/qualite') ? 'active' : ''}`}
            onClick={() => handleNavigate('/qualite')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <CheckCircle2 size={18} />
            <span>Contrôle Qualité (QA)</span>
          </button>
        </div>

        {/* 3. PERFORMANCE */}
        {showPerformance && (
        <div className="nav-section">
          <div className="nav-section-title">Performance</div>

          <button 
            className={`nav-item ${isActive('/agents') ? 'active' : ''}`}
            onClick={() => handleNavigate('/agents')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <Users size={18} />
            <span>Profils Conseillers</span>
          </button>

          <button 
            className={`nav-item ${isActive('/equipes') ? 'active' : ''}`}
            onClick={() => handleNavigate('/equipes')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <FolderGit2 size={18} />
            <span>Équipes & Plateaux</span>
          </button>

          <button 
            className={`nav-item ${isActive('/campagnes') ? 'active' : ''}`}
            onClick={() => handleNavigate('/campagnes')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <Flag size={18} />
            <span>Campagnes Métiers</span>
          </button>
        </div>
        )}

        {/* 4. AMÉLIORATION */}
        <div className="nav-section">
          <div className="nav-section-title">Amélioration Continue</div>

          <button 
            className={`nav-item ${isActive('/coaching') ? 'active' : ''}`}
            onClick={() => handleNavigate('/coaching')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <TrendingUp size={18} />
            <span>Coaching & Lacunes</span>
          </button>

          <button 
            className={`nav-item ${isActive('/formation') ? 'active' : ''}`}
            onClick={() => handleNavigate('/formation')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <GraduationCap size={18} />
            <span>Académie & Uplift</span>
          </button>
        </div>

        {/* 6. ADMINISTRATION & SÉCURITÉ */}
        {showAdminSection && (
          <div className="nav-section">
            <div className="nav-section-title" style={{ color: '#d98383' }}>Système</div>

            <button 
              className={`nav-item ${isActive('/parametres') ? 'active' : ''}`}
              onClick={() => handleNavigate('/parametres')}
              style={{ width: '100%', background: 'none', textAlign: 'left' }}
            >
              <Settings size={18} />
              <span>Paramètres & Modèles</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION INFÉRIEURE : PROFIL UTILISATEUR & LOGOUT */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '14px',
        background: 'rgba(5, 5, 5, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div 
            onClick={() => handleNavigate('/agents')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', overflow: 'hidden', flex: 1 }}
            title="Consulter votre profil"
          >
            <Avatar name={user?.name} size={34} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || 'Invité'}
              </div>
              <div style={{ fontSize: '11px', color: currentRoleMeta.color, fontWeight: 600 }}>
                {currentRoleMeta.label}
              </div>
            </div>
          </div>

          {/* Bouton Déconnexion Réelle */}
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              color: '#d98383',
              padding: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Déconnexion de session"
          >
            <LogOut size={16} />
          </button>
        </div>

        <button
          onClick={() => handleNavigate('/donnees-personnelles')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px 0',
            fontSize: '11px', color: 'var(--text-muted)', textAlign: 'left', width: '100%'
          }}
        >
          Protection des données (RGPD)
        </button>
      </div>
    </aside>
  );
};
