import { 
  User, Team, Campaign, Agent, Call, QualityCriterion, 
  QualityEvaluation, CoachingPlan, TrainingModule, TrainingSession, 
  AuditLogEntry, DashboardMetrics, UserRole, ExperimentConfiguration, BenchmarkSample,
  TeamNotification, CtiIntegrationConfig
} from '../types';
import { 
  INITIAL_USERS, INITIAL_CAMPAIGNS, INITIAL_TEAMS, INITIAL_AGENTS, 
  QUALITY_CRITERIA_LIST, INITIAL_CALLS, INITIAL_EVALUATIONS, 
  INITIAL_COACHING_PLANS, INITIAL_TRAINING_MODULES, INITIAL_TRAINING_SESSIONS, 
  INITIAL_AUDIT_LOGS, INITIAL_METRICS, SCIENTIFIC_EXPERIMENT_CONFIGS, BENCHMARK_SAMPLES 
} from '../data/initialData';

class StorageService {
  private users: User[];
  private currentUser: User;
  private campaigns: Campaign[];
  private teams: Team[];
  private agents: Agent[];
  private criteria: QualityCriterion[];
  private calls: Call[];
  private evaluations: QualityEvaluation[];
  private coachingPlans: CoachingPlan[];
  private trainingModules: TrainingModule[];
  private trainingSessions: TrainingSession[];
  private auditLogs: AuditLogEntry[];
  private metrics: DashboardMetrics;
  private experimentConfigs: ExperimentConfiguration[];
  private benchmarkSamples: BenchmarkSample[];
  private notifications: TeamNotification[];
  private ctiConfig: CtiIntegrationConfig;
  private listeners: (() => void)[] = [];

