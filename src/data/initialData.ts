import { 
  User, Team, Campaign, Agent, Call, QualityCriterion, 
  QualityEvaluation, CoachingPlan, TrainingModule, TrainingSession, 
  ExperimentConfiguration, BenchmarkSample, AuditLogEntry, DashboardMetrics
} from '../types';
import { generateCallsDataset } from './callsGenerator';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Alexandre Moreau',
    email: 'a.moreau@kalavoice.ai',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    department: 'Direction Informatique & IA',
    phone: '+33 1 42 68 00 01',
    isActive: true,
    createdAt: '2024-01-10',
    lastLoginAt: '2024-09-14 08:31'
  },
  {
    id: 'user-manager',
    name: 'Sophie Laurent',
    email: 's.laurent@kalavoice.ai',
    role: 'MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    department: 'Direction des Opérations',
    phone: '+33 1 42 68 00 02',
    isActive: true,
    createdAt: '2024-01-15',
    lastLoginAt: '2024-09-14 09:15'
  },
  {
    id: 'user-supervisor',
    name: 'Marc Vasseur',
    email: 'm.vasseur@kalavoice.ai',
    role: 'SUPERVISOR',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    department: 'Plateau Télécom',
    phone: '+33 1 42 68 00 03',
    isActive: true,
    createdAt: '2024-02-01',
    lastLoginAt: '2024-09-14 07:50'
  },
  {
    id: 'user-qa',
    name: 'Claire Delattre',
    email: 'c.delattre@kalavoice.ai',
    role: 'QA_MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    department: 'Assurance Qualité & Conformité',
    phone: '+33 1 42 68 00 04',
    isActive: true,
    createdAt: '2024-02-05',
    lastLoginAt: '2024-09-14 10:02'
  },
  {
    id: 'user-trainer',
    name: 'Patrick Simon',
    email: 'p.simon@kalavoice.ai',
    role: 'TRAINER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    department: 'Académie & Formation Métier',
    phone: '+33 1 42 68 00 05',
    isActive: true,
    createdAt: '2024-02-10',
    lastLoginAt: '2024-09-13 16:45'
  },
  {
    id: 'user-agent-1',
    name: 'Jean Dupont',
    email: 'j.dupont@kalavoice.ai',
    role: 'AGENT',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    department: 'Équipe Alpha - Service Fibre',
    phone: '+33 1 42 68 00 06',
    isActive: true,
    createdAt: '2024-03-01',
    lastLoginAt: '2024-09-14 08:00'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Prospection B2B — Télécom & Cloud Pro',
    type: 'SORTANT',
    clientSector: 'Télécommunications Professionnelles',
    targetQualityScore: 85,
    activeAgentsCount: 14,
    totalCallsCount: 1420,
    complianceRate: 94.2,
    description: 'Appels à froid auprès des dirigeants de PME : franchissement barrage secrétaire, pitch proposition de valeur et prise de RDV démo.',
    createdAt: '2024-01-15'
  },
  {
    id: 'camp-2',
    name: 'Prospection B2C — Audit Énergétique & Solaire',
    type: 'SORTANT',
    clientSector: 'Énergie & Éco-Rénovation',
    targetQualityScore: 88,
    activeAgentsCount: 10,
    totalCallsCount: 980,
    complianceRate: 96.5,
    description: 'Campagne de prospection sortante pour audit solaire : éligibilité aux aides d\'État, traitement des objections et fixation de RDV technicien.',
    createdAt: '2024-02-01'
  },
  {
    id: 'camp-3',
    name: 'Téléprospection B2B — Cybersécurité PME',
    type: 'SORTANT',
    clientSector: 'Logiciel & Cybersécurité',
    targetQualityScore: 82,
    activeAgentsCount: 8,
    totalCallsCount: 650,
    complianceRate: 91.8,
    description: 'Chasse sortante sur base qualifiée : identification du DSI/RSSI, qualification du parc et proposition d\'audit de vulnérabilité.',
    createdAt: '2024-02-15'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Équipe Alpha — Prospection B2B Télécom',
    supervisorId: 'user-supervisor',
    supervisorName: 'Marc Vasseur',
    description: 'Pôle spécialisé dans la chasse sortante à froid auprès des comptes professionnels et PME.',
    memberCount: 5,
    averageQualityScore: 84.4,
    createdAt: '2024-01-20'
  },
  {
    id: 'team-2',
    name: 'Équipe Beta — Prospection Solaire & Rénovation',
    supervisorId: 'user-supervisor',
    supervisorName: 'Karim Belkacem',
    description: 'Qualification téléphonique sortante et prise de rendez-vous pour audits énergétiques.',
    memberCount: 5,
    averageQualityScore: 86.8,
    createdAt: '2024-01-20'
  },
  {
    id: 'team-3',
    name: 'Équipe Gamma — Téléprospection Cybersécurité',
    supervisorId: 'user-supervisor',
    supervisorName: 'Sophie Laurent',
    description: 'Chasse B2B sur comptes PME : détection d\'opportunités et qualification de leads.',
    memberCount: 5,
    averageQualityScore: 83.2,
    createdAt: '2024-02-15'
  },
  {
    id: 'team-4',
    name: 'Équipe Delta — Chasse & Qualification Télécom',
    supervisorId: 'user-supervisor',
    supervisorName: 'Hélène Mercier',
    description: 'Prospection sortante active, franchissement de barrages et prise de rendez-vous qualifiés.',
    memberCount: 5,
    averageQualityScore: 85.5,
    createdAt: '2024-02-01'
  }
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    userId: 'user-agent-1',
    name: 'Jean Dupont',
    email: 'j.dupont@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-1',
    teamName: 'Équipe Alpha — Relations Clients & Fibre',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2023-09-01',
    seniority: '18 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 142,
    averageQualityScore: 84.0,
    monthlyScores: [
      { month: 'Janvier', score: 71 },
      { month: 'Février', score: 76 },
      { month: 'Mars', score: 81 },
      { month: 'Avril', score: 84 }
    ],
    strengths: [
      'Bonne écoute active et empathie',
      'Bonne maîtrise du script d\'accueil',
      'Excellente courtoisie avec les clients'
    ],
    improvementAxes: [
      'Gestion des objections tarifaires',
      'Reformulation systématique du problème',
      'Réduction des interruptions de parole'
    ],
    assignedCoachingPlanId: 'coach-plan-1',
    completedTrainingsCount: 3,
    complianceRate: 92.5
  },
  {
    id: 'agent-2',
    userId: 'user-agent-2',
    name: 'Koffi Mensah',
    email: 'k.mensah@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-4',
    teamName: 'Équipe Phénix — Rétention & Sauvetage',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2023-02-15',
    seniority: '14 mois',
    status: 'EN_COACHING',
    callsAnalyzedCount: 118,
    averageQualityScore: 81.0,
    monthlyScores: [
      { month: 'Janvier', score: 68 },
      { month: 'Février', score: 72 },
      { month: 'Mars', score: 76 },
      { month: 'Avril', score: 81 }
    ],
    strengths: [
      'Courtoisie exemplaire et phraséologie posée',
      'Clôture d\'appel soignée et prise de congé chaleureuse',
      'Patience remarquable face aux clients mécontents'
    ],
    improvementAxes: [
      'Gestion des objections',
      'Reformulation',
      'Respect du script'
    ],
    assignedCoachingPlanId: 'coach-plan-koffi',
    completedTrainingsCount: 3,
    complianceRate: 91.5
  },
  {
    id: 'agent-3',
    userId: 'user-agent-3',
    name: 'Sarah Benali',
    email: 's.benali@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-2',
    teamName: 'Équipe Beta — Assurance Auto & Habitation',
    campaignId: 'camp-2',
    campaignName: 'Assurance Auto & Habitation — Sinistres',
    hireDate: '2022-04-15',
    seniority: '2 ans',
    status: 'ACTIF',
    callsAnalyzedCount: 230,
    averageQualityScore: 92.0,
    monthlyScores: [
      { month: 'Janvier', score: 85 },
      { month: 'Février', score: 87 },
      { month: 'Mars', score: 89 },
      { month: 'Avril', score: 92 }
    ],
    strengths: ['Excellente négociation', 'Résolution immédiate (FCR)', 'Clarté technique'],
    improvementAxes: ['Optimisation DMT', 'Synthèse rapide'],
    completedTrainingsCount: 5,
    complianceRate: 98.0
  },
  {
    id: 'agent-4',
    userId: 'user-agent-4',
    name: 'Thomas Leroux',
    email: 't.leroux@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-1',
    teamName: 'Équipe Alpha — Relations Clients & Fibre',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2023-05-10',
    seniority: '11 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 95,
    averageQualityScore: 79.5,
    monthlyScores: [
      { month: 'Janvier', score: 70 },
      { month: 'Février', score: 73 },
      { month: 'Mars', score: 77 },
      { month: 'Avril', score: 80 }
    ],
    strengths: ['Bonne élocution', 'Maîtrise de l\'outil CRM'],
    improvementAxes: ['Gestion du stress', 'Traitement des réclamations'],
    completedTrainingsCount: 2,
    complianceRate: 89.0
  },
  {
    id: 'agent-5',
    userId: 'user-agent-5',
    name: 'Amina Traoré',
    email: 'a.traore@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-3',
    teamName: 'Équipe Gamma — Énergie & Facturation Verte',
    campaignId: 'camp-3',
    campaignName: 'Énergie & Facturation Verte — Service Client',
    hireDate: '2022-11-01',
    seniority: '17 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 164,
    averageQualityScore: 87.0,
    monthlyScores: [
      { month: 'Janvier', score: 80 },
      { month: 'Février', score: 82 },
      { month: 'Mars', score: 85 },
      { month: 'Avril', score: 87 }
    ],
    strengths: ['Pédagogie tarifaire', 'Empathie naturelle', 'Clôture soignée'],
    improvementAxes: ['Proactivité sur les options d\'économie d\'énergie'],
    completedTrainingsCount: 4,
    complianceRate: 96.0
  },
  {
    id: 'agent-6',
    userId: 'user-agent-6',
    name: 'Lucas Bernard',
    email: 'l.bernard@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-2',
    teamName: 'Équipe Beta — Assurance Auto & Habitation',
    campaignId: 'camp-2',
    campaignName: 'Assurance Auto & Habitation — Sinistres',
    hireDate: '2023-01-20',
    seniority: '15 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 128,
    averageQualityScore: 85.5,
    monthlyScores: [
      { month: 'Janvier', score: 75 },
      { month: 'Février', score: 79 },
      { month: 'Mars', score: 83 },
      { month: 'Avril', score: 86 }
    ],
    strengths: ['Rigueur procédurale', 'Clarté sur les franchises'],
    improvementAxes: ['Chaleur de l\'accueil'],
    completedTrainingsCount: 3,
    complianceRate: 94.0
  },
  {
    id: 'agent-7',
    userId: 'user-agent-7',
    name: 'Fatou Diallo',
    email: 'f.diallo@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-4',
    teamName: 'Équipe Phénix — Rétention & Sauvetage',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2022-08-15',
    seniority: '20 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 190,
    averageQualityScore: 89.0,
    monthlyScores: [
      { month: 'Janvier', score: 82 },
      { month: 'Février', score: 85 },
      { month: 'Mars', score: 87 },
      { month: 'Avril', score: 89 }
    ],
    strengths: ['Taux de rétention exceptionnel (88%)', 'Excellente négociation'],
    improvementAxes: ['Respect des temps de mise en attente'],
    completedTrainingsCount: 4,
    complianceRate: 97.0
  },
  {
    id: 'agent-8',
    userId: 'user-agent-8',
    name: 'Maxime Dubois',
    email: 'm.dubois@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-3',
    teamName: 'Équipe Gamma — Énergie & Facturation Verte',
    campaignId: 'camp-3',
    campaignName: 'Énergie & Facturation Verte — Service Client',
    hireDate: '2023-10-01',
    seniority: '6 mois',
    status: 'EN_FORMATION',
    callsAnalyzedCount: 74,
    averageQualityScore: 76.0,
    monthlyScores: [
      { month: 'Janvier', score: 65 },
      { month: 'Février', score: 69 },
      { month: 'Mars', score: 73 },
      { month: 'Avril', score: 76 }
    ],
    strengths: ['Bonne volonté', 'Assiduité'],
    improvementAxes: ['Maîtrise des offres heures creuses', 'Reformulation'],
    completedTrainingsCount: 2,
    complianceRate: 87.0
  },
  {
    id: 'agent-9',
    userId: 'user-agent-9',
    name: 'Chloé Martin',
    email: 'c.martin@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-1',
    teamName: 'Équipe Alpha — Relations Clients & Fibre',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2023-03-01',
    seniority: '13 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 135,
    averageQualityScore: 83.5,
    monthlyScores: [
      { month: 'Janvier', score: 76 },
      { month: 'Février', score: 79 },
      { month: 'Mars', score: 81 },
      { month: 'Avril', score: 84 }
    ],
    strengths: ['Diagnostic réseau précis', 'Courtoisie constante'],
    improvementAxes: ['Prise de congé plus dynamique'],
    completedTrainingsCount: 3,
    complianceRate: 93.0
  },
  {
    id: 'agent-10',
    userId: 'user-agent-10',
    name: 'Idriss Ndiaye',
    email: 'i.ndiaye@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-2',
    teamName: 'Équipe Beta — Assurance Auto & Habitation',
    campaignId: 'camp-2',
    campaignName: 'Assurance Auto & Habitation — Sinistres',
    hireDate: '2022-06-01',
    seniority: '22 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 210,
    averageQualityScore: 90.0,
    monthlyScores: [
      { month: 'Janvier', score: 84 },
      { month: 'Février', score: 86 },
      { month: 'Mars', score: 88 },
      { month: 'Avril', score: 90 }
    ],
    strengths: ['Empathie élevée', 'Respect scrupuleux du RGPD'],
    improvementAxes: ['Raccourcir la vérification de dossier'],
    completedTrainingsCount: 4,
    complianceRate: 98.5
  },
  {
    id: 'agent-11',
    userId: 'user-agent-11',
    name: 'Camille Robert',
    email: 'c.robert@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-3',
    teamName: 'Équipe Gamma — Énergie & Facturation Verte',
    campaignId: 'camp-3',
    campaignName: 'Énergie & Facturation Verte — Service Client',
    hireDate: '2023-07-15',
    seniority: '9 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 104,
    averageQualityScore: 81.0,
    monthlyScores: [
      { month: 'Janvier', score: 72 },
      { month: 'Février', score: 75 },
      { month: 'Mars', score: 78 },
      { month: 'Avril', score: 81 }
    ],
    strengths: ['Rapidité de saisie', 'Écoute attentive'],
    improvementAxes: ['Gestion des contestations d\'échéancier'],
    completedTrainingsCount: 2,
    complianceRate: 91.0
  },
  {
    id: 'agent-12',
    userId: 'user-agent-12',
    name: 'Julien Petit',
    email: 'j.petit@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-4',
    teamName: 'Équipe Phénix — Rétention & Sauvetage',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2023-04-10',
    seniority: '12 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 140,
    averageQualityScore: 84.5,
    monthlyScores: [
      { month: 'Janvier', score: 75 },
      { month: 'Février', score: 78 },
      { month: 'Mars', score: 82 },
      { month: 'Avril', score: 85 }
    ],
    strengths: ['Persuasion commerciale', 'Dynamisme'],
    improvementAxes: ['Diminuer le débit verbal'],
    completedTrainingsCount: 3,
    complianceRate: 93.5
  },
  {
    id: 'agent-13',
    userId: 'user-agent-13',
    name: 'Aïssatou Sow',
    email: 'a.sow@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-1',
    teamName: 'Équipe Alpha — Relations Clients & Fibre',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2022-09-01',
    seniority: '19 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 180,
    averageQualityScore: 88.0,
    monthlyScores: [
      { month: 'Janvier', score: 82 },
      { month: 'Février', score: 84 },
      { month: 'Mars', score: 86 },
      { month: 'Avril', score: 88 }
    ],
    strengths: ['Pédagogie remarquable', 'Calme olympien'],
    improvementAxes: ['Systématiser la proposition de l\'enquête satisfaction'],
    completedTrainingsCount: 4,
    complianceRate: 96.5
  },
  {
    id: 'agent-14',
    userId: 'user-agent-14',
    name: 'David Moreau',
    email: 'd.moreau@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-2',
    teamName: 'Équipe Beta — Assurance Auto & Habitation',
    campaignId: 'camp-2',
    campaignName: 'Assurance Auto & Habitation — Sinistres',
    hireDate: '2023-08-01',
    seniority: '8 mois',
    status: 'EN_COACHING',
    callsAnalyzedCount: 82,
    averageQualityScore: 78.0,
    monthlyScores: [
      { month: 'Janvier', score: 68 },
      { month: 'Février', score: 72 },
      { month: 'Mars', score: 75 },
      { month: 'Avril', score: 78 }
    ],
    strengths: ['Motivation', 'Rigueur administrative'],
    improvementAxes: ['Gestion des clients sous le coup de l\'émotion'],
    completedTrainingsCount: 2,
    complianceRate: 88.5
  },
  {
    id: 'agent-15',
    userId: 'user-agent-15',
    name: 'Élodie Roux',
    email: 'e.roux@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-3',
    teamName: 'Équipe Gamma — Énergie & Facturation Verte',
    campaignId: 'camp-3',
    campaignName: 'Énergie & Facturation Verte — Service Client',
    hireDate: '2022-03-15',
    seniority: '2 ans',
    status: 'ACTIF',
    callsAnalyzedCount: 220,
    averageQualityScore: 91.5,
    monthlyScores: [
      { month: 'Janvier', score: 87 },
      { month: 'Février', score: 89 },
      { month: 'Mars', score: 90 },
      { month: 'Avril', score: 92 }
    ],
    strengths: ['Excellente maîtrise technique Linky', 'Sens de la négociation'],
    improvementAxes: ['Partager ses bonnes pratiques en atelier de co-développement'],
    completedTrainingsCount: 5,
    complianceRate: 98.0
  },
  {
    id: 'agent-16',
    userId: 'user-agent-16',
    name: 'Ousmane Koné',
    email: 'o.kone@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-4',
    teamName: 'Équipe Phénix — Rétention & Sauvetage',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2023-06-15',
    seniority: '10 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 112,
    averageQualityScore: 82.0,
    monthlyScores: [
      { month: 'Janvier', score: 73 },
      { month: 'Février', score: 76 },
      { month: 'Mars', score: 79 },
      { month: 'Avril', score: 82 }
    ],
    strengths: ['Clarté des propositions', 'Esprit d\'équipe'],
    improvementAxes: ['Reformulation avant annonce tarifaire'],
    completedTrainingsCount: 3,
    complianceRate: 92.0
  },
  {
    id: 'agent-17',
    userId: 'user-agent-17',
    name: 'Léa Fournier',
    email: 'l.fournier@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-1',
    teamName: 'Équipe Alpha — Relations Clients & Fibre',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2023-02-01',
    seniority: '14 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 145,
    averageQualityScore: 85.0,
    monthlyScores: [
      { month: 'Janvier', score: 77 },
      { month: 'Février', score: 80 },
      { month: 'Mars', score: 83 },
      { month: 'Avril', score: 85 }
    ],
    strengths: ['Sourire téléphonique perceptible', 'Reformulation systématique'],
    improvementAxes: ['Raccourcir la recherche dans la base de connaissances'],
    completedTrainingsCount: 3,
    complianceRate: 94.0
  },
  {
    id: 'agent-18',
    userId: 'user-agent-18',
    name: 'Nicolas Girard',
    email: 'n.girard@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-2',
    teamName: 'Équipe Beta — Assurance Auto & Habitation',
    campaignId: 'camp-2',
    campaignName: 'Assurance Auto & Habitation — Sinistres',
    hireDate: '2022-12-01',
    seniority: '16 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 155,
    averageQualityScore: 86.0,
    monthlyScores: [
      { month: 'Janvier', score: 78 },
      { month: 'Février', score: 81 },
      { month: 'Mars', score: 84 },
      { month: 'Avril', score: 86 }
    ],
    strengths: ['Rigueur contractuelle', 'Transmission rapide aux experts'],
    improvementAxes: ['Personnalisation de la prise de congé'],
    completedTrainingsCount: 4,
    complianceRate: 95.5
  },
  {
    id: 'agent-19',
    userId: 'user-agent-19',
    name: 'Myriam Khelifi',
    email: 'm.khelifi@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-3',
    teamName: 'Équipe Gamma — Énergie & Facturation Verte',
    campaignId: 'camp-3',
    campaignName: 'Énergie & Facturation Verte — Service Client',
    hireDate: '2023-09-15',
    seniority: '7 mois',
    status: 'EN_FORMATION',
    callsAnalyzedCount: 68,
    averageQualityScore: 77.0,
    monthlyScores: [
      { month: 'Janvier', score: 66 },
      { month: 'Février', score: 70 },
      { month: 'Mars', score: 74 },
      { month: 'Avril', score: 77 }
    ],
    strengths: ['Grande écoute', 'Courtoisie constante'],
    improvementAxes: ['Gestion des objections sur les tarifs indexés'],
    completedTrainingsCount: 2,
    complianceRate: 89.0
  },
  {
    id: 'agent-20',
    userId: 'user-agent-20',
    name: 'Antoine Mercier',
    email: 'a.mercier@kalavoice.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    teamId: 'team-4',
    teamName: 'Équipe Phénix — Rétention & Sauvetage',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    hireDate: '2022-05-10',
    seniority: '23 mois',
    status: 'ACTIF',
    callsAnalyzedCount: 205,
    averageQualityScore: 91.0,
    monthlyScores: [
      { month: 'Janvier', score: 85 },
      { month: 'Février', score: 87 },
      { month: 'Mars', score: 89 },
      { month: 'Avril', score: 91 }
    ],
    strengths: ['Leadership', 'Négociation complexe', 'Excellence relationnelle'],
    improvementAxes: ['Animation d\'ateliers de tutorat'],
    completedTrainingsCount: 5,
    complianceRate: 98.0
  }
];

