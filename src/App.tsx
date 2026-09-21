// =============================================================================
// KALA VOICE QA — Application Principale (App.tsx)
// Routage React Router, Protection des Routes RBAC, Authentification & Layout Métier
// =============================================================================
import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter, Routes, Route, Navigate, 
  useParams, useNavigate, useLocation, Outlet 
} from 'react-router-dom';

// Context & Guards
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, RoleGuard } from './components/common/RouteGuards';

// Navigation & Layout
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Public Views
import { LoginView } from './components/views/LoginView';
import { ForgotPasswordView } from './components/views/ForgotPasswordView';
import { ResetPasswordView } from './components/views/ResetPasswordView';
import { OnboardingView } from './components/views/OnboardingView';

// Protected Views
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
import { UserManagementView } from './components/views/UserManagementView';

import { authApi } from './services/apiClient';
import { DemoDataBanner } from './components/common/DemoDataBanner';

// ─── Layout Authentifié avec Sidebar, Navbar & Bannière Master 2 ───────────────
const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);

  // Tester la connectivité de l'API backend
  useEffect(() => {
    authApi.isOnline().then(online => setIsApiOnline(online));
    const interval = setInterval(() => {
      authApi.isOnline().then(online => setIsApiOnline(online));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (path: string): string => {
    if (path.startsWith('/dashboard')) return "Tableau de Bord Exécutif Centre d'Appels";
    if (path.startsWith('/appels')) return "Registre des Appels & Enregistrements";
    if (path.startsWith('/transcriptions')) return "Studio Audio & Transcription Synchronisée";
    if (path.startsWith('/analytics')) return "Analyse Sémantique & Intelligence Conversationnelle";
    if (path.startsWith('/qualite')) return "Espace Contrôle Qualité & Évaluation Assistée";
    if (path.startsWith('/coaching')) return "Espace Coaching & Recommandations de Progrès";
    if (path.startsWith('/formation')) return "Académie & Modules de Formation Métier";
    if (path.startsWith('/agents')) return "Fiches Conseillers & Profils 360°";
    if (path.startsWith('/equipes')) return "Structure des Équipes & Plateaux Télécom";
    if (path.startsWith('/campagnes')) return "Structure des Campagnes Métiers";
    if (path.startsWith('/rapports')) return "Rapports d'Audit & Synthèses Métiers";
    if (path.startsWith('/experimentation')) return "Laboratoire Expérimental ASR (Mémoire Master IA)";
    if (path.startsWith('/parametres')) return "Sécurité, Traçabilité & Paramètres Système";
    if (path.startsWith('/admin/users')) return "Administration & Gestion des Comptes Utilisateurs";
    return "KALA VOICE QA — Plateforme Intelligente d'Analyse Vocale";
  };

  return (
    <div className="app-container">
      {/* Sidebar de navigation avec sections RBAC */}
      <Sidebar />

      {/* Zone Principale */}
      <div className="main-wrapper">
        <Navbar 
          activeViewTitle={getPageTitle(location.pathname)} 
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
          <DemoDataBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ─── Wrappers de Vues avec support des paramètres d'URL (useParams) ───────────

const CallsRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <CallsView 
      initialCallId={id}
      onSelectCall={(callId) => navigate(`/appels/${callId}`)}
      onNavigate={(path) => navigate(typeof path === 'string' && path.startsWith('/') ? path : `/${path}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const DashboardRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <DashboardView 
      onSelectCall={(callId) => navigate(`/appels/${callId}`)}
      onNavigate={(path) => navigate(typeof path === 'string' && path.startsWith('/') ? path : `/${path}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const TranscriptionRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <TranscriptionStudioView 
      selectedCallId={id || 'call-101'}
      onSelectCall={(callId) => navigate(`/transcriptions/${callId}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const AnalyticsRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <NlpAnalyticsView 
      selectedCallId={id || 'call-101'}
      onSelectCall={(callId) => navigate(`/analytics/${callId}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const QualityRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <QualityControlView 
      selectedCallId={id || 'call-101'}
      onSelectCall={(callId) => navigate(`/qualite/evaluations/${callId}`)}
      onNavigate={(path) => navigate(typeof path === 'string' && path.startsWith('/') ? path : `/${path}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const CoachingRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <CoachingView 
      onNavigate={(path) => navigate(typeof path === 'string' && path.startsWith('/') ? path : `/${path}`)}
      onSelectAgent={(agentId) => navigate(`/agents/${agentId}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const TrainingRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <TrainingView 
      onNavigate={(path) => navigate(typeof path === 'string' && path.startsWith('/') ? path : `/${path}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const AgentsRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <AgentProfileView 
      selectedAgentId={id || 'agent-1'}
      onSelectAgent={(agentId) => navigate(`/agents/${agentId}`)}
      onSelectCall={(callId) => navigate(`/appels/${callId}`)}
      onNavigate={(path) => navigate(typeof path === 'string' && path.startsWith('/') ? path : `/${path}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const TeamsRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <TeamsCampaignsView 
      defaultTab="TEAMS"
      onSelectAgent={(agentId) => navigate(`/agents/${agentId}`)}
      onNavigate={(path) => navigate(typeof path === 'string' && path.startsWith('/') ? path : `/${path}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const CampaignsRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <TeamsCampaignsView 
      defaultTab="CAMPAIGNS"
      onSelectAgent={(agentId) => navigate(`/agents/${agentId}`)}
      onNavigate={(path) => navigate(typeof path === 'string' && path.startsWith('/') ? path : `/${path}`)}
      currentRole={role || 'AGENT'}
    />
  );
};

const ReportsRouteWrapper: React.FC = () => {
  const { role } = useAuth();
  return <ReportsView currentRole={role || 'AGENT'} />;
};

const ExperimentLabRouteWrapper: React.FC = () => {
  const { role } = useAuth();
  return <ExperimentLabView currentRole={role || 'AGENT'} />;
};

const SettingsRouteWrapper: React.FC = () => {
  const { role } = useAuth();
  return <SettingsAuditView currentRole={role || 'AGENT'} />;
};

const UserManagementRouteWrapper: React.FC = () => {
  const { user } = useAuth();
  return <UserManagementView currentUserId={user?.id || ''} />;
};

// ─── Racine App ───────────────────────────────────────────────────────────────

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes Publiques */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/reset-password" element={<ResetPasswordView />} />

          {/* Onboarding Première Connexion */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingView />
              </ProtectedRoute>
            } 
          />

          {/* Routes Protégées sous Layout Principal */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardRouteWrapper />} />

            {/* Appels & Fiche Détail */}
            <Route path="/appels" element={<CallsRouteWrapper />} />
            <Route path="/appels/:id" element={<CallsRouteWrapper />} />

            {/* Transcriptions & Studio Audio */}
            <Route path="/transcriptions" element={<TranscriptionRouteWrapper />} />
            <Route path="/transcriptions/:id" element={<TranscriptionRouteWrapper />} />

            {/* Analyse IA */}
            <Route path="/analytics" element={<AnalyticsRouteWrapper />} />
            <Route path="/analytics/:id" element={<AnalyticsRouteWrapper />} />

            {/* Contrôle Qualité */}
            <Route path="/qualite" element={<QualityRouteWrapper />} />
            <Route path="/qualite/evaluations" element={<QualityRouteWrapper />} />
            <Route path="/qualite/evaluations/:id" element={<QualityRouteWrapper />} />

            {/* Coaching & Formation */}
            <Route path="/coaching" element={<CoachingRouteWrapper />} />
            <Route path="/coaching/:id" element={<CoachingRouteWrapper />} />
            <Route path="/formation" element={<TrainingRouteWrapper />} />
            <Route path="/formation/:id" element={<TrainingRouteWrapper />} />

            {/* Agents & Équipes & Campagnes */}
            <Route path="/agents" element={<AgentsRouteWrapper />} />
            <Route path="/agents/:id" element={<AgentsRouteWrapper />} />
            <Route path="/equipes" element={<TeamsRouteWrapper />} />
            <Route path="/equipes/:id" element={<TeamsRouteWrapper />} />
            <Route path="/campagnes" element={<CampaignsRouteWrapper />} />
            <Route path="/campagnes/:id" element={<CampaignsRouteWrapper />} />

            {/* Rapports & Expérimentation */}
            <Route path="/rapports" element={<ReportsRouteWrapper />} />
            <Route path="/experimentation" element={<ExperimentLabRouteWrapper />} />

            {/* Administration & Paramètres (RBAC Protégé) */}
            <Route 
              path="/parametres" 
              element={
                <RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'QA_MANAGER']}>
                  <SettingsRouteWrapper />
                </RoleGuard>
              } 
            />

            <Route 
              path="/admin/users" 
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <UserManagementRouteWrapper />
                </RoleGuard>
              } 
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
