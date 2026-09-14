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
import { storageService } from './services/storageService';
import { UserRole } from './types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedCallId, setSelectedCallId] = useState<string>('call-101');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-1');
  const [currentRole, setCurrentRole] = useState<UserRole>(() => storageService.getCurrentUser().role);
  const [, setTick] = useState<number>(0);

  // Souscription aux changements d'état du service de stockage
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsub();
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
        />

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
    </div>
  );
};