export const QUALITY_CRITERIA_LIST: QualityCriterion[] = [
  {
    id: 'crit-1',
    category: 'ACCUEIL',
    categoryLabel: 'Accueil & Présentation',
    label: 'Accueil & Salutation',
    description: 'Salutation chaleureuse, déclin de l\'identité et de la société conformément au script.',
    maxScore: 10,
    weight: 5,
    isCritical: false
  },
  {
    id: 'crit-2',
    category: 'ACCUEIL',
    categoryLabel: 'Accueil & Présentation',
    label: 'Identification & Authentification',
    description: 'Vérification scrupuleuse de l\'identité de l\'appelant (nom, code postal, numéro client).',
    maxScore: 10,
    weight: 10,
    isCritical: true
  },
  {
    id: 'crit-3',
    category: 'RELATIONNEL',
    categoryLabel: 'Posture & Écoute',
    label: 'Compréhension du besoin',
    description: 'Questionnement ouvert pour cerner précisément la problématique du client.',
    maxScore: 10,
    weight: 10,
    isCritical: false
  },
  {
    id: 'crit-4',
    category: 'RELATIONNEL',
    categoryLabel: 'Posture & Écoute',
    label: 'Écoute active',
    description: 'Absence d\'inattention, relances pertinentes, régulateurs conversationnels adaptés.',
    maxScore: 10,
    weight: 8,
    isCritical: false
  },
  {
    id: 'crit-5',
    category: 'RELATIONNEL',
    categoryLabel: 'Posture & Écoute',
    label: 'Reformulation de la demande',
    description: 'Validation explicite de la demande avant de proposer une démarche ou une solution.',
    maxScore: 10,
    weight: 7,
    isCritical: false
  },
  {
    id: 'crit-6',
    category: 'TECHNIQUE_ET_PROCÉDURES',
    categoryLabel: 'Maîtrise Opérationnelle',
    label: 'Respect du script',
    description: 'Utilisation des formulations recommandées sans lecture robotique.',
    maxScore: 10,
    weight: 7,
    isCritical: false
  },
  {
    id: 'crit-7',
    category: 'TECHNIQUE_ET_PROCÉDURES',
    categoryLabel: 'Maîtrise Opérationnelle',
    label: 'Exactitude des informations',
    description: 'Délivrance d\'informations contractuelles, techniques ou tarifaires 100% véridiques.',
    maxScore: 10,
    weight: 10,
    isCritical: true
  },
  {
    id: 'crit-8',
    category: 'TECHNIQUE_ET_PROCÉDURES',
    categoryLabel: 'Maîtrise Opérationnelle',
    label: 'Respect des procédures',
    description: 'Application conforme des guides métiers et des règles d\'escalade.',
    maxScore: 10,
    weight: 8,
    isCritical: false
  },
  {
    id: 'crit-9',
    category: 'TECHNIQUE_ET_PROCÉDURES',
    categoryLabel: 'Maîtrise Opérationnelle',
    label: 'Gestion des objections',
    description: 'Capacité à déminer les réticences sans agressivité et avec des arguments factuels.',
    maxScore: 10,
    weight: 10,
    isCritical: false
  },
  {
    id: 'crit-10',
    category: 'RELATIONNEL',
    categoryLabel: 'Posture & Écoute',
    label: 'Qualité de communication & Rythme',
    description: 'Élocution claire, débit posé, courtoisie constante, absence d\'interruptions agressives.',
    maxScore: 10,
    weight: 7,
    isCritical: false
  },
  {
    id: 'crit-11',
    category: 'RÉSOLUTION',
    categoryLabel: 'Traitement & Résolution',
    label: 'Résolution du problème',
    description: 'Réponse concrète apportée, accord obtenu ou engagement d\'action daté.',
    maxScore: 10,
    weight: 10,
    isCritical: false
  },
  {
    id: 'crit-12',
    category: 'CONFORMITÉ',
    categoryLabel: 'Légal & Conformité',
    label: 'Conformité légale & RGPD',
    description: 'Notification d\'enregistrement, recueil des consentements obligatoires.',
    maxScore: 10,
    weight: 5,
    isCritical: true
  },
  {
    id: 'crit-13',
    category: 'CLÔTURE',
    categoryLabel: 'Clôture de l\'appel',
    label: 'Clôture & Prise de congé',
    description: 'Vérification de la satisfaction ("Ai-je répondu à toutes vos questions ?"), salutation courtoise.',
    maxScore: 10,
    weight: 3,
    isCritical: false
  }
];

