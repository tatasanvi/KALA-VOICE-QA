// ============================================================================
// KALA VOICE QA — Définitions des Types & Modèles de Données
// Plateforme Intelligente d'Analyse Vocale, Qualité & Coaching (Mémoire Master IA)
// ============================================================================

export type UserRole = 
  | 'ADMIN'
  | 'MANAGER'
  | 'SUPERVISOR'
  | 'QA_MANAGER'
  | 'TRAINER'
  | 'AGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  supervisorId: string;
  supervisorName: string;
  description: string;
  memberCount: number;
  averageQualityScore: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'ENTRANT' | 'SORTANT';
  clientSector: string;
  targetQualityScore: number;
  activeAgentsCount: number;
  totalCallsCount: number;
  complianceRate: number;
  description: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  teamId: string;
  teamName: string;
  campaignId: string;
  campaignName: string;
  hireDate: string;
  seniority: string;
  status: 'ACTIF' | 'EN_COACHING' | 'EN_FORMATION' | 'CONGÉ';
  callsAnalyzedCount: number;
  averageQualityScore: number;
  monthlyScores: {
    month: string;
    score: number;
  }[];
  strengths: string[];
  improvementAxes: string[];
  assignedCoachingPlanId?: string;
  completedTrainingsCount: number;
  complianceRate: number;
}

export type NoiseLevel = 'FAIBLE' | 'MODÉRÉ' | 'SÉVÈRE' | 'CRITIQUE';

export interface AudioMetadata {
  id: string;
  filename: string;
  fileSizeBytes: number;
  durationSeconds: number;
  sampleRateHz: number;
  channels: number;
  snrDb: number; // Signal-to-Noise Ratio en dB
  estimatedNoiseLevel: NoiseLevel;
  noiseType: 'PLATEAU_CALL_CENTER' | 'GSM_COMPRESSION' | 'RUE_URBAIN' | 'ECHO_ACOUSTIQUE' | 'AUCUN';
  audioQualityScore: number; // / 100
  waveformSamples: number[]; // Tableau d'amplitudes normalisées (0.0 à 1.0)
  originalUrl?: string;
  denoisedUrl?: string;
}

export interface TranscriptionSegment {
  id: string;
  transcriptionId: string;
  speaker: 'AGENT' | 'CLIENT';
  speakerLabel: string;
  startTime: number; // secondes
  endTime: number; // secondes
  text: string;
  correctedText?: string;
  confidenceScore: number; // 0.0 à 1.0 (ex: 0.92)
  isNoisyPassage: boolean;
  noiseImpactLevel: 'AUCUN' | 'LÉGER' | 'MODÉRÉ' | 'FORT';
  hasBeenEdited?: boolean;
}

export interface Transcription {
  id: string;
  callId: string;
  audioFileId: string;
  versionNumber: number; // v1 = originale brute, v2+ = corrigée
  isLatest: boolean;
  asrModelUsed: string; // ex: "KALA-Denoiser+Whisper-Large-v3" ou "Baseline-Wav2Vec2"
  totalWords: number;
  processingTimeMs: number;
  globalConfidenceScore: number; // / 100
  noiseRobustnessScore: number; // / 100
  rawText: string;
  correctedText?: string;
  segments: TranscriptionSegment[];
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export type CallResolutionStatus = 'RÉSOLU' | 'EN_COURS' | 'NON_RÉSOLU' | 'ESCALADÉ';
export type SentimentType = 'POSITIF' | 'NEUTRE' | 'MITIGÉ' | 'NÉGATIF' | 'TRÈS_FRUSTRÉ';

export interface CallAnalytics {
  id: string;
  callId: string;
  summary: string;
  contactIntent: string;
  mainTopics: string[];
  keywords: string[];
  sentimentAgent: SentimentType;
  sentimentClient: SentimentType;
  sentimentTimeline: {
    minute: number;
    agentSentiment: number; // -1 à +1
    clientSentiment: number; // -1 à +1
  }[];
  objectionsDetected: string[];
  unresolvedIssues: string[];
  resolutionStatus: CallResolutionStatus;
  actionItemsRequested: string[];
  importantInformation: string[];
  criticalMoments: {
    timestamp: number;
    type: 'FRICTION' | 'OBJECTION' | 'INFORMATION_LEGALE' | 'HÉSITATION' | 'CONFUSION' | 'INTERRUPTION';
    description: string;
  }[];
  
  // Métriques de communication paralinguistiques
  agentTalkTimeSeconds: number;
  clientTalkTimeSeconds: number;
  talkToListenRatio: number; // ex: 1.15 (115% agent vs client)
  interruptionCount: number;
  totalSilenceSeconds: number;
  speechRateWpm: number; // Words Per Minute (Rythme)
  detectedCommunicationIssues: string[];
  
