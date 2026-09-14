// =============================================================================
// KALA VOICE QA — Page de Connexion Principale (/login)
// Design Dark Tech Neo-Futuriste • Authentification Réelle & Accès Démo 1-Clic
// =============================================================================
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Mic, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, 
  Sparkles, AlertCircle, CheckCircle2, UserCheck, Key
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rediriger vers l'URL précédente ou /dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Si déjà authentifié, rediriger directement
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        setSuccessMessage('Connexion réussie ! Redirection en cours...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        setErrorMessage(result.error || 'Identifiants invalides.');
      }
    } catch {
      setErrorMessage('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  // Raccourcis de connexion 1-clic pour le jury de soutenance
  const demoAccounts: { role: UserRole; title: string; email: string; color: string; desc: string }[] = [
    { role: 'ADMIN', title: 'Administrateur', email: 'admin@kala.ai', color: '#f87171', desc: 'Accès total système, utilisateurs & paramètres' },
    { role: 'QA_MANAGER', title: 'Responsable QA', email: 'qa@kala.ai', color: '#c084fc', desc: 'Évaluations qualité, critères & grilles d\'audit' },
    { role: 'MANAGER', title: 'Manager', email: 'manager@kala.ai', color: '#fb923c', desc: 'Pilotage global, équipes, campagnes & ROI' },
    { role: 'SUPERVISOR', title: 'Superviseur', email: 'supervisor@kala.ai', color: '#60a5fa', desc: 'Gestion du plateau, suivi temps réel des appels' },
    { role: 'TRAINER', title: 'Formateur', email: 'trainer@kala.ai', color: '#34d399', desc: 'Académie, coaching ciblé & mesure d\'uplift' },
    { role: 'AGENT', title: 'Conseiller Client', email: 'koffi.mensah@kala.ai', color: '#94a3b8', desc: 'Cas pilote Koffi Mensah (+13 pts progression)' },
  ];

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('kala2024!');
    setErrorMessage(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse at 50% -20%, rgba(59, 130, 246, 0.18) 0%, rgba(15, 23, 42, 0.6) 45%, #050505 85%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      color: '#f8fafc'
    }}>
      {/* Halo lumineux d'arrière-plan */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.05) 60%, transparent 80%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1080px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '32px',
        zIndex: 1
      }}>
        {/* Colonne Gauche : Formulaire de connexion */}
        <div style={{
          background: 'rgba(11, 15, 25, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Logo & En-tête */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
            }}>
              <Mic size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '0.5px' }}>
                KALA VOICE QA
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Plateforme Intelligente d'Analyse Vocale & Qualité
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '21px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Espace de Connexion
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Authentifiez-vous pour accéder au centre d'opérations et au cycle QA.
            </p>
          </div>

          {/* Bannière d'erreur */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '12.5px',
              marginBottom: '18px'
            }}>
              <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Bannière de succès */}
          {successMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              fontSize: '12.5px',
              marginBottom: '18px'
            }}>
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Adresse Email Professionnelle
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: admin@kala.ai"
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    height: '42px',
                    fontSize: '13.5px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderColor: errorMessage ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Mot de passe
                </label>
                <Link 
                  to="/forgot-password" 
                  style={{ fontSize: '11.5px', color: '#60a5fa', textDecoration: 'none', transition: 'color 0.2s' }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe sécurisé"
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    paddingRight: '38px',
                    height: '42px',
                    fontSize: '13.5px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderColor: errorMessage ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex'
                  }}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Se souvenir de moi */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#3b82f6', cursor: 'pointer', width: '15px', height: '15px' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Conserver ma session active sur ce terminal
              </label>
            </div>

            {/* Bouton de Connexion */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '44px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span>Authentification en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Note de sécurité */}
          <div style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={13} color="#34d399" />
              Sécurité JWT & Traçabilité RBAC
            </span>
            <span>v1.0.0 • Master 2 IA</span>
          </div>
        </div>

        {/* Colonne Droite : Accès Démonstration Rapide pour la Soutenance */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="#a855f7" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Environnement Soutenance Master 2
            </span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            Sélection Rapide des Profils Métiers
          </h3>

          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 20px 0' }}>
            Cliquez sur un profil pour pré-remplir instantanément les identifiants et tester l'application sous différents rôles RBAC.
            Mot de passe unique : <code style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '2px 6px', borderRadius: '4px', color: '#93c5fd' }}>kala2024!</code>
          </p>

          {/* Grille des profils démo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {demoAccounts.map((acc) => (
              <div
                key={acc.email}
                onClick={() => handleQuickLogin(acc.email)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: email === acc.email ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${email === acc.email ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: acc.color,
                    boxShadow: `0 0 8px ${acc.color}`
                  }} />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {acc.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {acc.email} • {acc.desc}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: email === acc.email ? '#3b82f6' : 'rgba(255, 255, 255, 0.06)',
                    color: email === acc.email ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {email === acc.email ? 'Sélectionné' : 'Choisir'}
                </button>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Key size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span>
              Toutes les données sont synchronisées entre les modules : Appels, QA, Coaching, et Formations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