// ----------------------------------------------------------------------------
// APPELS EXEMPLES AVEC TRANSCRIPTIONS, SEGMENTS BRUITÉS & ANALYSES
// ----------------------------------------------------------------------------
export const INITIAL_CALLS: Call[] = [
  {
    id: 'call-101',
    callNumber: 'OUT-2024-0412-8821',
    agentId: 'agent-1',
    agentName: 'Jean Dupont',
    teamId: 'team-1',
    campaignId: 'camp-1',
    campaignName: 'Prospection B2B — Télécom & Cloud Pro',
    customerPhoneMasked: '+33 1 •• •• 42 19',
    customerNameMasked: 'M. Laurent Dubois (Gérant BTP)',
    callDate: '2024-04-12 10:14',
    durationSeconds: 125,
    direction: 'SORTANT',
    callType: 'PROSPECTION',
    status: 'EVALUE',
    audioMetadata: {
      id: 'audio-101',
      filename: 'rec_outbound_b2b_prospect_dubois.wav',
      fileSizeBytes: 2450000,
      durationSeconds: 125,
      sampleRateHz: 16000,
      channels: 1,
      snrDb: 13.8, // Bruit ambiant de plateau de prospection sortante
      estimatedNoiseLevel: 'MODÉRÉ',
      noiseType: 'PLATEAU_CALL_CENTER',
      audioQualityScore: 78,
      waveformSamples: [
        0.1, 0.4, 0.6, 0.8, 0.5, 0.3, 0.1, 0.2, 0.7, 0.9, 0.6, 0.4, 0.2, 0.3, 0.5,
        0.8, 0.6, 0.2, 0.1, 0.5, 0.8, 0.9, 0.7, 0.3, 0.2, 0.6, 0.8, 0.5, 0.3, 0.1,
        0.4, 0.7, 0.5, 0.3, 0.8, 0.9, 0.6, 0.2, 0.4, 0.7, 0.6, 0.3, 0.1, 0.5, 0.7
      ]
    },
    transcription: {
      id: 'trans-101',
      callId: 'call-101',
      audioFileId: 'audio-101',
      versionNumber: 2,
      isLatest: true,
      asrModelUsed: 'Whisper-Large-v3 + DeepFilterNet3',
      totalWords: 310,
      processingTimeMs: 1120,
      globalConfidenceScore: 91,
      noiseRobustnessScore: 88,
      rawText: "Bonjour Jean Dupont société KALA Télécom Pro. Je souhaite joindre la personne en charge des télécoms et du cloud s'il vous plaît... Bonjour oui c'est moi que puis-je faire pour vous ? Bonjour M. Dubois, je vous contacte directement car nous accompagnons les PME de votre secteur dans la modernisation de leur téléphonie d'entreprise...",
      correctedText: "Bonjour, Jean Dupont société KALA Télécom Pro. Je souhaite joindre la personne en charge des télécoms et du cloud s'il vous plaît... Bonjour oui c'est moi, que puis-je faire pour vous ? Bonjour M. Dubois, je vous contacte directement car nous accompagnons les PME de votre secteur dans la modernisation de leur téléphonie d'entreprise...",
      createdAt: '2024-04-12 10:16',
      lastEditedBy: 'Claire Delattre (QA)',
      lastEditedAt: '2024-04-12 11:30',
      segments: [
        {
          id: 'seg-1',
          transcriptionId: 'trans-101',
          speaker: 'AGENT',
          speakerLabel: 'Conseiller (Jean Dupont)',
          startTime: 0.5,
          endTime: 4.8,
          text: "Bonjour, Jean Dupont société KALA Télécom Pro. Je souhaiterais échanger avec le responsable informatique ou télécom s'il vous plaît.",
          confidenceScore: 0.96,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-2',
          transcriptionId: 'trans-101',
          speaker: 'CLIENT',
          speakerLabel: 'Prospect (M. Dubois - Gérant)',
          startTime: 5.2,
          endTime: 10.4,
          text: "Bonjour, c'est moi-même, Laurent Dubois. C'est à quel sujet ? Je suis un peu pressé ce matin.",
          confidenceScore: 0.93,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-3',
          transcriptionId: 'trans-101',
          speaker: 'AGENT',
          speakerLabel: 'Conseiller (Jean Dupont)',
          startTime: 11.0,
          endTime: 18.2,
          text: "Merci M. Dubois. Je vous contacte car nous accompagnons les entreprises de votre secteur pour réduire de 30% les coûts de flotte mobile et standard VoIP.",
          confidenceScore: 0.94,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-4',
          transcriptionId: 'trans-101',
          speaker: 'CLIENT',
          speakerLabel: 'Prospect (M. Dubois - Gérant)',
          startTime: 18.8,
          endTime: 26.5,
          text: "Écoutez nous sommes déjà sous contrat avec notre opérateur historique et on n'a vraiment pas le temps de changer nos installations.",
          confidenceScore: 0.89,
          isNoisyPassage: true,
          noiseImpactLevel: 'LÉGER'
        },
        {
          id: 'seg-5',
          transcriptionId: 'trans-101',
          speaker: 'AGENT',
          speakerLabel: 'Conseiller (Jean Dupont)',
          startTime: 27.1,
          endTime: 38.0,
          text: "Je comprends tout à fait votre fidélité. Notre démarche ne nécessite aucun changement matériel : nous auditons simplement vos lignes actuelles pour vous transmettre un benchmark comparatif.",
          confidenceScore: 0.92,
          isNoisyPassage: true,
          noiseImpactLevel: 'MODÉRÉ'
        },
        {
          id: 'seg-6',
          transcriptionId: 'trans-101',
          speaker: 'CLIENT',
          speakerLabel: 'Prospect (M. Dubois - Gérant)',
          startTime: 38.6,
          endTime: 46.2,
          text: "D'accord, et combien de temps prendrait cette présentation ? Je ne veux pas bloquer mes équipes une demi-journée.",
          confidenceScore: 0.91,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-7',
          transcriptionId: 'trans-101',
          speaker: 'AGENT',
          speakerLabel: 'Conseiller (Jean Dupont)',
          startTime: 46.8,
          endTime: 58.5,
          text: "Exactement 15 minutes en visioconférence. Nous vous présentons les économies potentielles identifiées, et vous restez totalement libre de donner suite ou non.",
          confidenceScore: 0.86,
          isNoisyPassage: true,
          noiseImpactLevel: 'FORT',
          correctedText: "Exactement 15 minutes en visioconférence. Nous vous présentons les économies potentielles identifiées, et vous restez totalement libre de donner suite ou non."
        },
        {
          id: 'seg-8',
          transcriptionId: 'trans-101',
          speaker: 'CLIENT',
          speakerLabel: 'Prospect (M. Dubois - Gérant)',
          startTime: 59.2,
          endTime: 68.0,
          text: "Bon, 15 minutes ça me semble raisonnable. Pouvez-vous me proposer un créneau mardi prochain vers 14h30 ?",
          confidenceScore: 0.94,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-9',
          transcriptionId: 'trans-101',
          speaker: 'AGENT',
          speakerLabel: 'Conseiller (Jean Dupont)',
          startTime: 68.5,
          endTime: 78.0,
          text: "Mardi 14h30 c'est parfait. Je vous envoie immédiatement l'invitation sur votre adresse e-mail professionnelle. C'est bien l.dubois@groupe-btp.fr ?",
          confidenceScore: 0.95,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-10',
          transcriptionId: 'trans-101',
          speaker: 'CLIENT',
          speakerLabel: 'Prospect (M. Dubois - Gérant)',
          startTime: 78.5,
          endTime: 83.2,
          text: "Oui c'est bien ça. Envoyez l'invitation et je la validerai dans la journée.",
          confidenceScore: 0.96,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-11',
          transcriptionId: 'trans-101',
          speaker: 'AGENT',
          speakerLabel: 'Conseiller (Jean Dupont)',
          startTime: 83.8,
          endTime: 91.0,
          text: "C'est envoyé M. Dubois. Je vous remercie pour votre accueil et vous souhaite une excellente journée. À mardi !",
          confidenceScore: 0.97,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        }
      ]
    },
    analytics: {
      id: 'analytics-101',
      callId: 'call-101',
      summary: "Appel à froid de prospection B2B. Le conseiller Jean Dupont contacte le gérant M. Dubois. Après avoir désamorcé l'objection initiale liée à l'engagement auprès de l'opérateur historique, le conseiller présente la valeur d'un audit de réduction des coûts de 15 minutes sans engagement et décroche un rendez-vous qualifié fixé à mardi 14h30.",
      contactIntent: "Prospection sortante B2B : Franchissement objection, pitch télécom cloud et prise de RDV",
      mainTopics: [
        "Prospection sortante B2B",
        "Franchissement objection opérateur en place",
        "Proposition d'audit comparatif sans engagement",
        "Prise de rendez-vous qualifié (Mardi 14h30)"
      ],
      keywords: ["Prospection", "Télécom Pro", "Flotte mobile", "VoIP", "Audit gratuit", "Rendez-vous démo"],
      sentimentAgent: 'POSITIF',
      sentimentClient: 'POSITIF',
      sentimentTimeline: [
        { minute: 0.2, agentSentiment: 0.7, clientSentiment: -0.5 },
        { minute: 0.5, agentSentiment: 0.8, clientSentiment: -0.3 },
        { minute: 1.0, agentSentiment: 0.8, clientSentiment: 0.4 },
        { minute: 1.5, agentSentiment: 0.9, clientSentiment: 0.8 }
      ],
      objectionsDetected: [
        "Déjà engagé auprès de l'opérateur historique",
        "Manque de temps en journée pour changer les installations"
      ],
      unresolvedIssues: [],
      resolutionStatus: 'RÉSOLU',
      actionItemsRequested: [
        "Envoi de l'invitation d'agenda pour la démo de mardi 14h30",
        "Transmission de l'étude préliminaire de dimensionnement par e-mail"
      ],
      importantInformation: [
        "Société prospectée : Groupe BTP Dubois (25 salariés)",
        "Interlocuteur décisionnaire : Laurent Dubois (Gérant)"
      ],
      criticalMoments: [
        {
          timestamp: 18.8,
          type: 'OBJECTION',
          description: "Réticence initiale : le prospect déclare être déjà sous contrat"
        },
        {
          timestamp: 46.8,
          type: 'OBJECTION',
          description: "Questionnement sur la durée et le format de la présentation"
        },
        {
          timestamp: 68.5,
          type: 'INFORMATION_LEGALE',
          description: "Accord ferme de rendez-vous et confirmation des coordonnées"
        }
      ],
      agentTalkTimeSeconds: 68.2,
      clientTalkTimeSeconds: 48.4,
      talkToListenRatio: 1.41,
      interruptionCount: 1,
      totalSilenceSeconds: 8.4,
      speechRateWpm: 148,
      detectedCommunicationIssues: [
        "Légère coupure de parole à 51.8s lors de l'annonce du geste commercial"
      ],
      aiDisclaimer: "Suggestion IA — à valider par le responsable. Analyse basée sur les signaux acoustiques et textuels transcrits."
    },
    qualityEvaluationId: 'eval-101',
    qualityScore: 84,
    isUrgentReviewRequired: false
  },
  {
    id: 'call-102',
    callNumber: 'CALL-2024-0412-9014',
    agentId: 'agent-2',
    agentName: 'Koffi Mensah',
    teamId: 'team-4',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    customerPhoneMasked: '+33 7 •• •• 91 80',
    customerNameMasked: 'Mme Valérie T*****',
    callDate: '2024-04-12 11:22',
    durationSeconds: 160,
    direction: 'ENTRANT',
    callType: 'RÉCLAMATION',
    status: 'COACHING_RECOMMANDE',
    audioMetadata: {
      id: 'audio-102',
      filename: 'rec_call_20240412_gsm_martin.wav',
      fileSizeBytes: 3100000,
      durationSeconds: 160,
      sampleRateHz: 16000,
      channels: 1,
      snrDb: 8.5, // Fort parasitage GSM
      estimatedNoiseLevel: 'SÉVÈRE',
      noiseType: 'GSM_COMPRESSION',
      audioQualityScore: 61,
      waveformSamples: [
        0.2, 0.5, 0.7, 0.4, 0.2, 0.6, 0.8, 0.3, 0.2, 0.7, 0.9, 0.4, 0.1, 0.3, 0.8,
        0.5, 0.2, 0.7, 0.8, 0.3, 0.1, 0.4, 0.9, 0.6, 0.2, 0.5, 0.7, 0.3, 0.1, 0.4
      ]
    },
    transcription: {
      id: 'trans-102',
      callId: 'call-102',
      audioFileId: 'audio-102',
      versionNumber: 1,
      isLatest: true,
      asrModelUsed: 'KALA-Denoiser+Whisper-Large-v3',
      totalWords: 290,
      processingTimeMs: 1850,
      globalConfidenceScore: 78,
      noiseRobustnessScore: 76,
      rawText: "Bonjour... vous m'entendez ? Je vous appelle parce que j'ai une surfacturation de 45 euros sur mon forfait...",
      createdAt: '2024-04-12 11:26',
      segments: [
        {
          id: 'seg-102-1',
          transcriptionId: 'trans-102',
          speaker: 'AGENT',
          speakerLabel: 'Agent (Lucas Martin)',
          startTime: 0.5,
          endTime: 4.5,
          text: "Bonjour Télécom Mobile, Lucas à votre écoute, en quoi puis-je vous renseigner ?",
          confidenceScore: 0.95,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-102-2',
          transcriptionId: 'trans-102',
          speaker: 'CLIENT',
          speakerLabel: 'Client (Valérie T.)',
          startTime: 5.0,
          endTime: 16.2,
          text: "Bonjour monsieur. Je suis à l'étranger dans un aéroport, ça capte très mal... J'ai reçu un SMS me disant que j'avais 45 euros de hors-forfait alors que j'avais souscrit le pass Europe !",
          confidenceScore: 0.74,
          isNoisyPassage: true,
          noiseImpactLevel: 'FORT'
        },
        {
          id: 'seg-102-3',
          transcriptionId: 'trans-102',
          speaker: 'AGENT',
          speakerLabel: 'Agent (Lucas Martin)',
          startTime: 17.0,
          endTime: 24.5,
          text: "Donnez-moi votre numéro de ligne s'il vous plaît. Je vais regarder votre compte.",
          confidenceScore: 0.89,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-102-4',
          transcriptionId: 'trans-102',
          speaker: 'CLIENT',
          speakerLabel: 'Client (Valérie T.)',
          startTime: 25.0,
          endTime: 36.0,
          text: "C'est le 07 •• •• 91 80. Vous m'entendez bien ? Il y a beaucoup d'annonces sonores derrière moi.",
          confidenceScore: 0.76,
          isNoisyPassage: true,
          noiseImpactLevel: 'FORT'
        },
        {
          id: 'seg-102-5',
          transcriptionId: 'trans-102',
          speaker: 'AGENT',
          speakerLabel: 'Agent (Lucas Martin)',
          startTime: 37.0,
          endTime: 52.0,
          text: "Oui je vous entends. Alors en fait le pass Europe n'a pas été activé avant votre départ. Il faut attendre le retour en France pour le remboursement, je ne peux pas le faire tout de suite.",
          confidenceScore: 0.88,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-102-6',
          transcriptionId: 'trans-102',
          speaker: 'CLIENT',
          speakerLabel: 'Client (Valérie T.)',
          startTime: 53.0,
          endTime: 64.0,
          text: "Comment ça attendre mon retour ? Mais j'ai besoin de mon téléphone maintenant ! Vous ne pouvez pas me bloquer le hors-forfait ?",
          confidenceScore: 0.82,
          isNoisyPassage: true,
          noiseImpactLevel: 'MODÉRÉ'
        }
      ]
    },
    analytics: {
      id: 'analytics-102',
      callId: 'call-102',
      summary: "La cliente appelle depuis un aéroport à l'étranger avec de fortes dégradations de signal GSM. Elle conteste une surfacturation de 45 € de données en itinérance. L'agent manque d'empathie et n'a pas reformulé son besoin ni proposé de solution immédiate de blocage du compteur hors-forfait, créant de la friction.",
      contactIntent: "Surfacturation de données à l'étranger et contestation de hors-forfait",
      mainTopics: [
        "Hors-forfait roaming data",
        "Activation pass voyage étranger",
        "Blocage du compteur data"
      ],
      keywords: ["Surfacturation", "Roaming", "Aéroport", "Pass Europe", "Blocage"],
      sentimentAgent: 'NEUTRE',
      sentimentClient: 'TRÈS_FRUSTRÉ',
      sentimentTimeline: [
        { minute: 0.3, agentSentiment: 0.4, clientSentiment: -0.6 },
        { minute: 1.0, agentSentiment: 0.2, clientSentiment: -0.8 },
        { minute: 2.0, agentSentiment: 0.1, clientSentiment: -0.9 }
      ],
      objectionsDetected: [
        "Incapacité à utiliser son téléphone sans surcoût pendant le séjour",
        "Refus de la réponse de différer le traitement au retour en France"
      ],
      unresolvedIssues: [
        "Blocage d'urgence du compteur data non effectué",
        "Exonération des 45 € en attente de validation superviseur"
      ],
      resolutionStatus: 'EN_COURS',
      actionItemsRequested: [
        "Rappel du client par le superviseur",
        "Vérification des logs d'activation de l'option voyage"
      ],
      importantInformation: [
        "Numéro client 07 •• •• 91 80",
        "Montant litigieux : 45,00 €"
      ],
      criticalMoments: [
        {
          timestamp: 52.0,
          type: 'FRICTION',
          description: "Refus catégorique de solution immédiate par l'agent sans proposition alternative"
        }
      ],
      agentTalkTimeSeconds: 58.0,
      clientTalkTimeSeconds: 78.0,
      talkToListenRatio: 0.74,
      interruptionCount: 4,
      totalSilenceSeconds: 14.2,
      speechRateWpm: 122,
      detectedCommunicationIssues: [
        "Absence de reformulation",
        "Ton trop froid et distant face à une cliente sous stress à l'étranger",
        "Nombreux silences non justifiés pendant la recherche informatique"
      ],
      aiDisclaimer: "Suggestion IA — à valider par le responsable. Analyse basée sur les signaux acoustiques et textuels transcrits."
    },
    qualityEvaluationId: 'eval-102',
    qualityScore: 72,
    isUrgentReviewRequired: true
  },
  {
    id: 'call-103',
    callNumber: 'CALL-2024-0412-9450',
    agentId: 'agent-4',
    agentName: 'Thomas Leroux',
    teamId: 'team-1',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    customerPhoneMasked: '+33 6 •• •• 12 55',
    customerNameMasked: 'M. Patrick B*****',
    callDate: '2024-04-12 14:05',
    durationSeconds: 190,
    direction: 'SORTANT',
    callType: 'COMMERCIAL',
    status: 'A_REVOIR',
    audioMetadata: {
      id: 'audio-103',
      filename: 'rec_call_20240412_leroy_sortant.wav',
      fileSizeBytes: 3700000,
      durationSeconds: 190,
      sampleRateHz: 16000,
      channels: 1,
      snrDb: 18.2,
      estimatedNoiseLevel: 'FAIBLE',
      noiseType: 'PLATEAU_CALL_CENTER',
      audioQualityScore: 88,
      waveformSamples: [
        0.3, 0.7, 0.8, 0.9, 0.6, 0.2, 0.4, 0.8, 0.7, 0.3, 0.6, 0.8, 0.9, 0.5, 0.2,
        0.4, 0.8, 0.9, 0.7, 0.3, 0.5, 0.8, 0.6, 0.2, 0.5, 0.8, 0.7, 0.4, 0.2, 0.6
      ]
    },
    transcription: {
      id: 'trans-103',
      callId: 'call-103',
      audioFileId: 'audio-103',
      versionNumber: 1,
      isLatest: true,
      asrModelUsed: 'KALA-Denoiser+Whisper-Large-v3',
      totalWords: 410,
      processingTimeMs: 1600,
      globalConfidenceScore: 94,
      noiseRobustnessScore: 92,
      rawText: "Bonjour Monsieur B*****, Thomas Leroy à l'appareil de Télécom Fibre. Je vous appelle pour vous proposer notre nouveau boîtier TV 4K...",
      createdAt: '2024-04-12 14:10',
      segments: [
        {
          id: 'seg-103-1',
          transcriptionId: 'trans-103',
          speaker: 'AGENT',
          speakerLabel: 'Agent (Thomas Leroy)',
          startTime: 0.5,
          endTime: 6.0,
          text: "Bonjour M. B*****, Thomas Leroy de Télécom Fibre. Je vous appelle suite à votre ancienneté pour vous proposer notre offre privilège !",
          confidenceScore: 0.96,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-103-2',
          transcriptionId: 'trans-103',
          speaker: 'CLIENT',
          speakerLabel: 'Client (Patrick B.)',
          startTime: 6.2,
          endTime: 12.0,
          text: "Écoutez vous tombez mal, je suis en pleine réunion de famille, je vous avais demandé de ne plus me démarcher.",
          confidenceScore: 0.95,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-103-3',
          transcriptionId: 'trans-103',
          speaker: 'AGENT',
          speakerLabel: 'Agent (Thomas Leroy)',
          startTime: 12.2,
          endTime: 21.0,
          text: "Je comprends tout à fait mais ça ne prendra que deux minutes, c'est une réduction de 15 euros par mois sans réengagement...",
          confidenceScore: 0.94,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-103-4',
          transcriptionId: 'trans-103',
          speaker: 'CLIENT',
          speakerLabel: 'Client (Patrick B.)',
          startTime: 21.2,
          endTime: 28.0,
          text: "Mais attendez, vous ne m'écoutez pas ! Je vous dis que je ne suis pas disponible !",
          confidenceScore: 0.93,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        }
      ]
    },
    analytics: {
      id: 'analytics-103',
      callId: 'call-103',
      summary: "Appel de prospection sortant. Le client a manifesté immédiatement son indisponibilité. L'agent a insisté lourdement et a interrompu le client à 7 reprises sans tenir compte de son opposition explicite, violant la charte d'éthique de contact.",
      contactIntent: "Proposition commerciale sortante (Upgrade décodeur TV)",
      mainTopics: [
        "Démarchage commercial",
        "Refus client pour indisponibilité",
        "Insistance commerciale inadaptée"
      ],
      keywords: ["Démarchage", "Opposition", "Interruption", "Offre privilège"],
      sentimentAgent: 'POSITIF',
      sentimentClient: 'TRÈS_FRUSTRÉ',
      sentimentTimeline: [
        { minute: 0.2, agentSentiment: 0.9, clientSentiment: -0.5 },
        { minute: 1.0, agentSentiment: 0.7, clientSentiment: -0.9 },
        { minute: 2.0, agentSentiment: 0.5, clientSentiment: -1.0 }
      ],
      objectionsDetected: [
        "Demande formelle de ne plus être démarché (Bloctel / Préférences)",
        "Indisponibilité horaire totale"
      ],
      unresolvedIssues: [
        "Non-respect du droit d'opposition immédiat"
      ],
      resolutionStatus: 'NON_RÉSOLU',
      actionItemsRequested: [
        "Désinscription du client des fichiers de prospection sortante",
        "Entretien de recadrage avec le formateur"
      ],
      importantInformation: [
        "Numéro client 06 •• •• 12 55",
        "Risque de réclamation officielle"
      ],
      criticalMoments: [
        {
          timestamp: 12.2,
          type: 'INTERRUPTION',
          description: "Interruption du client alors qu'il exprimait son indisponibilité"
        },
        {
          timestamp: 21.2,
          type: 'FRICTION',
          description: "Colère ouverte du client face au forcing"
        }
      ],
      agentTalkTimeSeconds: 120.0,
      clientTalkTimeSeconds: 42.0,
      talkToListenRatio: 2.85,
      interruptionCount: 7,
      totalSilenceSeconds: 6.0,
      speechRateWpm: 172,
      detectedCommunicationIssues: [
        "7 interruptions agressives constatées",
        "Forcing commercial en dépit du refus explicite",
        "Ratio de parole disproportionné (285% agent vs client)"
      ],
      aiDisclaimer: "Suggestion IA — à valider par le responsable. Analyse basée sur les signaux acoustiques et textuels transcrits."
    },
    qualityEvaluationId: 'eval-103',
    qualityScore: 68,
    isUrgentReviewRequired: true
  },
  {
    id: 'call-104',
    callNumber: 'CALL-2024-0412-9800',
    agentId: 'agent-3',
    agentName: 'Sarah Benali',
    teamId: 'team-2',
    campaignId: 'camp-1',
    campaignName: 'Télécom Fibre & Mobile — Rétention',
    customerPhoneMasked: '+33 6 •• •• 77 31',
    customerNameMasked: 'Mme Corinne G*****',
    callDate: '2024-04-12 15:40',
    durationSeconds: 110,
    direction: 'ENTRANT',
    callType: 'SUPPORT_TECHNIQUE',
    audioMetadata: {
      id: 'audio-104',
      filename: 'rec_call_20240412_benali_parfait.wav',
      fileSizeBytes: 2150000,
      durationSeconds: 110,
      sampleRateHz: 16000,
      channels: 1,
      snrDb: 24.8, // Signal d'excellente qualité
      estimatedNoiseLevel: 'FAIBLE',
      noiseType: 'AUCUN',
      audioQualityScore: 96,
      waveformSamples: [
        0.2, 0.4, 0.6, 0.8, 0.5, 0.3, 0.5, 0.7, 0.6, 0.4, 0.5, 0.8, 0.7, 0.3, 0.5
      ]
    },
    transcription: {
      id: 'trans-104',
      callId: 'call-104',
      audioFileId: 'audio-104',
      versionNumber: 1,
      isLatest: true,
      asrModelUsed: 'KALA-Denoiser+Whisper-Large-v3',
      totalWords: 310,
      processingTimeMs: 1100,
      globalConfidenceScore: 98,
      noiseRobustnessScore: 98,
      rawText: "Bonjour et bienvenue au support Télécom Fibre, mon nom est Sarah. Comment puis-je vous assister aujourd'hui ?",
      createdAt: '2024-04-12 15:43',
      segments: [
        {
          id: 'seg-104-1',
          transcriptionId: 'trans-104',
          speaker: 'AGENT',
          speakerLabel: 'Agent (Sarah Benali)',
          startTime: 0.5,
          endTime: 4.8,
          text: "Bonjour et bienvenue au support Télécom Fibre, mon nom est Sarah. Comment puis-je vous assister aujourd'hui ?",
          confidenceScore: 0.99,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-104-2',
          transcriptionId: 'trans-104',
          speaker: 'CLIENT',
          speakerLabel: 'Client (Corinne G.)',
          startTime: 5.2,
          endTime: 14.0,
          text: "Bonjour Sarah. J'avais une question sur la programmation des enregistrements de la nouvelle box que j'ai reçue hier.",
          confidenceScore: 0.98,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        },
        {
          id: 'seg-104-3',
          transcriptionId: 'trans-104',
          speaker: 'AGENT',
          speakerLabel: 'Agent (Sarah Benali)',
          startTime: 14.5,
          endTime: 26.0,
          text: "C'est avec grand plaisir que je vais vous guider pas à pas pour configurer votre enregistreur numérique. Avez-vous la télécommande en main ?",
          confidenceScore: 0.98,
          isNoisyPassage: false,
          noiseImpactLevel: 'AUCUN'
        }
      ]
    },
    analytics: {
      id: 'analytics-104',
      callId: 'call-104',
      summary: "Appel modèle. L'agente accueille chaleureusement la cliente, identifie le modèle exact de boîtier décodeur, et guide la cliente avec pédagogie et bienveillance. Résolution immédiate, clôture exemplaire.",
      contactIntent: "Assistance configuration enregistreur TV numérique",
      mainTopics: ["Configuration décodeur TV", "Programmation enregistrements"],
      keywords: ["Télécommande", "Décodeur", "Enregistrement", "Support"],
      sentimentAgent: 'POSITIF',
      sentimentClient: 'POSITIF',
      sentimentTimeline: [
        { minute: 0.2, agentSentiment: 0.9, clientSentiment: 0.8 },
        { minute: 1.0, agentSentiment: 0.9, clientSentiment: 0.9 }
      ],
      objectionsDetected: [],
      unresolvedIssues: [],
      resolutionStatus: 'RÉSOLU',
      actionItemsRequested: [
        "Envoi du guide d'utilisation PDF par email"
      ],
      importantInformation: [
        "Modèle box V6 4K"
      ],
      criticalMoments: [],
      agentTalkTimeSeconds: 56.0,
      clientTalkTimeSeconds: 44.0,
      talkToListenRatio: 1.27,
      interruptionCount: 0,
      totalSilenceSeconds: 4.5,
      speechRateWpm: 138,
      detectedCommunicationIssues: [],
      aiDisclaimer: "Suggestion IA — à valider par le responsable. Analyse basée sur les signaux acoustiques et textuels transcrits."
    },
    qualityEvaluationId: 'eval-104',
    qualityScore: 96,
    status: 'EVALUE',
    isUrgentReviewRequired: false
  },
  ...generateCallsDataset()
];