  // Règle d'explicabilité IA
  aiDisclaimer: string;
}

export interface Call {
  id: string;
  callNumber: string;
  agentId: string;
  agentName: string;
  teamId: string;
  campaignId: string;
  campaignName: string;
  customerPhoneMasked: string; // ex: +33 6 ** ** 42 19
  customerNameMasked: string; // ex: M. Laurent D*****
  callDate: string;
  durationSeconds: number;
  direction: 'ENTRANT' | 'SORTANT';
  callType: 'SUPPORT_TECHNIQUE' | 'RÉTENTION' | 'RÉCLAMATION' | 'COMMERCIAL' | 'ENQUÊTE';
  audioMetadata: AudioMetadata;
  transcription: Transcription;
  analytics: CallAnalytics;
  qualityEvaluationId?: string;
  qualityScore?: number;
  isUrgentReviewRequired: boolean;
  notes?: string;
}

export interface QualityCriterion {
  id: string;
  category: 'ACCUEIL' | 'RELATIONNEL' | 'TECHNIQUE_ET_PROCÉDURES' | 'RÉSOLUTION' | 'CONFORMITÉ' | 'CLÔTURE';
  categoryLabel: string;
  label: string;
  description: string;
  maxScore: number; // généralement 5 ou 10
  weight: number; // pondération en %
  isCritical: boolean; // Si critique échoué, alerte immédiate
}

export interface QualityEvaluationItem {
  id: string;
  criterionId: string;
  score: number; // Note accordée par l'humain ou l'IA
  aiProposedScore: number; // Suggestion calculée par l'IA
  aiConfidence: number;
  isAiAccepted: boolean; // True si le responsable a validé la proposition de l'IA
  comment: string;
  transcriptEvidenceQuotes: {
    segmentId: string;
    timestamp: number;
    quote: string;
    relevanceNote: string;
  }[];
}

export interface QualityEvaluation {
  id: string;
  callId: string;
  agentId: string;
  evaluatorId: string;
  evaluatorName: string;
  formTitle: string;
  overallScore: number; // / 100
  aiSuggestedScore: number; // / 100
  status: 'PROPOSITION_IA' | 'EN_COURS' | 'VALIDÉE_RESPONSABLE' | 'CONTESTÉE';
  items: QualityEvaluationItem[];
  strengths: string[];
  weaknesses: string[];
  potentialErrors: string[];
  unmetCriteriaCount: number;
  recommendations: string[];
  evaluatorFinalNotes: string;
  evaluatedAt: string;
  validatedAt?: string;
}

export interface CoachingObjective {
  id: string;
  title: string;
  description: string;
  targetCompetency: string;
  currentLevel: string;
  targetLevel: string;
  status: 'A_FAIRE' | 'EN_COURS' | 'VALIDÉ';
  suggestedExercises: string[];
}

export interface CoachingPlan {
  id: string;
  agentId: string;
  agentName: string;
  trainerId: string;
  trainerName: string;
  createdAt: string;
  targetCompletionDate: string;
  status: 'ACTIF' | 'EN_REVUE' | 'CLÔTURÉ';
  overallObjectiveSummary: string;
  strengthsSummary: string[];
  improvementAxesSummary: string[];
  objectives: CoachingObjective[];
  trainerNotes: string;
  nextSessionDate?: string;
  progressionPercentage: number;
}

export interface TrainingModule {
  id: string;
  code: string;
  title: string;
  category: 'RELATION_CLIENT' | 'GESTION_OBJECTIONS' | 'CONFORMITÉ_RGPD' | 'RÉSOLUTION_TECHNIQUE' | 'POSTURE_ÉCOUTE';
  durationMinutes: number;
  description: string;
  targetCompetencies: string[];
  interactiveSimulationsCount: number;
  difficultyLevel: 'DÉBUTANT' | 'INTERMÉDIAIRE' | 'AVANCÉ';
}

export interface TrainingSession {
  id: string;
  agentId: string;
  agentName: string;
  trainerId: string;
  trainerName: string;
  moduleId: string;
  moduleTitle: string;
  scheduledDate: string;
  status: 'PLANIFIÉE' | 'TERMINÉE' | 'ANNULÉE';
  scoreObtained?: number; // / 100
  preTrainingQualityScore: number; // Score QA avant formation
  postTrainingQualityScore?: number; // Score QA après formation
  upliftPercentage?: number; // Progression en %
  trainerFeedback: string;
  simulationExercisesCompleted: {
    title: string;
    score: number;
    passed: boolean;
  }[];
}

// ----------------------------------------------------------------------------
// MODÈLE DU DÉMONSTRATEUR D'EXPÉRIMENTATION SCIENTIFIQUE (MÉMOIRE DE MASTER)
// ----------------------------------------------------------------------------
export interface ExperimentConfiguration {
  id: string;
  name: string;
  category: 'BASELINE' | 'PRÉTRAITÉ' | 'MODÈLE_AMÉLIORÉ' | 'PIPELINE_COMPLET_KALA';
  audioPreprocessingMethod: string;
  asrModel: string;
  denoiserAlgorithm: string;
  postProcessingApplied: string;
  estimatedRtf: number; // Real-Time Factor (temps calcul / durée audio)
  averageWer: number; // Word Error Rate %
  averageCer: number; // Character Error Rate %
  snrImprovementDb: number; // Gain en SNR
  confidenceScoreAvg: number; // Confiance moyenne
}

export interface BenchmarkSample {
  id: string;
  sampleName: string;
  audioDurationSeconds: number;
  noiseType: string;
  inputSnrDb: number;
  groundTruthText: string;
  results: {
    configId: string;
    configName: string;
    predictedText: string;
    wer: number;
    cer: number;
    rtf: number;
    processingTimeMs: number;
    confidenceScore: number;
    wordSubstitutions: number;
    wordDeletions: number;
    wordInsertions: number;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'IMPORT_AUDIO' | 'CORRECTION_TRANSCRIPTION' | 'VALIDATION_QUALITE' | 'MODIFICATION_GRILLE' | 'CREATION_COACHING' | 'EXPORT_RAPPORT';
  targetResource: string;
  details: string;
  ipAddress: string;
}

export interface DashboardMetrics {
  totalCalls: number;
  analyzedCalls: number;
  transcriptionsCompleted: number;
  averageQualityScore: number;
  complianceRate: number;
  totalAgentsCount: number;
  totalTeamsCount: number;
  urgentReviewCallsCount: number;
  coachingNeededAgentsCount: number;
  averageProgressionPercentage: number;
}
