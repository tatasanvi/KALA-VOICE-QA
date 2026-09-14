// =============================================================================
// KALA VOICE QA — Barre Supérieure (Navbar)
// Statut API, Débruiteur KALA, Notifications en direct & Sélecteur de Rôle RBAC
// =============================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, TeamNotification } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, UserCheck, Sparkles, Bell, LogOut, Check, 
  Wifi, WifiOff, X
} from 'lucide-react';

interface NavbarProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  activeViewTitle?: string;
  onNavigate?: (view: any) => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  isOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeViewTitle = "KALA VOICE QA — Plateforme Intelligente d'Analyse Vocale",
  onNavigate,
  isOnline = true
}) => {
  const navigate = useNavigate();
  const { user, role, switchRole, logout } = useAuth();
  const notifications = storageService.getNotifications();
  const unreadCount = storageService.getUnreadNotificationCount();

  const [showNotifications, setShowNotifications] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    ADMIN:      { label: 'Administrateur',    badge: 'Système & IA',       color: 'badge-purple' },
    MANAGER:    { label: 'Manager Opérations',badge: 'Direction Métier',   color: 'badge-blue' },
    SUPERVISOR: { label: 'Superviseur',       badge: 'Plateau Télécom',    color: 'badge-blue' },
    QA_MANAGER: { label: 'Responsable Qualité',badge: 'Audit & Conformité', color: 'badge-green' },
    TRAINER:    { label: 'Formateur / Coach', badge: 'Académie Métier',    color: 'badge-amber' },
    AGENT:      { label: 'Conseiller Client', badge: 'Équipe Alpha',       color: 'badge-gray' }
  };

  const currentRole = role || 'AGENT';

  const handleRoleChangeInternal = (newRole: UserRole) => {
    switchRole(newRole);

    // Redirection automatique contextuelle selon le rôle choisi
    if (newRole === 'QA_MANAGER') {
      navigate('/qualite');
    } else if (newRole === 'TRAINER') {
      navigate('/coaching');
    } else if (newRole === 'AGENT') {
      navigate('/agents');
    } else if (newRole === 'SUPERVISOR') {
      navigate('/appels');
    } else {
      navigate('/dashboard');
    }
  };

  const handleNotificationClick = (notif: TeamNotification) => {
    storageService.markNotificationAsRead(notif.id);
    if (notif.targetView) {
      const routeMap: Record<string, string> = {
        calls: '/appels',
        quality: '/qualite',
        coaching: '/coaching',
        training: '/formation',
        dashboard: '/dashboard',
        agents: '/agents'
      };
      navigate(routeMap[notif.targetView] || `/${notif.targetView}`);
      setShowNotifications(false);
    } else if (onNavigate) {
      onNavigate(notif.targetView);
      setShowNotifications(false);
    }
  };

  return (
    <header className="topbar" style={{ position: 'relative' }}>
      <div className="topbar-left">
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{activeViewTitle}</h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Plateforme KALA VOICE QA • Soutenance Master 2 IA & Big Data
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Statut Connectivité Backend */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '4px 10px', 
            borderRadius: 'var(--radius-full)', 
            background: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            fontSize: '11px',
            fontWeight: 600,
            color: isOnline ? '#34d399' : '#f87171'
          }}
          title={isOnline ? "API Backend Express & Base SQLite connectés (:8000)" : "Mode Fallback Local Storage actif"}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'API Connectée' : 'Hors-Ligne'}</span>
        </div>

        {/* Statut Moteur IA & Débruiteur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.08)', padding: '5px 12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Sparkles size={14} color="#60a5fa" />
          <span style={{ fontSize: '11.5px', color: '#93c5fd', fontWeight: 600 }}>
            ASR & Dénosing : <strong style={{ color: '#ffffff' }}>KALA-Whisper-v3</strong> (+11.2 dB SNR)
          </span>
        </div>

        {/* Cloche Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              position: 'relative', 
              padding: '8px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: showNotifications ? 'rgba(255,255,255,0.1)' : undefined
            }}
            title="Notifications d'équipe et alertes qualité"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0f172a'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Panneau déroulant des notifications */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '360px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} color="#60a5fa" />
                  <span>Alertes Opérationnelles</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => storageService.markAllNotificationsAsRead()}
                    style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Check size={12} />
                    Tout marquer lu
                  </button>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    Aucune notification active
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          padding: '1px 6px', 
                          borderRadius: '4px',
                          background: n.priority === 'HAUTE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: n.priority === 'HAUTE' ? '#f87171' : '#60a5fa'
                        }}>
                          {n.priority}
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: n.read ? 500 : 700, color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Switcher de rôle persona */}
        <div className="role-switcher-container">
          <UserCheck size={16} color="var(--primary-light)" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rôle :</span>
          <select 
            value={currentRole} 
            onChange={(e) => handleRoleChangeInternal(e.target.value as UserRole)}
            className="role-select"
            title="Basculez entre les rôles pour tester les permissions et les vues dédiées"
          >
            <option value="QA_MANAGER">Claire Delattre (Responsable Qualité)</option>
            <option value="SUPERVISOR">Marc Vasseur (Superviseur Plateau)</option>
            <option value="TRAINER">Patrick Simon (Formateur / Coach)</option>
            <option value="AGENT">Koffi Mensah (Conseiller Client)</option>
            <option value="MANAGER">Sophie Laurent (Directrice Opérations)</option>
            <option value="ADMIN">Alexandre Moreau (Administrateur IA)</option>
          </select>
        </div>

        {/* Utilisateur Actif & Déconnexion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
            alt={user?.name || 'Utilisateur'} 
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', border: '2px solid var(--border-active)', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{user?.name || 'Invité'}</div>
            <span className={`badge ${roleLabels[currentRole].color}`} style={{ padding: '1px 6px', fontSize: '10.5px', marginTop: '2px' }}>
              <ShieldCheck size={10} style={{ marginRight: '3px' }} />
              {roleLabels[currentRole].label}
            </span>
          </div>

          {/* Bouton Déconnexion */}
          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            style={{ padding: '6px 8px' }}
            title="Se déconnecter de la session"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};