// ----------------------------------------------------------------------------
// ÉVALUATIONS QUALITÉ ASSOCIÉES
// ----------------------------------------------------------------------------
export const INITIAL_EVALUATIONS: QualityEvaluation[] = [
  {
    id: 'eval-101',
    callId: 'call-101',
    agentId: 'agent-1',
    evaluatorId: 'user-qa',
    evaluatorName: 'Claire Delattre (Resp. Qualité)',
    formTitle: 'Grille Standard Rétention & Service Client v2.4',
    overallScore: 84,
    aiSuggestedScore: 82,
    status: 'VALIDÉE_RESPONSABLE',
    evaluatedAt: '2024-04-12 11:35',
    validatedAt: '2024-04-12 11:40',
    unmetCriteriaCount: 2,
    strengths: [
      'Bonne empathie dès les premiers instants de tension du client',
      'Excellente reformulation du problème technique au segment 5',
      'Sauvetage du contrat grâce au geste commercial pertinent'
    ],
    weaknesses: [
      'Légère coupure de parole à 51.8s (interruption)',
      'La vérification des mentions RGPD d\'enregistrement aurait pu être plus explicite',
      'Argumentation sur les débits fibre Orange un peu hésitante'
    ],
    potentialErrors: [
      'Risque de non-respect du délai d\'intervention si le technicien n\'est pas confirmé'
    ],
    recommendations: [
      'Participer au module de formation "Traitement des objections tarifaires et concurrentielles"',
      'Maintenir la pratique de reformulation systématique'
    ],
    evaluatorFinalNotes: "Très bonne tenue d'appel globale. Jean a su garder son calme malgré l'agressivité initiale du client et a transformé un risque de résiliation en opportunité de fidélisation.",
    items: [
      {
        id: 'item-1',
        criterionId: 'crit-1',
        score: 10,
        aiProposedScore: 10,
        aiConfidence: 0.98,
        isAiAccepted: true,
        comment: "Accueil parfait, chaleureux et conforme à la charte.",
        transcriptEvidenceQuotes: [
          {
            segmentId: 'seg-1',
            timestamp: 0.5,
            quote: "Bonjour et bienvenue chez Télécom Fibre, mon nom est Jean. Que puis-je faire pour vous aujourd'hui ?",
            relevanceNote: "Script d'accueil respecté mot pour mot"
          }
        ]
      },
      {
        id: 'item-2',
        criterionId: 'crit-2',
        score: 10,
        aiProposedScore: 10,
        aiConfidence: 0.95,
        isAiAccepted: true,
        comment: "Contrat authentifié sans faille.",
        transcriptEvidenceQuotes: [
          {
            segmentId: 'seg-3',
            timestamp: 12.5,
            quote: "Pourriez-vous me confirmer votre numéro de contrat ou votre adresse s'il vous plaît ?",
            relevanceNote: "Question d'identification réglementaire posée immédiatement"
          }
        ]
      },
      {
        id: 'item-3',
        criterionId: 'crit-3',
        score: 9,
        aiProposedScore: 9,
        aiConfidence: 0.91,
        isAiAccepted: true,
        comment: "Bonne écoute du motif d'appel.",
        transcriptEvidenceQuotes: []
      },
      {
        id: 'item-4',
        criterionId: 'crit-4',
        score: 9,
        aiProposedScore: 8,
        aiConfidence: 0.88,
        isAiAccepted: false,
        comment: "La note a été rehaussée à 9 par le responsable car l'agent a laissé le client vider son sac.",
        transcriptEvidenceQuotes: []
      },
      {
        id: 'item-5',
        criterionId: 'crit-5',
        score: 10,
        aiProposedScore: 10,
        aiConfidence: 0.94,
        isAiAccepted: true,
        comment: "Exemplaire : reformulation complète et empathique au segment 5.",
        transcriptEvidenceQuotes: [
          {
            segmentId: 'seg-5',
            timestamp: 30.1,
            quote: "Si je résume bien, votre accès internet subit des micro-coupures quotidiennes, ce qui pénalise votre activité professionnelle ?",
            relevanceNote: "Reformulation synthétique avec validation explicite"
          }
        ]
      },
      {
        id: 'item-6',
        criterionId: 'crit-6',
        score: 8,
        aiProposedScore: 8,
        aiConfidence: 0.90,
        isAiAccepted: true,
        comment: "Script globalement respecté.",
        transcriptEvidenceQuotes: []
      },
      {
        id: 'item-7',
        criterionId: 'crit-7',
        score: 10,
        aiProposedScore: 10,
        aiConfidence: 0.96,
        isAiAccepted: true,
        comment: "Informations exactes vérifiées sur la console réseau.",
        transcriptEvidenceQuotes: []
      },
      {
        id: 'item-8',
        criterionId: 'crit-8',
        score: 8,
        aiProposedScore: 8,
        aiConfidence: 0.89,
        isAiAccepted: true,
        comment: "Procédures de geste commercial conformes au barème niveau 1.",
        transcriptEvidenceQuotes: []
      },
      {
        id: 'item-9',
        criterionId: 'crit-9',
        score: 7,
        aiProposedScore: 6,
        aiConfidence: 0.82,
        isAiAccepted: false,
        comment: "L'IA proposait 6 pour hésitation sur l'offre Orange. Rehaussé à 7 car le geste de 20€ a clos le débat.",
        transcriptEvidenceQuotes: [
          {
            segmentId: 'seg-7',
            timestamp: 51.8,
            quote: "Pour compenser cela, je vous applique immédiatement un geste de 20 euros sur votre prochaine facture.",
            relevanceNote: "Argument de rétention commercial décisif"
          }
        ]
      },
      {
        id: 'item-10',
        criterionId: 'crit-10',
        score: 7,
        aiProposedScore: 7,
        aiConfidence: 0.87,
        isAiAccepted: true,
        comment: "Attention aux légers chevauchements de parole lors de l'annonce du geste.",
        transcriptEvidenceQuotes: []
      },
      {
        id: 'item-11',
        criterionId: 'crit-11',
        score: 10,
        aiProposedScore: 10,
        aiConfidence: 0.95,
        isAiAccepted: true,
        comment: "Problème totalement résolu et résiliation évitée.",
        transcriptEvidenceQuotes: [
          {
            segmentId: 'seg-8',
            timestamp: 69.0,
            quote: "je veux bien patienter jusqu'à vendredi avant d'envoyer mon recommandé.",
            relevanceNote: "Accord de maintien du contrat obtenu"
          }
        ]
      },
      {
        id: 'item-12',
        criterionId: 'crit-12',
        score: 7,
        aiProposedScore: 7,
        aiConfidence: 0.92,
        isAiAccepted: true,
        comment: "Mention d'enregistrement pré-enregistrée en SVI, mais confirmation orale facultative omise.",
        transcriptEvidenceQuotes: []
      },
      {
        id: 'item-13',
        criterionId: 'crit-13',
        score: 9,
        aiProposedScore: 9,
        aiConfidence: 0.96,
        isAiAccepted: true,
        comment: "Excellente prise de congé personnalisée.",
        transcriptEvidenceQuotes: []
      }
    ]
  },
  {
    id: 'eval-102',
    callId: 'call-102',
    agentId: 'agent-3',
    evaluatorId: 'user-qa',
    evaluatorName: 'Claire Delattre (Resp. Qualité)',
    formTitle: 'Grille Standard Rétention & Service Client v2.4',
    overallScore: 72,
    aiSuggestedScore: 70,
    status: 'PROPOSITION_IA',
    evaluatedAt: '2024-04-12 11:45',
    unmetCriteriaCount: 4,
    strengths: [
      'Identification rapide de la cliente'
    ],
    weaknesses: [
      'Manque criant d\'empathie envers une cliente en détresse à l\'étranger',
      'Absence totale de reformulation',
      'Refus abrupt sans alternative'
    ],
    potentialErrors: [
      'Risque de litige et de départ client si le hors forfait continue d\'augmenter'
    ],
    recommendations: [
      'Formation d\'urgence sur l\'empathie et les procédures d\'urgence internationale'
    ],
    evaluatorFinalNotes: "Évaluation IA en attente de confirmation par le responsable qualité. Scores bas justifiés.",
    items: []
  }
];