  constructor() {
    this.users = this.load('kala_users', INITIAL_USERS);
    this.currentUser = this.load('kala_current_user', INITIAL_USERS[3]); // Default: Claire Delattre (QA_MANAGER)
    this.campaigns = this.load('kala_campaigns', INITIAL_CAMPAIGNS);
    this.teams = this.load('kala_teams', INITIAL_TEAMS);
    this.agents = this.load('kala_agents', INITIAL_AGENTS);
    this.criteria = this.load('kala_criteria', QUALITY_CRITERIA_LIST);
    this.calls = this.load('kala_calls', INITIAL_CALLS);
    this.evaluations = this.load('kala_evaluations', INITIAL_EVALUATIONS);
    this.coachingPlans = this.load('kala_coaching_plans', INITIAL_COACHING_PLANS);
    this.trainingModules = this.load('kala_training_modules', INITIAL_TRAINING_MODULES);
    this.trainingSessions = this.load('kala_training_sessions', INITIAL_TRAINING_SESSIONS);
    this.auditLogs = this.load('kala_audit_logs', INITIAL_AUDIT_LOGS);
    this.metrics = this.load('kala_metrics', INITIAL_METRICS);
    this.experimentConfigs = this.load('kala_experiment_configs_v2', SCIENTIFIC_EXPERIMENT_CONFIGS);
    this.benchmarkSamples = this.load('kala_benchmark_samples_v2', BENCHMARK_SAMPLES);
    
    // Initialiser les notifications d'équipe
    this.notifications = this.load('kala_notifications', [
      {
        id: 'notif-1',
        type: 'URGENT_CALL',
        title: 'Appel critique en attente de revue QA',
        message: 'L\'appel CALL-2024-001 (Marc Vasseur) a déclenché une alerte conformité et nécessite une validation prioritaire.',
        timestamp: 'Il y a 10 min',
        read: false,
        targetId: 'call-101',
        targetView: 'calls',
        priority: 'HAUTE'
      },
      {
        id: 'notif-2',
        type: 'LOW_QUALITY',
        title: 'Score sous le seuil d\'alerte (<75%)',
        message: 'L\'évaluation de l\'appel CALL-2024-002 (Julie Mercier) a obtenu 68.5/100. Plan de coaching recommandé.',
        timestamp: 'Il y a 35 min',
        read: false,
        targetId: 'agent-2',
        targetView: 'coaching',
        priority: 'HAUTE'
      },
      {
        id: 'notif-3',
        type: 'TRAINING_DUE',
        title: 'Session de formation planifiée',
        message: 'Module MOD-REL : Traitement des objections & litiges prévu demain pour 3 conseillers.',
        timestamp: 'Hier',
        read: true,
        targetView: 'training',
        priority: 'MOYENNE'
      }
    ]);

    this.ctiConfig = this.load('kala_cti_config', {
      provider: 'GENESYS_CLOUD',
      endpointUrl: 'https://api.mypurecloud.de/api/v2/conversations/calls',
      apiKeyMasked: 'gns_sec_••••••••••••94f2',
      autoAnalyze: true,
      status: 'CONNECTÉ',
      lastPing: new Date().toLocaleTimeString()
    });
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignorer l'erreur de storage
    }
    return fallback;
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local storage plein ou indisponible
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }

  // --- Users & Roles ---
  public getUsers(): User[] { return this.users; }
  public getCurrentUser(): User { return this.currentUser; }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    this.save('kala_current_user', this.currentUser);
  }

  public createUser(data: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): User {
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
      lastLoginAt: undefined
    };
    this.users.push(newUser);
    this.save('kala_users', this.users);
    this.logAudit('CREATION_UTILISATEUR', `Utilisateur ${newUser.name}`, `Compte créé : ${newUser.email} | Rôle : ${newUser.role} | Dépt : ${newUser.department}`);
    return newUser;
  }

  public updateUser(updatedUser: User): void {
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index === -1) return;
    const prev = this.users[index];
    this.users[index] = updatedUser;
    this.save('kala_users', this.users);
    const changes: string[] = [];
    if (prev.role !== updatedUser.role) changes.push(`Rôle : ${prev.role} → ${updatedUser.role}`);
    if (prev.name !== updatedUser.name) changes.push(`Nom : ${prev.name} → ${updatedUser.name}`);
    if (prev.email !== updatedUser.email) changes.push(`Email : ${prev.email} → ${updatedUser.email}`);
    if (prev.isActive !== updatedUser.isActive) changes.push(`Statut : ${updatedUser.isActive ? 'Activé' : 'Désactivé'}`);
    this.logAudit('MODIFICATION_UTILISATEUR', `Utilisateur ${updatedUser.name}`, changes.length ? changes.join(' | ') : 'Informations mises à jour');
    // Sync currentUser if it's the same one
    if (this.currentUser.id === updatedUser.id) {
      this.currentUser = updatedUser;
      this.save('kala_current_user', this.currentUser);
    }
  }

  public deleteUser(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    if (user.id === this.currentUser.id) return; // Cannot delete self
    this.users = this.users.filter(u => u.id !== userId);
    this.save('kala_users', this.users);
    this.logAudit('SUPPRESSION_UTILISATEUR', `Utilisateur ${user.name}`, `Compte supprimé : ${user.email} | Rôle : ${user.role}`);
  }

  public toggleUserActive(userId: string): void {
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) return;
    if (this.users[index].id === this.currentUser.id) return; // Cannot deactivate self
    this.users[index] = { ...this.users[index], isActive: !this.users[index].isActive };
    this.save('kala_users', this.users);
    const u = this.users[index];
    this.logAudit('MODIFICATION_UTILISATEUR', `Utilisateur ${u.name}`, `Compte ${u.isActive ? 'activé' : 'désactivé'}`);
  }

  public setCurrentUserRole(role: UserRole): void {
    const matched = this.users.find(u => u.role === role);
    if (matched) {
      this.currentUser = matched;
      this.save('kala_current_user', this.currentUser);
      this.logAudit('CHANGEMENT_ROLE', 'Session utilisateur', `Rôle basculé vers ${role} (${matched.name})`);
    }
  }

  // --- Calls & Transcriptions ---
  public getCalls(): Call[] { return this.calls; }
  public getCallById(id: string): Call | undefined {
    return this.calls.find(c => c.id === id);
  }

  public updateCallTranscriptionSegment(
    callId: string, 
    segmentId: string, 
    correctedText: string
  ): void {
    const callIndex = this.calls.findIndex(c => c.id === callId);
    if (callIndex === -1) return;

    const call = { ...this.calls[callIndex] };
    const trans = { ...call.transcription };
    const segments = [...trans.segments];
    const segIndex = segments.findIndex(s => s.id === segmentId);

    if (segIndex !== -1) {
      segments[segIndex] = {
        ...segments[segIndex],
        correctedText,
        hasBeenEdited: true
      };

      // Si c'est la première correction, incrémenter la version
      if (trans.versionNumber === 1) {
        trans.versionNumber = 2;
      }
      trans.lastEditedBy = `${this.currentUser.name} (${this.currentUser.role})`;
      trans.lastEditedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      trans.segments = segments;
      trans.correctedText = segments.map(s => s.correctedText || s.text).join(' ');

      call.transcription = trans;
      this.calls[callIndex] = call;
      this.save('kala_calls', this.calls);

      this.logAudit(
        'CORRECTION_TRANSCRIPTION',
        `Appel ${call.callNumber}`,
        `Segment ${segmentId} corrigé manuellement par ${this.currentUser.name}`
      );
    }
  }

  public addCall(newCall: Call): void {
    this.calls.unshift(newCall);
    this.save('kala_calls', this.calls);
    this.logAudit('IMPORT_AUDIO', `Appel ${newCall.callNumber}`, `Nouvel enregistrement importé (${newCall.audioMetadata.filename})`);
  }

  // --- Quality Evaluations ---
  public getEvaluations(): QualityEvaluation[] { return this.evaluations; }
  public getEvaluationByCallId(callId: string): QualityEvaluation | undefined {
    return this.evaluations.find(e => e.callId === callId);
  }

  public saveEvaluation(evaluation: QualityEvaluation): void {
    const index = this.evaluations.findIndex(e => e.id === evaluation.id);
    if (index >= 0) {
      this.evaluations[index] = evaluation;
    } else {
      this.evaluations.push(evaluation);
    }
    this.save('kala_evaluations', this.evaluations);

    // Mettre à jour l'appel lié
    const callIndex = this.calls.findIndex(c => c.id === evaluation.callId);
    if (callIndex >= 0) {
      this.calls[callIndex].qualityScore = evaluation.overallScore;
      this.calls[callIndex].qualityEvaluationId = evaluation.id;
      this.save('kala_calls', this.calls);
    }

    this.logAudit(
      'VALIDATION_QUALITE',
      `Évaluation ${evaluation.id}`,
      `Score enregistré : ${evaluation.overallScore}/100 - Statut : ${evaluation.status}`
    );
  }

  // --- Criteria ---
  public getCriteria(): QualityCriterion[] { return this.criteria; }
  public updateCriterion(criterion: QualityCriterion): void {
    const index = this.criteria.findIndex(c => c.id === criterion.id);
    if (index >= 0) {
      this.criteria[index] = criterion;
      this.save('kala_criteria', this.criteria);
      this.logAudit('MODIFICATION_GRILLE', `Critère ${criterion.label}`, `Poids modifié à ${criterion.weight}%`);
    }
  }

  // --- Agents & Teams ---
  public getAgents(): Agent[] { return this.agents; }
  public getAgentById(id: string): Agent | undefined {
    return this.agents.find(a => a.id === id);
  }
  public getTeams(): Team[] { return this.teams; }
  public getCampaigns(): Campaign[] { return this.campaigns; }

  // --- Coaching & Training ---
  public getCoachingPlans(): CoachingPlan[] { return this.coachingPlans; }
  public getCoachingPlanByAgentId(agentId: string): CoachingPlan | undefined {
    return this.coachingPlans.find(cp => cp.agentId === agentId);
  }
  public saveCoachingPlan(plan: CoachingPlan): void {
    const index = this.coachingPlans.findIndex(cp => cp.id === plan.id);
    if (index >= 0) {
      this.coachingPlans[index] = plan;
    } else {
      this.coachingPlans.push(plan);
    }
    this.save('kala_coaching_plans', this.coachingPlans);
    this.logAudit('CREATION_COACHING', `Plan Agent ${plan.agentName}`, `Objectifs mis à jour`);
  }

  public getTrainingModules(): TrainingModule[] { return this.trainingModules; }
  public getTrainingSessions(): TrainingSession[] { return this.trainingSessions; }
  public addTrainingSession(session: TrainingSession): void {
    this.trainingSessions.push(session);
    this.save('kala_training_sessions', this.trainingSessions);
  }

  // --- Experiments & Benchmarks ---
  public getExperimentConfigs(): ExperimentConfiguration[] { return this.experimentConfigs; }
  public getBenchmarkSamples(): BenchmarkSample[] { return this.benchmarkSamples; }

  // --- Metrics & Audit ---
  public getMetrics(): DashboardMetrics { return this.metrics; }
  public getAuditLogs(): AuditLogEntry[] { return this.auditLogs; }

  public logAudit(action: AuditLogEntry['action'], targetResource: string, details: string): void {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userRole: this.currentUser.role,
      action,
      targetResource,
      details,
      ipAddress: '127.0.0.1 (Local)'
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    this.save('kala_audit_logs', this.auditLogs);
  }

  // --- Notifications Équipe ---
  public getNotifications(): TeamNotification[] { return this.notifications; }
  public getUnreadNotificationCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
  public markNotificationAsRead(id: string): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.save('kala_notifications', this.notifications);
      this.notify();
    }
  }
  public markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => { n.read = true; });
    this.save('kala_notifications', this.notifications);
    this.notify();
  }
  public addNotification(notification: Omit<TeamNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotif: TeamNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: "À l'instant",
      read: false
    };
    this.notifications.unshift(newNotif);
    this.save('kala_notifications', this.notifications);
    this.notify();
  }

  // --- CTI Téléphonie ---
  public getCtiConfig(): CtiIntegrationConfig { return this.ctiConfig; }
  public updateCtiConfig(config: Partial<CtiIntegrationConfig>): void {
    this.ctiConfig = { ...this.ctiConfig, ...config, lastPing: new Date().toLocaleTimeString() };
    this.save('kala_cti_config', this.ctiConfig);
    this.logAudit('IMPORT_AUDIO', 'Connecteur CTI', `Mise à jour configuration CTI : ${this.ctiConfig.provider} (${this.ctiConfig.status})`);
    this.notify();
  }

  // --- Campagnes CRUD & Import ---
  public addCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>): Campaign {
    const newCamp: Campaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    this.campaigns.push(newCamp);
    this.save('kala_campaigns', this.campaigns);
    this.logAudit('IMPORT_AUDIO', `Campagne ${newCamp.name}`, 'Nouvelle campagne créée');
    this.notify();
    return newCamp;
  }
  public updateCampaign(campaign: Campaign): void {
    const idx = this.campaigns.findIndex(c => c.id === campaign.id);
    if (idx !== -1) {
      this.campaigns[idx] = campaign;
      this.save('kala_campaigns', this.campaigns);
      this.logAudit('IMPORT_AUDIO', `Campagne ${campaign.name}`, 'Paramètres de campagne mis à jour');
      this.notify();
    }
  }

  public resetToFactoryDefaults(): void {
    localStorage.clear();
    this.users = INITIAL_USERS;
    this.currentUser = INITIAL_USERS[3];
    this.campaigns = INITIAL_CAMPAIGNS;
    this.teams = INITIAL_TEAMS;
    this.agents = INITIAL_AGENTS;
    this.criteria = QUALITY_CRITERIA_LIST;
    this.calls = INITIAL_CALLS;
    this.evaluations = INITIAL_EVALUATIONS;
    this.coachingPlans = INITIAL_COACHING_PLANS;
    this.trainingModules = INITIAL_TRAINING_MODULES;
    this.trainingSessions = INITIAL_TRAINING_SESSIONS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.metrics = INITIAL_METRICS;
    this.experimentConfigs = SCIENTIFIC_EXPERIMENT_CONFIGS;
    this.benchmarkSamples = BENCHMARK_SAMPLES;
    this.notify();
  }
}

export const storageService = new StorageService();
