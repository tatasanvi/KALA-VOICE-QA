import { Call, CallStatus } from '../types';

interface AgentRef {
  id: string;
  name: string;
  teamId: string;
  campaignId: string;
  campaignName: string;
}

export const GENERATED_AGENTS: AgentRef[] = [
  { id: 'agent-1', name: 'Jean Dupont', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-2', name: 'Koffi Mensah', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-3', name: 'Sarah Benali', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Assurance Auto & Habitation — Sinistres' },
  { id: 'agent-4', name: 'Thomas Leroux', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-5', name: 'Amina Traoré', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Énergie & Facturation Verte — Service Client' },
  { id: 'agent-6', name: 'Lucas Bernard', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Assurance Auto & Habitation — Sinistres' },
  { id: 'agent-7', name: 'Fatou Diallo', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-8', name: 'Maxime Dubois', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Énergie & Facturation Verte — Service Client' },
  { id: 'agent-9', name: 'Chloé Martin', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-10', name: 'Idriss Ndiaye', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Assurance Auto & Habitation — Sinistres' },
  { id: 'agent-11', name: 'Camille Robert', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Énergie & Facturation Verte — Service Client' },
  { id: 'agent-12', name: 'Julien Petit', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-13', name: 'Aïssatou Sow', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-14', name: 'David Moreau', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Assurance Auto & Habitation — Sinistres' },
  { id: 'agent-15', name: 'Élodie Roux', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Énergie & Facturation Verte — Service Client' },
  { id: 'agent-16', name: 'Ousmane Koné', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-17', name: 'Léa Fournier', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' },
  { id: 'agent-18', name: 'Nicolas Girard', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Assurance Auto & Habitation — Sinistres' },
  { id: 'agent-19', name: 'Myriam Khelifi', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Énergie & Facturation Verte — Service Client' },
  { id: 'agent-20', name: 'Antoine Mercier', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Télécom Fibre & Mobile — Rétention' }
];

const SCENARIOS = [
  {
    type: 'RÉTENTION' as const,
    intent: "Demande de résiliation pour hausse tarifaire et proposition d'alignement",
    summary: "Le client souhaite résilier suite à la fin de sa période promotionnelle. Le conseiller applique les techniques d'écoute et propose une réduction de 10€/mois pour conserver l'abonné.",
    agentDialogues: [
      "Bonjour, Service Rétention Fibre, je suis à votre écoute.",
      "Je comprends tout à fait votre surprise concernant la fin de la remise promotionnelle.",
      "Permettez-moi de vérifier les offres fidélité applicables à votre compte.",
      "Je peux vous maintenir un tarif préférentiel à 29,99€ par mois pendant 12 mois supplémentaires avec l'option Wi-Fi 6 offerte.",
      "Parfait, votre abonnement est reconduit avec ces nouveaux avantages sans coupure de service."
    ],
    clientDialogues: [
      "Bonjour, j'appelle pour résilier ma ligne fibre, vous avez augmenté ma facture de 15€ sans préavis.",
      "La concurrence me propose 25€ par mois avec la même vitesse.",
      "D'accord, mais je ne veux pas être réengagé pour rien.",
      "Si vous maintenez ce tarif à 29,99€, ça me convient, j'accepte de rester.",
      "Merci, confirmez-moi bien tout ça par e-mail s'il vous plaît."
    ],
    objections: ["Hausse de tarif non justifiée", "Offre concurrente plus attractive"],
    friction: "Contestation vive sur le montant facturé en mars."
  },
  {
    type: 'SUPPORT_TECHNIQUE' as const,
    intent: "Panne de connexion fibre optique avec voyant rouge clignotant sur la box",
    summary: "Diagnostic d'un incident de synchronisation optique suite à des travaux de voirie dans le quartier. Planification d'un technicien sous 24h avec prêt d'un galet 4G de secours.",
    agentDialogues: [
      "Bonjour, Assistance Technique, que puis-je faire pour vous aider ?",
      "Avez-vous redémarré votre boîtier ONT optique blanc relié à la prise murale ?",
      "Je lance un test d'alignement de ligne à distance sur votre numéro d'accès.",
      "Une coupure physique est détectée sur le point de mutualisation de votre rue. Un technicien intervient demain à 14h.",
      "Je vous active immédiatement 200 Go d'Internet mobile gratuit sur votre forfait pour pallier l'attente."
    ],
    clientDialogues: [
      "Bonjour, ma box affiche le voyant LOS rouge clignotant depuis ce matin, je suis en télétravail !",
      "Oui, j'ai tout débranché et rebranché trois fois, ça ne change rien.",
      "J'ai absolument besoin de travailler cet après-midi pour une réunion importante.",
      "D'accord pour demain 14h, et pour la 4G de dépannage c'est très appréciable.",
      "Merci pour la prise en charge rapide."
    ],
    objections: ["Urgence professionnelle liée au télétravail"],
    friction: "Inquiétude sur le délai d'intervention physique."
  },
  {
    type: 'RÉCLAMATION' as const,
    intent: "Déclaration de dégât des eaux et demande d'ouverture de dossier sinistre",
    summary: "Le client déclare une fuite d'eau importante venant du plafond de sa salle de bain. Le conseiller valide les pièces justificatives et mandate un artisan conventionné.",
    agentDialogues: [
      "Bonjour, Service Gestion des Sinistres, je vous écoute.",
      "Avez-vous pu identifier si la fuite provient de l'appartement du dessus ou des parties communes ?",
      "Je vous confirme la prise en compte immédiate de votre déclaration sous la référence SIN-2024.",
      "Nous missionnons un plombier partenaire pour la recherche de fuite sans avance de frais de votre part.",
      "Je vous transmets par SMS le numéro de dossier et le contact direct de l'expert en charge."
    ],
    clientDialogues: [
      "Bonjour, j'ai une infiltration d'eau très importante dans mon salon, le voisin du dessus est absent !",
      "J'ai coupé l'eau de l'immeuble mais le plâtre commence à cloquer sérieusement.",
      "Mon contrat tous risques habitation couvre-t-il bien la recherche de fuite destructive ?",
      "C'est rassurant. Pouvez-vous envoyer quelqu'un dans la journée ?",
      "Bien reçu le SMS, merci beaucoup pour votre réactivité."
    ],
    objections: ["Doute sur l'application des franchises d'assurance"],
    friction: "Stress élevé face aux dommages matériels constatés."
  },
  {
    type: 'COMMERCIAL' as const,
    intent: "Souscription d'un contrat d'énergie verte avec demande d'estimation de consommation",
    summary: "Comparaison des tarifs kWh heures pleines / heures creuses et transition vers une électricité 100% renouvelable certifiée Garanties d'Origine.",
    agentDialogues: [
      "Bonjour, Service Conseil Énergie, comment puis-je vous renseigner ?",
      "Votre compteur Linky permet une tarification dynamique très avantageuse le week-end.",
      "Sur la base de votre surface de 85m² chauffée à l'électrique, nous estimons votre mensualité à 94€.",
      "Nous prenons en charge l'ensemble des démarches de résiliation auprès de votre ancien fournisseur sans coupure.",
      "Le contrat prend effet dès le 1er du mois prochain, je vous adresse la synthèse contractuelle."
    ],
    clientDialogues: [
      "Bonjour, je viens d'emménager et je souhaite souscrire un contrat d'électricité d'origine renouvelable.",
      "Combien coûte le kWh par rapport au tarif réglementé de vente d'EDF ?",
      "Est-ce que je risque une coupure pendant le changement de fournisseur ?",
      "94€ par mois me paraît raisonnable compte tenu de mes équipements.",
      "C'est très clair, je signe électroniquement le mandat."
    ],
    objections: ["Peur d'une coupure d'énergie pendant le transfert de compteur"],
    friction: "Compréhension de la complexité des taxes d'acheminement."
  }
];

const NOISE_PROFILES = [
  { level: 'FAIBLE' as const, type: 'AUCUN' as const, snr: 22.4, score: 94 },
  { level: 'MODÉRÉ' as const, type: 'PLATEAU_CALL_CENTER' as const, snr: 13.8, score: 82 },
  { level: 'MODÉRÉ' as const, type: 'GSM_COMPRESSION' as const, snr: 11.2, score: 78 },
  { level: 'SÉVÈRE' as const, type: 'RUE_URBAIN' as const, snr: 4.6, score: 64 },
  { level: 'CRITIQUE' as const, type: 'ECHO_ACOUSTIQUE' as const, snr: -1.8, score: 48 }
];

const STATUS_DISTRIBUTION: CallStatus[] = [
  'EVALUE', 'EVALUE', 'EVALUE', 'EVALUE', 'TRANSCRIT', 'TRANSCRIT',
  'A_ANALYSER', 'A_REVOIR', 'COACHING_RECOMMANDE'
];

export function generateCallsDataset(): Call[] {
  const generatedCalls: Call[] = [];

  for (let i = 105; i <= 210; i++) {
    const agent = GENERATED_AGENTS[(i - 105) % GENERATED_AGENTS.length];
    const scenario = SCENARIOS[(i - 105) % SCENARIOS.length];
    const noise = NOISE_PROFILES[(i * 3) % NOISE_PROFILES.length];
    const status = STATUS_DISTRIBUTION[(i * 7) % STATUS_DISTRIBUTION.length];

    const day = ((i * 3) % 28) + 1;
    const hour = 8 + ((i * 5) % 11);
    const minute = (i * 13) % 60;
    const month = i % 2 === 0 ? '04' : '03';
    const dateStr = `2024-${month}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const duration = 90 + ((i * 17) % 210);

    // Calcul de score cohérent avec le statut
    let qualityScore: number | undefined = undefined;
    if (status === 'EVALUE' || status === 'COACHING_RECOMMANDE' || status === 'A_REVOIR') {
      if (status === 'COACHING_RECOMMANDE') {
        qualityScore = 62 + (i % 12); // score faible déclenchant le coaching
      } else if (status === 'A_REVOIR') {
        qualityScore = 68 + (i % 10);
      } else {
        qualityScore = 78 + (i % 20); // bon score
      }
    }

    const isUrgent = status === 'A_REVOIR' || (qualityScore !== undefined && qualityScore < 70);

    // Générer les segments audio
    const segments = [];
    let currentTime = 2.0;
    for (let s = 0; s < 5; s++) {
      const isAgent = s % 2 === 0;
      const segDuration = 6 + ((i + s * 3) % 8);
      const text = isAgent ? scenario.agentDialogues[s] : scenario.clientDialogues[s];

      segments.push({
        id: `seg-${i}-${s + 1}`,
        transcriptionId: `trans-${i}`,
        speaker: isAgent ? ('AGENT' as const) : ('CLIENT' as const),
        speakerLabel: isAgent ? `AGENT (${agent.name})` : 'CLIENT',
        startTime: parseFloat(currentTime.toFixed(1)),
        endTime: parseFloat((currentTime + segDuration).toFixed(1)),
        text,
        confidenceScore: parseFloat((0.85 + ((i + s) % 14) * 0.01).toFixed(2)),
        isNoisyPassage: noise.level === 'SÉVÈRE' || noise.level === 'CRITIQUE',
        noiseImpactLevel: noise.level === 'FAIBLE' ? ('AUCUN' as const) : noise.level === 'MODÉRÉ' ? ('MODÉRÉ' as const) : ('FORT' as const)
      });
      currentTime += segDuration + 1.2;
    }

    // Amplitudes de forme d'onde synthétiques
    const waveformSamples = Array.from({ length: 48 }, (_, idx) => 
      parseFloat((0.2 + 0.6 * Math.abs(Math.sin((idx + i) * 0.4))).toFixed(2))
    );

    const callRecord: Call = {
      id: `call-${i}`,
      callNumber: `CALL-2024-${month}${day.toString().padStart(2, '0')}-${1000 + i}`,
      agentId: agent.id,
      agentName: agent.name,
      teamId: agent.teamId,
      campaignId: agent.campaignId,
      campaignName: agent.campaignName,
      customerPhoneMasked: `+33 ${i % 2 === 0 ? '6' : '7'} •• •• ${((i * 17) % 90 + 10)} ${((i * 31) % 90 + 10)}`,
      customerNameMasked: `Client ${String.fromCharCode(65 + (i % 26))}. ${(i * 41) % 899 + 100}••`,
      callDate: dateStr,
      durationSeconds: duration,
      direction: i % 4 === 0 ? 'SORTANT' : 'ENTRANT',
      callType: scenario.type,
      status,
      qualityScore,
      isUrgentReviewRequired: isUrgent,
      audioMetadata: {
        id: `audio-${i}`,
        filename: `rec_call_2024_${month}_${day}_${i}.wav`,
        fileSizeBytes: duration * 19200,
        durationSeconds: duration,
        sampleRateHz: 16000,
        channels: 1,
        snrDb: noise.snr,
        estimatedNoiseLevel: noise.level,
        noiseType: noise.type,
        audioQualityScore: noise.score,
        waveformSamples
      },
      transcription: {
        id: `trans-${i}`,
        callId: `call-${i}`,
        audioFileId: `audio-${i}`,
        versionNumber: 1,
        isLatest: true,
        asrModelUsed: noise.level === 'FAIBLE' ? 'KALA-Whisper-v3-Standard' : 'KALA-Denoiser+Whisper-Large-v3',
        totalWords: 140 + (i % 80),
        processingTimeMs: 280 + (i % 140),
        globalConfidenceScore: noise.score,
        noiseRobustnessScore: noise.snr > 10 ? 88 : 72,
        rawText: segments.map(s => `${s.speaker}: ${s.text}`).join(' '),
        segments,
        createdAt: dateStr
      },
      analytics: {
        id: `analytics-${i}`,
        callId: `call-${i}`,
        summary: scenario.summary,
        contactIntent: scenario.intent,
        mainTopics: [scenario.type, 'Traitement Relation Client', agent.campaignName.split('—')[0].trim()],
        keywords: ['Contrat', 'Tarif', 'Fidélité', 'Procédure', 'Garantie'],
        sentimentAgent: qualityScore && qualityScore >= 75 ? 'POSITIF' : 'NEUTRE',
        sentimentClient: isUrgent ? 'TRÈS_FRUSTRÉ' : qualityScore && qualityScore >= 80 ? 'POSITIF' : 'MITIGÉ',
        sentimentTimeline: [
          { minute: 1, agentSentiment: 0.4, clientSentiment: -0.6 },
          { minute: 2, agentSentiment: 0.7, clientSentiment: 0.2 },
          { minute: 3, agentSentiment: 0.8, clientSentiment: 0.6 }
        ],
        objectionsDetected: scenario.objections,
        unresolvedIssues: isUrgent ? ['Nécessite rappel de confirmation par un superviseur'] : [],
        resolutionStatus: isUrgent ? 'EN_COURS' : 'RÉSOLU',
        actionItemsRequested: [
          'Envoi récapitulatif par e-mail au client',
          'Mise à jour du CRM dans la fiche abonné'
        ],
        importantInformation: [
          `Numéro de dossier archivé sous référence #${2024000 + i}`,
          'Vérification d\'identité validée avec succès'
        ],
        criticalMoments: [
          {
            timestamp: 25,
            type: 'OBJECTION',
            description: scenario.friction
          }
        ],
        agentTalkTimeSeconds: Math.round(duration * 0.52),
        clientTalkTimeSeconds: Math.round(duration * 0.43),
        talkToListenRatio: 1.21,
        interruptionCount: i % 3,
        totalSilenceSeconds: Math.round(duration * 0.05),
        speechRateWpm: 135 + (i % 25),
        detectedCommunicationIssues: qualityScore && qualityScore < 75 
          ? ['Manque de reformulation explicite', 'Hésitation sur les conditions contractuelles'] 
          : [],
        aiDisclaimer: "Information détectée par le modèle ASR & NLP KALA. Les suggestions d'axes de coaching sont soumises à la validation humaine du responsable qualité.",
        groundTruthDetected: [
          'Authentification de l\'appelant validée',
          'Motif principal de contact identifié',
          'Présence de la mention légale d\'enregistrement'
        ],
        aiSuggestions: [
          qualityScore && qualityScore < 75 ? 'Recommandation : Programmer un atelier sur la gestion des objections' : 'Recommandation : Féliciter l\'agent sur sa posture d\'écoute',
          'Suggestion d\'affectation d\'un module e-learning de perfectionnement'
        ],
        undeterminedFields: [
          'Niveau de satisfaction client post-résolution (enquête SMS à envoyer)'
        ]
      }
    };

    generatedCalls.push(callRecord);
  }

  return generatedCalls;
}