// ----------------------------------------------------------------------------
// PLANS DE COACHING & FORMATIONS
// ----------------------------------------------------------------------------
export const INITIAL_COACHING_PLANS: CoachingPlan[] = [
  {
    id: 'coach-plan-1',
    agentId: 'agent-1',
    agentName: 'Jean Dupont',
    trainerId: 'user-trainer',
    trainerName: 'Patrick Simon',
    createdAt: '2024-03-15',
    targetCompletionDate: '2024-04-30',
    status: 'ACTIF',
    overallObjectiveSummary: "Consolider la posture de négociation en situation de résiliation et éliminer les interruptions réflexes.",
    strengthsSummary: [
      "Bonne écoute active",
      "Bonne maîtrise du script d'accueil",
      "Très bon relationnel et politesse"
    ],
    improvementAxesSummary: [
      "Gestion des objections concurrentielles",
      "Reformulation systématique",
      "Réduction des interruptions de parole"
    ],
    objectives: [
      {
        id: 'obj-1',
        title: "Objectif 1 : Améliorer la gestion des objections",
        description: "Apprendre à déconstruire les offres concurrentes sans dénigrement et en valorisant la valeur de service.",
        targetCompetency: "Négociation & Rétention",
        currentLevel: "Intermédiaire (Note 7/10)",
        targetLevel: "Avancé (Note 9/10)",
        action: "Simulations d'appels ciblées 2x par semaine sur grille de contre-argumentation",
        responsable: "Patrick Simon (Formateur)",
        date: "2024-04-15",
        status: 'EN_COURS',
        resultat: "Progression notable sur la valorisation de la qualité réseau (+2 pts)",
        suggestedExercises: [
          "Simulation d'appel : Contestation offre Orange 2 mois offerts",
          "Atelier d'argumentation sur la stabilité de la fibre symétrique"
        ]
      },
      {
        id: 'obj-2',
        title: "Objectif 2 : Améliorer la reformulation",
        description: "Adopter le réflexe de reformulation 'effet miroir' avant toute annonce de geste commercial.",
        targetCompetency: "Écoute active & Reformulation",
        currentLevel: "Bonne progression (Note 8/10)",
        targetLevel: "Excellence (Note 10/10)",
        action: "Exercice d'écoute active et restitution synthétique des besoins clients",
        responsable: "Marc Vasseur (Superviseur)",
        date: "2024-03-25",
        status: 'VALIDÉ',
        resultat: "Objectif atteint : 92% de reformulation conforme constatée sur les 15 derniers appels",
        suggestedExercises: [
          "Exercice des 3 mots clés : Reformuler en moins de 15 secondes le besoin vital du client"
        ]
      },
      {
        id: 'obj-3',
        title: "Objectif 3 : Réduire les interruptions",
        description: "Observer 1,5 seconde de silence après chaque fin de phrase du client pour éviter les collisions acoustiques.",
        targetCompetency: "Rythme & Maîtrise conversationnelle",
        currentLevel: "En difficulté (1 à 3 coupures par appel)",
        targetLevel: "Moins de 1 coupure par tranche de 5 appels",
        action: "Suivi par waveform synchronisée et auto-écoute hebdomadaire de 3 appels",
        responsable: "Patrick Simon (Formateur)",
        date: "2024-04-28",
        status: 'EN_COURS',
        resultat: "Coupures réduites de 2.4/appel à 0.8/appel en mars",
        suggestedExercises: [
          "Écoute comparée d'enregistrements audio avec waveform synchronisée",
          "Jeu de rôle avec régulateurs visuels de tour de parole"
        ]
      }
    ],
    trainerNotes: "Jean est très impliqué et réceptif aux retours. Son score est passé de 71% en janvier à 84% en avril (+13 points). L'effort doit désormais porter sur la gestion du silence.",
    nextSessionDate: '2024-04-18 à 14:30',
    progressionPercentage: 72
  },
  {
    id: 'coach-plan-2',
    agentId: 'agent-3',
    agentName: 'Lucas Martin',
    trainerId: 'user-trainer',
    trainerName: 'Patrick Simon',
    createdAt: '2024-03-20',
    targetCompletionDate: '2024-05-15',
    status: 'ACTIF',
    overallObjectiveSummary: "Développer l'empathie et la posture bienveillante face aux clients stressés.",
    strengthsSummary: [
      "Rigueur sur les procédures",
      "Ponctualité"
    ],
    improvementAxesSummary: [
      "Empathie et chaleur de l'accueil",
      "Capacité à rassurer",
      "Élimination des silences informatiques inexpliqués"
    ],
    objectives: [
      {
        id: 'obj-201',
        title: "Posture d'accueil et réassurance",
        description: "Rassurer immédiatement le client lors d'un litige hors-forfait ou technique.",
        targetCompetency: "Empathie relationnelle",
        currentLevel: "Débutant",
        targetLevel: "Confirmé",
        action: "Atelier de calibrage vocal et phrases de réassurance immédiate",
        responsable: "Patrick Simon (Formateur)",
        date: "2024-04-19",
        status: 'EN_COURS',
        resultat: "En cours : premier test positif sur les appels de réclamation technique",
        suggestedExercises: ["Atelier d'écoute de verbatim de clients en colère"]
      }
    ],
    trainerNotes: "Lucas manque encore d'assurance. Il a tendance à se réfugier derrière la procédure stricte lorsque la tension monte.",
    nextSessionDate: '2024-04-19 à 10:00',
    progressionPercentage: 40
  },
  {
    id: 'coach-plan-koffi',
    agentId: 'agent-2',
    agentName: 'Koffi Mensah',
    trainerId: 'user-trainer',
    trainerName: 'Patrick Simon',
    createdAt: '2024-02-01',
    targetCompletionDate: '2024-04-30',
    status: 'ACTIF',
    overallObjectiveSummary: "Accompagnement intensif de Koffi Mensah : Traitement des objections tarifaires, reformulation empathique et respect rigoureux du script contractuel.",
    strengthsSummary: [
      "Courtoisie exemplaire et phraséologie posée",
      "Clôture d'appel soignée et prise de congé chaleureuse",
      "Patience remarquable face aux clients mécontents",
      "Forte motivation et excellente écoute des feedbacks coach"
    ],
    improvementAxesSummary: [
      "Gestion des objections concurrentielles",
      "Reformulation systématique",
      "Respect du script & mentions obligatoires RGPD"
    ],
    objectives: [
      {
        id: 'obj-koffi-1',
        title: "Objectif 1 : Traitement des objections concurrentielles",
        description: "Développer des réflexes d'argumentation face aux offres agressives de la concurrence sans entrer en confrontation.",
        targetCompetency: "Négociation & Rétention",
        currentLevel: "Initial : 5.8/10 (Hésitations sur tarifs)",
        targetLevel: "Cible : 8.5/10 (Réponse fluide et structurée)",
        action: "Atelier hebdomadaire de simulation avec grille comparative des forfaits Fibre du marché",
        responsable: "Patrick Simon (Formateur)",
        date: "2024-03-15",
        status: 'VALIDÉ',
        resultat: "Validé le 15/03 : Koffi désamorce désormais 82% des contestations tarifaires sans hésitation.",
        suggestedExercises: [
          "Jeu de rôle : Client brandissant une promo concurrente -50%",
          "Quiz flash : 10 arguments phares du réseau fibre optique propriétaire"
        ]
      },
      {
        id: 'obj-koffi-2',
        title: "Objectif 2 : Reformulation active et validation du besoin",
        description: "Systématiser la reformulation avant toute proposition technique ou geste de rétention.",
        targetCompetency: "Écoute active & Reformulation",
        currentLevel: "Initial : 6.0/10 (Passage trop direct à la solution)",
        targetLevel: "Cible : 9.0/10 (Validation explicite de l'accord client)",
        action: "Mise en place du rituel 'Accuser réception - Reformuler l'attente - Valider avant d'agir'",
        responsable: "Marc Vasseur (Superviseur)",
        date: "2024-03-30",
        status: 'VALIDÉ',
        resultat: "Validé le 30/03 : Taux de validation par le client passé de 54% à 88%.",
        suggestedExercises: [
          "Exercice miroir : Synthétiser en une phrase la demande d'un client prolixe",
          "Auto-analyse de 5 enregistrements récents avec transcription synchronisée"
        ]
      },
      {
        id: 'obj-koffi-3',
        title: "Objectif 3 : Respect du script et mentions légales RGPD",
        description: "Énoncer avec rigueur les mentions d'enregistrement d'appel et les conditions d'engagement sans omission.",
        targetCompetency: "Conformité réglementaire",
        currentLevel: "Initial : 7.2/10 (Oublis occasionnels de la mention d'enregistrement)",
        targetLevel: "Cible : 10/10 (Zéro défaut conformité)",
        action: "Affichage du mémo visuel '3 mentions obligatoires' et vérification hebdomadaire par QA",
        responsable: "Claire Delattre (QA Manager)",
        date: "2024-04-25",
        status: 'EN_COURS',
        resultat: "En excellente voie : 91.5% de conformité sur le mois d'avril (progression de +12.5 pts).",
        suggestedExercises: [
          "Exercice de récitation naturelle des mentions RGPD dès l'ouverture",
          "Contrôle qualité croisé avec écoute d'un binôme"
        ]
      }
    ],
    trainerNotes: "Progression remarquable de Koffi Mensah ! Son score qualité est passé de 68% en janvier à 72% en février, 76% en mars et atteint 81% en avril, soit un uplift spectaculaire de +13 points (+19.1% relatif). Koffi est désormais autonome et sécurise ses appels critiques avec calme.",
    nextSessionDate: '2024-04-22 à 15:00',
    progressionPercentage: 78
  }
];

