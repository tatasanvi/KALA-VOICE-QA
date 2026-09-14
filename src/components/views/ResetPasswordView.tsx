// =============================================================================
// KALA VOICE QA — Page de Réinitialisation de Mot de Passe (/reset-password)
// Saisie du nouveau mot de passe avec indicateur de robustesse
// =============================================================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const ResetPasswordView: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: 'Vide', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Faible', color: '#f87171' };
    if (score === 2) return { score: 2, label: 'Moyen', color: '#fb923c' };
    if (score === 3) return { score: 3, label: 'Fort', color: '#60a5fa' };
    return { score: 4, label: 'Très Robuste', color: '#34d399' };
  };

  const strength = calculateStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au minimum 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1000);
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
      color: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(11, 15, 25, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Lock size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>KALA VOICE QA</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nouveau Mot de Passe</div>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>
          Réinitialisation du mot de passe
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
          Définissez un nouveau mot de passe sécurisé pour votre compte utilisateur.
        </p>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={28} color="#34d399" />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px 0' }}>
              Mot de passe mis à jour !
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Votre mot de passe a été modifié avec succès. Redirection vers l'écran de connexion...
            </p>

            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>Se connecter maintenant</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    paddingRight: '38px',
                    height: '42px',
                    fontSize: '13.5px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
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
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Indicateur de force */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Robustesse :</span>
                    <span style={{ fontWeight: 600, color: strength.color }}>{strength.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        style={{
                          flex: 1,
                          borderRadius: '2px',
                          background: step <= strength.score ? strength.color : 'rgba(255, 255, 255, 0.1)',
                          transition: 'background 0.3s'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Confirmez le nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    height: '42px',
                    fontSize: '13.5px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>
            </div>

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
                gap: '8px'
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
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Enregistrer le nouveau mot de passe</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
