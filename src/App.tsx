import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar, ViewType } from './components/common/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { CallsView } from './components/views/CallsView';
import { TranscriptionStudioView } from './components/views/TranscriptionStudioView';
import { NlpAnalyticsView } from './components/views/NlpAnalyticsView';
import { QualityControlView } from './components/views/QualityControlView';
import { CoachingView } from './components/views/CoachingView';
import { TrainingView } from './components/views/TrainingView';
import { AgentProfileView } from './components/views/AgentProfileView';
import { TeamsCampaignsView } from './components/views/TeamsCampaignsView';
import { ExperimentLabView } from './components/views/ExperimentLabView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsAuditView } from './components/views/SettingsAuditView';
import { LoginModal } from './components/common/LoginModal';
import { storageService } from './services/storageService';
import { authApi } from './services/apiClient';
import { UserRole } from './types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedCallId, setSelectedCallId] = useState<string>('call-101');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-1');
  const [currentRole, setCurrentRole] = useState<UserRole>(() => storageService.getCurrentUser().role);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);
  const [, setTick] = useState<number>(0);

  // Souscription aux changements d'état du service de stockage
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsub();
  }, []);

  // Tester la connectivité de l'API backend
  useEffect(() => {
    authApi.isOnline().then(online => setIsApiOnline(online));
    const interval = setInterval(() => {
      authApi.isOnline().then(online => setIsApiOnline(online));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    storageService.setCurrentUserRole(newRole);

    // Navigation contextuelle automatique selon le rôle choisi
    if (newRole === 'QA_MANAGER') {
      setActiveView('quality');
    } else if (newRole === 'TRAINER') {
      setActiveView('coaching');
    } else if (newRole === 'AGENT') {
      setActiveView('agents');
    } else if (newRole === 'SUPERVISOR') {
      setActiveView('calls');
    } else {
      setActiveView('dashboard');
    }
  };

  const viewTitles: Record<ViewType, string> = {
    dashboard: "Tableau de Bord Exécutif Centre d'Appels",
    calls: "Registre des Appels & Enregistrements",
    transcriptions: "Studio Audio & Transcription Synchronisée",
    analytics: "Analyse Sémantique & Intelligence Conversationnelle",
    quality: "Espace Contrôle Qualité & Évaluation Assistée",
    coaching: "Espace Coaching & Recommandations de Progrès",
    training: "Académie & Modules de Formation Métier",
    agents: "Fiches Conseillers & Profils 360°",
    teams: "Structure des Équipes & Campagnes",
    campaigns: "Structure des Campagnes Métiers",
    reports: "Rapports d'Audit & Synthèses Métiers",
    experimentation: "Laboratoire Expérimental ASR (Mémoire Master IA)",
    settings: "Sécurité, Traçabilité & Paramètres Système"
  };

  return (
    <div className="app-container">
      {/* Sidebar de navigation */}
      <Sidebar 
        activeView={activeView} 
        onSelectView={setActiveView} 
        currentRole={currentRole} 
      />

      {/* Zone Principale */}
      <div className="main-wrapper">
        <Navbar 
          currentRole={currentRole} 
          onRoleChange={handleRoleChange} 
          activeViewTitle={viewTitles[activeView]} 
          onNavigate={setActiveView}
          onOpenLogin={() => setShowLoginModal(true)}
          onLogout={() => {
            authApi.logout();
            handleRoleChange('AGENT');
          }}
          isOnline={isApiOnline}
        />

        {/* Bannière Démonstration Soutenance Master 2 */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.12))',
          borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
          padding: '6px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11.5px',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', 
              background: '#34d399', boxShadow: '0 0 8px #34d399' 
            }} />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Données de démonstration — Soutenance Master 2 IA & Big Data
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>
              20 conseillers • 4 équipes • 3 campagnes métiers • 100+ conversations transcrites & analysées
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-purple" style={{ fontSize: '10px', padding: '2px 8px' }}>
              Pipeline : Audio Bruité → Dénoyautage Spectral → ASR → QA & Coaching
            </span>
          </div>
        </div>

        <main className="content-area">
          {activeView === 'dashboard' && (
            <DashboardView 
              onSelectCall={setSelectedCallId} 
              onNavigate={setActiveView} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'calls' && (
            <CallsView 
              onSelectCall={setSelectedCallId} 
              onNavigate={setActiveView} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'transcriptions' && (
            <TranscriptionStudioView 
              selectedCallId={selectedCallId} 
              onSelectCall={setSelectedCallId} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'analytics' && (
            <NlpAnalyticsView 
              selectedCallId={selectedCallId} 
              onSelectCall={setSelectedCallId} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'quality' && (
            <QualityControlView 
              selectedCallId={selectedCallId} 
              onSelectCall={setSelectedCallId} 
              onNavigate={setActiveView} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'coaching' && (
            <CoachingView 
              onNavigate={setActiveView} 
              onSelectAgent={setSelectedAgentId} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'training' && (
            <TrainingView 
              onNavigate={setActiveView} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'agents' && (
            <AgentProfileView 
              selectedAgentId={selectedAgentId} 
              onSelectAgent={setSelectedAgentId} 
              onSelectCall={setSelectedCallId} 
              onNavigate={setActiveView} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'teams' && (
            <TeamsCampaignsView 
              onSelectAgent={setSelectedAgentId} 
              onNavigate={setActiveView} 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'reports' && (
            <ReportsView 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'experimentation' && (
            <ExperimentLabView 
              currentRole={currentRole} 
            />
          )}

          {activeView === 'settings' && (
            <SettingsAuditView 
              currentRole={currentRole} 
            />
          )}
        </main>
      </div>

      {/* Modal d'Authentification / Login */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          handleRoleChange(user.role);
        }}
      />
    </div>
  );
};