export const INITIAL_TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'mod-1',
    code: 'MOD-OBJ-01',
    title: 'Techniques Avancées de Traitement des Objections Concurrentielles',
    category: 'GESTION_OBJECTIONS',
    durationMinutes: 45,
    description: 'Désamorcer les menaces de départ vers la concurrence et structurer un pitch de rétention gagnant-gagnant.',
    targetCompetencies: ['Négociation', 'Valorisation de l\'offre', 'Calme sous tension'],
    interactiveSimulationsCount: 3,
    difficultyLevel: 'INTERMÉDIAIRE'
  },
  {
    id: 'mod-2',
    code: 'MOD-ECO-02',
    title: 'Écoute Active, Effet Miroir et Reformulation Stratégique',
    category: 'POSTURE_ÉCOUTE',
    durationMinutes: 30,
    description: 'Transformer la colère d\'un client en coopération grâce à la reformulation empathique et au questionnement ouvert.',
    targetCompetencies: ['Écoute active', 'Synthèse', 'Désescalade'],
    interactiveSimulationsCount: 4,
    difficultyLevel: 'DÉBUTANT'
  },
  {
    id: 'mod-3',
    code: 'MOD-RYT-03',
    title: 'Maîtrise du Rythme Conversationnel et Élimination des Interruptions',
    category: 'RELATION_CLIENT',
    durationMinutes: 35,
    description: 'Analyser ses propres tours de parole, gérer les silences productifs et supprimer les interruptions réflexes.',
    targetCompetencies: ['Contrôle du débit', 'Gestion des silences', 'Courtoisie paralinguistique'],
    interactiveSimulationsCount: 2,
    difficultyLevel: 'AVANCÉ'
  },
  {
    id: 'mod-4',
    code: 'MOD-RGPD-04',
    title: 'Conformité Réglementaire, RGPD et Authentification Sécurisée',
    category: 'CONFORMITÉ_RGPD',
    durationMinutes: 25,
    description: 'Maîtriser les questions pièges d\'usurpation d\'identité et respecter les obligations légales d\'enregistrement.',
    targetCompetencies: ['Vérification d\'identité', 'Secret professionnel', 'Conformité légale'],
    interactiveSimulationsCount: 2,
    difficultyLevel: 'DÉBUTANT'
  }
];

