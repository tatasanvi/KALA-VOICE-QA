import React, { useState } from 'react';
import { UserRole } from '../../types';
import { storageService } from '../../services/storageService';
import { authApi } from '../../services/apiClient';
import { 
  Lock, Mail, Key, ShieldCheck, CheckCircle2, AlertCircle, X, 
  Sparkles, ArrowRight, User
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const PRESET_ACCOUNTS = [
  { email: 'a.moreau@kalavoice.ai', name: 'Alexandre Moreau', role: 'ADMIN', roleLabel: 'Administrateur', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { email: 'c.delattre@kalavoice.ai', name: 'Claire Delattre', role: 'QA_MANAGER', roleLabel: 'Resp. Qualité', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150' },
  { email: 'm.vasseur@kalavoice.ai', name: 'Marc Vasseur', role: 'SUPERVISOR', roleLabel: 'Superviseur', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { email: 'p.simon@kalavoice.ai', name: 'Patrick Simon', role: 'TRAINER', roleLabel: 'Formateur', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { email: 'j.dupont@kalavoice.ai', name: 'Jean Dupont', role: 'AGENT', roleLabel: 'Conseiller Client', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' },
  { email: 's.laurent@kalavoice.ai', name: 'Sophie Laurent', role: 'MANAGER', roleLabel: 'Directrice Opé', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' },
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('c.delattre@kalavoice.ai');
  const [password, setPassword] = useState('kala2024!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login(email, password);
      if (res.ok && res.data) {
        // Mettre à jour l'utilisateur actif local
        storageService.setCurrentUserRole(res.data.user.role as UserRole);
        onLoginSuccess(res.data.user);
        onClose();
      } else {
        // Mode fallback local si l'API backend n'est pas encore démarrée
        const localUsers = storageService.getUsers();
        const found = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          storageService.setCurrentUserRole(found.role);
          onLoginSuccess(found);
          onClose();
        } else {
          setError(res.error || 'Identifiants invalides.');
        }
      }
    } catch (err: any) {
      setError('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (acc: typeof PRESET_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('kala2024!');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* En-tête */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'var(--primary)',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={15} color="white" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Authentification KALA VOICE QA</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 36px' }}>
              Connexion sécurisée avec JWT & Contrôle d'accès par rôle (RBAC)
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Sélection rapide de profil démo */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Connexion Rapide (Profils Équipe Démo) :
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {PRESET_ACCOUNTS.map(acc => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickSelect(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      background: isSelected ? 'rgba(74, 111, 165, 0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img 
                      src={acc.avatar} 
                      alt={acc.name} 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--primary-light)' }}>
                        {acc.roleLabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulaire de saisie */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Adresse Email Professionnelle
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="nom@kalavoice.ai"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Mot de Passe (défaut démo : kala2024!)
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Session valide 8 heures • Traçabilité RGPD
              </span>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading ? 'Connexion...' : 'Se Connecter'}
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
