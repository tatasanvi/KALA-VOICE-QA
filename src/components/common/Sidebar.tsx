// =============================================================================
// KALA VOICE QA — Barre de Navigation Latérale (Sidebar)
// Organisation structurée en 6 sections métiers, profil utilisateur & déconnexion
// =============================================================================
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, PhoneCall, Mic, Sparkles, CheckCircle2, 
  TrendingUp, GraduationCap, Users, FolderGit2, Flag, 
  FileText, FlaskConical, Settings, LogOut, UserCheck, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export type ViewType = 
  | 'dashboard'
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
  | 'experimentation'
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

  const isActive = (path: string) => {
    if (path === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    return currentPath.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    ADMIN:      { label: 'Administrateur', badge: 'badge-red',    color: '#d98383' },
    MANAGER:    { label: 'Manager Ops',    badge: 'badge-orange', color: '#fb923c' },
    SUPERVISOR: { label: 'Superviseur',    badge: 'badge-blue',   color: '#9fb7d6' },
    QA_MANAGER: { label: 'Resp. Qualité',  badge: 'badge-purple', color: '#b3aed1' },
    TRAINER:    { label: 'Formateur',      badge: 'badge-green',  color: '#6db89a' },
    AGENT:      { label: 'Conseiller',     badge: 'badge-gray',   color: '#94a3b8' },
  };

  const currentRoleMeta = role ? roleLabels[role] : roleLabels.AGENT;

  // Filtrage RBAC des sections
  const showAdminSection = role === 'ADMIN';
  const showExperimentation = role === 'ADMIN' || role === 'MANAGER' || role === 'QA_MANAGER';

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      {/* Brand Header */}
      <div 
        className="sidebar-header" 
        onClick={() => handleNavigate('/dashboard')} 
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
        {/* 1. PILOTAGE */}
        <div className="nav-section">
          <div className="nav-section-title">Pilotage</div>

          <button 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavigate('/dashboard')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${isActive('/rapports') ? 'active' : ''}`}
            onClick={() => handleNavigate('/rapports')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <FileText size={18} />
            <span>Rapports & Synthèses</span>
          </button>
        </div>

        {/* 2. OPÉRATIONS */}
        <div className="nav-section">
          <div className="nav-section-title">Opérations</div>

          <button 
            className={`nav-item ${isActive('/appels') ? 'active' : ''}`}
            onClick={() => handleNavigate('/appels')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <PhoneCall size={18} />
            <span>Appels & Enregistrements</span>
            <span className="nav-badge">100+</span>
          </button>

          <button 
            className={`nav-item ${isActive('/transcriptions') ? 'active' : ''}`}
            onClick={() => handleNavigate('/transcriptions')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <Mic size={18} />
            <span>Studio Transcription</span>
          </button>

          <button 
            className={`nav-item ${isActive('/qualite') ? 'active' : ''}`}
            onClick={() => handleNavigate('/qualite')}
            style={{ width: '100%', background: 'none', textAlign: 'left' }}
          >
            <CheckCircle2 size={18} />
            <span>Contrôle Qualité (QA)</span>
            <span className="nav-badge urgent">2</span>
          </button>
        </div>

        {/* 3. PERFORMANCE */}
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
            <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '10px' }}>+13 pts</span>
          </button>
        </div>

        {/* 5. RECHERCHE SCIENTIFIQUE (MASTER 2) */}
        {showExperimentation && (
          <div className="nav-section">
            <div className="nav-section-title" style={{ color: '#b3aed1' }}>Recherche Scientifique</div>

            <button 
              className={`nav-item ${isActive('/experimentation') ? 'active' : ''}`}
              onClick={() => handleNavigate('/experimentation')}
              style={{ width: '100%', background: 'none', textAlign: 'left' }}
            >
              <FlaskConical size={18} color="#b3aed1" />
              <span style={{ color: '#e9d5ff', fontWeight: 600 }}>Expérimentation ASR</span>
              <span className="badge badge-purple" style={{ marginLeft: 'auto', fontSize: '10px' }}>WER/CER</span>
            </button>
          </div>
        )}

        {/* 6. ADMINISTRATION & SÉCURITÉ */}
        {showAdminSection && (
          <div className="nav-section">
            <div className="nav-section-title" style={{ color: '#d98383' }}>Administration</div>

            <button 
              className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
              onClick={() => handleNavigate('/admin/users')}
              style={{ width: '100%', background: 'none', textAlign: 'left' }}
            >
              <Shield size={18} color="#d98383" />
              <span>Gestion Utilisateurs</span>
            </button>

            <button 
              className={`nav-item ${isActive('/parametres') ? 'active' : ''}`}
              onClick={() => handleNavigate('/parametres')}
              style={{ width: '100%', background: 'none', textAlign: 'left' }}
            >
              <Settings size={18} />
              <span>Paramètres & Audit</span>
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
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name || 'Utilisateur'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `1.5px solid ${currentRoleMeta.color}`,
                flexShrink: 0
              }}
            />
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
      </div>
    </aside>
  );
};