export const INITIAL_TRAINING_SESSIONS: TrainingSession[] = [
  {
    id: 'sess-koffi-1',
    agentId: 'agent-2',
    agentName: 'Koffi Mensah',
    trainerId: 'user-trainer',
    trainerName: 'Patrick Simon',
    moduleId: 'mod-1',
    moduleTitle: 'Techniques Avancées de Traitement des Objections Concurrentielles',
    scheduledDate: '2024-03-05',
    status: 'TERMINÉE',
    scoreObtained: 89,
    preTrainingQualityScore: 68,
    postTrainingQualityScore: 81,
    upliftPercentage: 19.1,
    trainerFeedback: "Koffi a fait d'immenses progrès : son score QA est monté de 68% à 81% (+13 points). Les simulations d'appels ont été validées avec brio.",
    simulationExercisesCompleted: [
      { title: "Mise en situation : Rétention forfait Fibre face à une promo concurrente", score: 92, passed: true },
      { title: "Désamorçage d'une demande de résiliation agressive", score: 86, passed: true }
    ]
  },
  {
    id: 'sess-koffi-2',
    agentId: 'agent-2',
    agentName: 'Koffi Mensah',
    trainerId: 'user-trainer',
    trainerName: 'Patrick Simon',
    moduleId: 'mod-4',
    moduleTitle: 'Conformité Réglementaire, RGPD et Authentification Sécurisée',
    scheduledDate: '2024-04-22',
    status: 'PLANIFIÉE',
    preTrainingQualityScore: 81,
    trainerFeedback: "Session planifiée pour consolider le respect sans faille des mentions légales et atteindre 95% de conformité.",
    simulationExercisesCompleted: []
  },
  {
    id: 'sess-1',
    agentId: 'agent-1',
    agentName: 'Jean Dupont',
    trainerId: 'user-trainer',
    trainerName: 'Patrick Simon',
    moduleId: 'mod-2',
    moduleTitle: 'Écoute Active, Effet Miroir et Reformulation Stratégique',
    scheduledDate: '2024-03-22',
    status: 'TERMINÉE',
    scoreObtained: 88,
    preTrainingQualityScore: 76,
    postTrainingQualityScore: 84,
    upliftPercentage: 10.5,
    trainerFeedback: "Jean a assimilé les principes de reformulation. L'impact sur ses appels réels est spectaculaire (+8 points en qualité).",
    simulationExercisesCompleted: [
      { title: "Mise en situation : Panne répétée et client menaçant", score: 92, passed: true },
      { title: "Détection des mots-clés d'insatisfaction", score: 84, passed: true }
    ]
  },
  {
    id: 'sess-2',
    agentId: 'agent-1',
    agentName: 'Jean Dupont',
    trainerId: 'user-trainer',
    trainerName: 'Patrick Simon',
    moduleId: 'mod-1',
    moduleTitle: 'Techniques Avancées de Traitement des Objections Concurrentielles',
    scheduledDate: '2024-04-18',
    status: 'PLANIFIÉE',
    preTrainingQualityScore: 84,
    trainerFeedback: "Session planifiée pour consolider l'argumentation face aux offres promotionnelles agressives des concurrents.",
    simulationExercisesCompleted: []
  },
  {
    id: 'sess-3',
    agentId: 'agent-3',
    agentName: 'Lucas Martin',
    trainerId: 'user-trainer',
    trainerName: 'Patrick Simon',
    moduleId: 'mod-2',
    moduleTitle: 'Écoute Active, Effet Miroir et Reformulation Stratégique',
    scheduledDate: '2024-04-19',
    status: 'PLANIFIÉE',
    preTrainingQualityScore: 72,
    trainerFeedback: "Travail ciblé sur l'accueil des clients en situation d'urgence.",
    simulationExercisesCompleted: []
  }
];

