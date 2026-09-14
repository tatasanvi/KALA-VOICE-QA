// =============================================================================
// KALA VOICE QA — Page Mot de Passe Oublié (/forgot-password)
// Demande de lien de réinitialisation sécurisé par email
// =============================================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export const ForgotPasswordView: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Veuillez entrer une adresse email valide.');
      return;
    }

    setIsLoading(true);

    // Simulation de l'envoi du lien de récupération
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
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
      position: 'relative',
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
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <KeyRound size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>KALA VOICE QA</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Récupération de compte</div>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>
          Mot de passe oublié ?
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 24px 0' }}>
          Entrez votre adresse email professionnelle pour recevoir les instructions et le lien sécurisé de réinitialisation.
        </p>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
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

            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              Lien de récupération envoyé !
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              Si un compte est associé à <strong>{email}</strong>, un email contenant un lien de réinitialisation à usage unique vient d'être expédié.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link 
                to="/reset-password"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  padding: '10px'
                }}
              >
                <span>Accéder directement à l'écran de réinitialisation</span>
              </Link>

              <Link 
                to="/login"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  padding: '10px'
                }}
              >
                <ArrowLeft size={15} />
                <span>Retour à la connexion</span>
              </Link>
            </div>
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Adresse Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: conseiller@kala.ai"
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
                gap: '8px',
                marginBottom: '16px'
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
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Envoyer le lien de récupération</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link 
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-secondary)',
                  fontSize: '12.5px',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
              >
                <ArrowLeft size={14} />
                <span>Retour à l'écran de connexion</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
