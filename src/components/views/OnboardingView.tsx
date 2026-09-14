// =============================================================================
// KALA VOICE QA — Parcours d'Onboarding Léger (/onboarding)
// Configuration du profil conseiller/manager lors de la première connexion
// =============================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCheck, Shield, Sparkles, ArrowRight, Check, 
  Building, Phone, Bell, Layout
} from 'lucide-react';
import { UserRole } from '../../types';

export const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(user?.name || '');
  const [department, setDepartment] = useState<string>(user?.department || 'Plateau Télécom & Fibre');
  const [phone, setPhone] = useState<string>(user?.phone || '+33 6 12 34 56 78');
  const [role, setRole] = useState<UserRole>(user?.role || 'AGENT');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [soundFeedback, setSoundFeedback] = useState<boolean>(true);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  ];
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatarUrl || avatars[0]);

  const handleComplete = () => {
    updateUserProfile({
      name,
      department,
      phone,
      role,
      avatarUrl: selectedAvatar
    });

    navigate('/dashboard', { replace: true });
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
        maxWidth: '620px',
        width: '100%',
        background: 'rgba(11, 15, 25, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Stepper Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Étape {step} sur 3 • Bienvenue sur KALA VOICE QA
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0' }}>
              {step === 1 && "Configuration de votre Identité"}
              {step === 2 && "Rôle & Équipe de Rattachement"}
              {step === 3 && "Préférences de Poste de Travail"}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  width: '28px',
                  height: '6px',
                  borderRadius: '3px',
                  background: s <= step ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                  transition: 'background 0.3s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Contenu Étape 1 */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Vérifiez vos informations personnelles affichées sur les rapports de performance et évaluations.
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Nom Complet / Prénom
              </label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Koffi Mensah"
                style={{ width: '100%', height: '42px', fontSize: '13.5px' }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Sélectionnez un Avatar Métier
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {avatars.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt="avatar option"
                    onClick={() => setSelectedAvatar(av)}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: `2px solid ${selectedAvatar === av ? '#3b82f6' : 'transparent'}`,
                      boxShadow: selectedAvatar === av ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Suivant</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Contenu Étape 2 */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Confirmez votre positionnement opérationnel au sein du centre de contacts.
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Département / Équipe
              </label>
              <input
                type="text"
                className="input-field"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="ex: Équipe Alpha • Télécom Fibre & Mobile"
                style={{ width: '100%', height: '42px', fontSize: '13.5px' }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Ligne Directe / Poste Téléphonique
              </label>
              <input
                type="text"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 1 80 00 00 00"
                style={{ width: '100%', height: '42px', fontSize: '13.5px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Précédent
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(3)}
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Suivant</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Contenu Étape 3 */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Paramétrez vos notifications et alertes de contrôle qualité en temps réel.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginBottom: '26px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bell size={16} color="#60a5fa" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Alertes Critiques en Direct</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Notifier dès qu'un appel obtient un score inférieur à 75%</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} color="#c084fc" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Assistance IA Pré-remplie</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Afficher les suggestions d'évaluation automatique</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundFeedback}
                  onChange={(e) => setSoundFeedback(e.target.checked)}
                  style={{ accentColor: '#a855f7', width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                Précédent
              </button>
              <button
                className="btn btn-primary"
                onClick={handleComplete}
                style={{
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                }}
              >
                <Check size={16} />
                <span>Accéder au Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