// ----------------------------------------------------------------------------
// LABORATOIRE D'EXPÉRIMENTATION SCIENTIFIQUE (MÉMOIRE MASTER IA & BIG DATA)
// ----------------------------------------------------------------------------
export const SCIENTIFIC_EXPERIMENT_CONFIGS: ExperimentConfiguration[] = [
  {
    id: 'cfg-baseline',
    name: '1. Baseline ASR (Signal Brut)',
    category: 'BASELINE',
    audioPreprocessingMethod: 'Aucun (Signal audio direct non filtré)',
    asrModel: 'Whisper-Small-v3 / Wav2Vec2-FR',
    denoiserAlgorithm: 'Aucun',
    postProcessingApplied: 'Découpage standard par énergie',
    estimatedRtf: 0.18, // 0.18x temps réel
    averageWer: 24.8, // 24.8% d'erreurs mots en milieu bruité
    averageCer: 14.2,
    snrImprovementDb: 0.0,
    confidenceScoreAvg: 68.5
  },
  {
    id: 'cfg-preprocessed',
    name: '2. Prétraitement Spectral + Baseline',
    category: 'PRÉTRAITÉ',
    audioPreprocessingMethod: 'Spectral Subtraction (Boll 1979) + Filtre Passe-Bande 300-3400Hz',
    asrModel: 'Whisper-Small-v3',
    denoiserAlgorithm: 'Soustraction Spectrale Adaptative',
    postProcessingApplied: 'Normalisation RMS',
    estimatedRtf: 0.22,
    averageWer: 18.3,
    averageCer: 10.6,
    snrImprovementDb: 4.8,
    confidenceScoreAvg: 76.2
  },
  {
    id: 'cfg-acoustic-tuned',
    name: '3. Modèle ASR Adapté Bruit Plateau',
    category: 'MODÈLE_AMÉLIORÉ',
    audioPreprocessingMethod: 'Filtrage Wiener Adaptatif + Débruiteur RNNoise',
    asrModel: 'Conformer-CTC Fine-tuned sur corpus audio centre d\'appels bruité',
    denoiserAlgorithm: 'Wiener Filtering',
    postProcessingApplied: 'Rescoring avec modèle de langage n-gram 4-gram',
    estimatedRtf: 0.29,
    averageWer: 13.1,
    averageCer: 7.4,
    snrImprovementDb: 7.5,
    confidenceScoreAvg: 84.0
  },
  {
    id: 'cfg-kala-full',
    name: '4. Pipeline Complet KALA VOICE QA',
    category: 'PIPELINE_COMPLET_KALA',
    audioPreprocessingMethod: 'Deep Complex UNet (DCUNet) Débruitage Neuronal + Masquage de phase',
    asrModel: 'Whisper-Large-v3 enrichi avec Prompting Métier & Vocabulaire Télécom/Assurance',
    denoiserAlgorithm: 'Réseau Récurrent Débruiteur KALA-Denoiser',
    postProcessingApplied: 'Alignement dynamique Viterbi + Re-ponctuation par Transformer RoBERTa-FR',
    estimatedRtf: 0.35,
    averageWer: 6.8, // Baisse spectaculaire à 6.8%
    averageCer: 3.2,
    snrImprovementDb: 11.2,
    confidenceScoreAvg: 92.4
  }
];

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'sample-01',
    sampleName: 'Exemple textuel #01 : plateau téléphonique bruité (pas un résultat ASR)',
    audioDurationSeconds: 15.2,
    noiseType: 'Bruit de fond plateau (Voix multiples & Claviers)',
    inputSnrDb: 8.5,
    groundTruthText: "Bonjour je vous appelle pour résilier mon contrat fibre car j'ai trop de coupures réseau en télétravail.",
    results: [
      {
        configId: 'cfg-baseline',
        configName: '1. Baseline ASR',
        predictedText: "Bonjour je vous appel pour résigné mon conte fib car j'ai trop de coupure résidu en télétravail.",
        cer: 16.8,
        rtf: 0.19,
        processingTimeMs: 288,
        confidenceScore: 64,
        wordSubstitutions: 4,
        wordDeletions: 1,
        wordInsertions: 0
      },
      {
        configId: 'cfg-preprocessed',
        configName: '2. Prétraitement Spectral',
        predictedText: "Bonjour je vous appelle pour résilier mon compte fibre car j'ai trop de coupures résidu en télétravail.",
        cer: 9.5,
        rtf: 0.23,
        processingTimeMs: 350,
        confidenceScore: 77,
        wordSubstitutions: 2,
        wordDeletions: 1,
        wordInsertions: 0
      },
      {
        configId: 'cfg-acoustic-tuned',
        configName: '3. Modèle Adapté',
        predictedText: "Bonjour je vous appelle pour résilier mon contrat fibre car j'ai trop de coupures réseau en télétravail.",
        cer: 2.1,
        rtf: 0.30,
        processingTimeMs: 456,
        confidenceScore: 87,
        wordSubstitutions: 1,
        wordDeletions: 0,
        wordInsertions: 0
      },
      {
        configId: 'cfg-kala-full',
        configName: '4. Pipeline Complet KALA',
        predictedText: "Bonjour je vous appelle pour résilier mon contrat fibre car j'ai trop de coupures réseau en télétravail.",
        cer: 0.0,
        rtf: 0.36,
        processingTimeMs: 547,
        confidenceScore: 95,
        wordSubstitutions: 0,
        wordDeletions: 0,
        wordInsertions: 0
      }
    ]
  },
  {
    id: 'sample-02',
    sampleName: 'Exemple textuel #02 : compression GSM (pas un résultat ASR)',
    audioDurationSeconds: 12.8,
    noiseType: 'Codec GSM AMR-NB 8kHz + Décrochages réseau',
    inputSnrDb: 6.2,
    groundTruthText: "Je suis à l'étranger dans un aéroport et j'ai une surfacturation de quarante-cinq euros sur mon pass voyage.",
    results: [
      {
        configId: 'cfg-baseline',
        configName: '1. Baseline ASR',
        predictedText: "Je suis l'étrange dans rapport et j'ai une sur facteur de quarante cinq euro sur mon passe.",
        cer: 22.4,
        rtf: 0.18,
        processingTimeMs: 230,
        confidenceScore: 58,
        wordSubstitutions: 5,
        wordDeletions: 2,
        wordInsertions: 0
      },
      {
        configId: 'cfg-preprocessed',
        configName: '2. Prétraitement Spectral',
        predictedText: "Je suis à l'étranger dans un aéroport et j'ai une surfacture de quarante cinq euros sur mon passe.",
        cer: 12.0,
        rtf: 0.22,
        processingTimeMs: 281,
        confidenceScore: 72,
        wordSubstitutions: 3,
        wordDeletions: 1,
        wordInsertions: 0
      },
      {
        configId: 'cfg-acoustic-tuned',
        configName: '3. Modèle Adapté',
        predictedText: "Je suis à l'étranger dans un aéroport et j'ai une surfacturation de 45 euros sur mon pass voyage.",
        cer: 5.8,
        rtf: 0.28,
        processingTimeMs: 358,
        confidenceScore: 86,
        wordSubstitutions: 1,
        wordDeletions: 1,
        wordInsertions: 0
      },
      {
        configId: 'cfg-kala-full',
        configName: '4. Pipeline Complet KALA',
        predictedText: "Je suis à l'étranger dans un aéroport et j'ai une surfacturation de quarante-cinq euros sur mon pass voyage.",
        cer: 0.0,
        rtf: 0.34,
        processingTimeMs: 435,
        confidenceScore: 94,
        wordSubstitutions: 0,
        wordDeletions: 0,
        wordInsertions: 0
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2024-04-12 11:40:12',
    userId: 'user-qa',
    userName: 'Claire Delattre',
    userRole: 'QA_MANAGER',
    action: 'VALIDATION_QUALITE',
    targetResource: 'Evaluation eval-101 (Appel CALL-2024-0412-8821)',
    details: 'Validation finale de la note qualité (84/100). Rehaussement manuel du critère 9 à 7/10.',
    ipAddress: '192.168.1.42'
  },
  {
    id: 'log-2',
    timestamp: '2024-04-12 11:30:05',
    userId: 'user-qa',
    userName: 'Claire Delattre',
    userRole: 'QA_MANAGER',
    action: 'CORRECTION_TRANSCRIPTION',
    targetResource: 'Transcription trans-101',
    details: 'Correction manuelle du segment 7 (passage bruité par le plateau, mot "répartiteur" corrigé).',
    ipAddress: '192.168.1.42'
  },
  {
    id: 'log-3',
    timestamp: '2024-04-12 10:16:02',
    userId: 'user-admin',
    userName: 'Alexandre Moreau',
    userRole: 'ADMIN',
    action: 'IMPORT_AUDIO',
    targetResource: 'Fichier rec_call_20240412_fibretel_dupont.wav',
    details: 'Import et détection automatique de bruit (SNR 12.4 dB, niveau Modéré).',
    ipAddress: '192.168.1.10'
  },
  {
    id: 'log-4',
    timestamp: '2024-03-22 15:00:00',
    userId: 'user-trainer',
    userName: 'Patrick Simon',
    userRole: 'TRAINER',
    action: 'CREATION_COACHING',
    targetResource: 'Plan de coaching Jean Dupont coach-plan-1',
    details: 'Clôture de l\'objectif 2 (Reformulation validée à 88%). Ajout de la session du 18 avril.',
    ipAddress: '192.168.1.55'
  }
];

export const INITIAL_METRICS: DashboardMetrics = {
  totalCalls: 3050,
  analyzedCalls: 2840,
  transcriptionsCompleted: 2840,
  averageQualityScore: 82.8,
  complianceRate: 94.6,
  totalAgentsCount: 54,
  totalTeamsCount: 6,
  urgentReviewCallsCount: 14,
  coachingNeededAgentsCount: 8,
  averageProgressionPercentage: 11.2
};
