// =============================================================================
// KALA VOICE QA — Générateur de Données d'Appels Sortants (Prospection Télécom & Énergie)
// =============================================================================
import { Call, CallStatus } from '../types';

interface AgentRef {
  id: string;
  name: string;
  teamId: string;
  campaignId: string;
  campaignName: string;
}

export const GENERATED_AGENTS: AgentRef[] = [
  { id: 'agent-1', name: 'Jean Dupont', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-2', name: 'Koffi Mensah', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-3', name: 'Sarah Benali', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Prospection B2C — Audit Solaire & Rénovation' },
  { id: 'agent-4', name: 'Thomas Leroux', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-5', name: 'Amina Traoré', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Téléprospection B2B — Cybersécurité PME' },
  { id: 'agent-6', name: 'Lucas Bernard', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Prospection B2C — Audit Solaire & Rénovation' },
  { id: 'agent-7', name: 'Fatou Diallo', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-8', name: 'Maxime Dubois', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Téléprospection B2B — Cybersécurité PME' },
  { id: 'agent-9', name: 'Chloé Martin', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-10', name: 'Idriss Ndiaye', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Prospection B2C — Audit Solaire & Rénovation' },
  { id: 'agent-11', name: 'Camille Robert', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Téléprospection B2B — Cybersécurité PME' },
  { id: 'agent-12', name: 'Julien Petit', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-13', name: 'Aïssatou Sow', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-14', name: 'David Moreau', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Prospection B2C — Audit Solaire & Rénovation' },
  { id: 'agent-15', name: 'Élodie Roux', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Téléprospection B2B — Cybersécurité PME' },
  { id: 'agent-16', name: 'Ousmane Koné', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-17', name: 'Léa Fournier', teamId: 'team-1', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' },
  { id: 'agent-18', name: 'Nicolas Girard', teamId: 'team-2', campaignId: 'camp-2', campaignName: 'Prospection B2C — Audit Solaire & Rénovation' },
  { id: 'agent-19', name: 'Myriam Khelifi', teamId: 'team-3', campaignId: 'camp-3', campaignName: 'Téléprospection B2B — Cybersécurité PME' },
  { id: 'agent-20', name: 'Antoine Mercier', teamId: 'team-4', campaignId: 'camp-1', campaignName: 'Prospection B2B — Télécom & Cloud Pro' }
];

const SCENARIOS = [
  {
    type: 'PROSPECTION_B2B' as const,
    intent: "Appel à froid B2B : Franchissement de barrage secrétaire et pitch décisionnaire",
    summary: "Prospection sortante auprès d'un dirigeant de PME. Le conseiller franchit l'objection du barrage, présente l'offre d'infrastructure cloud souverain et obtient un rendez-vous de démonstration de 20 minutes.",
    agentDialogues: [
      "Bonjour, Jean Dupont société KALA Télécom. Je souhaite joindre la personne en charge des infrastructures informatiques et télécom s'il vous plaît.",
      "Bonjour M. Lambert, je vous appelle directement car nous accompagnons les PME de votre secteur dans la réduction de 30% de leurs coûts d'interconnexion.",
      "Je comprends que vous soyez déjà engagé, notre démarche est uniquement de vous partager un benchmark comparatif sans engagement.",
      "Avez-vous 15 minutes mardi prochain à 14h pour une démonstration rapide de notre console unifiée ?",
      "C'est noté M. Lambert, invitation envoyée sur votre adresse professionnelle. Je vous remercie pour cet échange."
    ],
    clientDialogues: [
      "Secrétariat de la direction, c'est à quel sujet exactement ? Nous ne prenons pas de démarchage.",
      "Oui c'est moi, mais je suis très pris en ce moment, envoyez-moi plutôt un e-mail.",
      "Nous travaillons déjà avec notre opérateur historique depuis 8 ans, on ne compte pas changer.",
      "Mardi 14h c'est possible, envoyez-moi l'invitation sur mon adresse directe.",
      "Très bien, à mardi alors, bonne journée."
    ],
    objections: ["Barrage standard secrétaire", "Déjà sous contrat opérateur", "Manque de disponibilité"],
    friction: "Réticence initiale forte sur les appels non sollicités."
  },
  {
    type: 'PROSPECTION_B2C_SOLAIRE' as const,
    intent: "Appel sortant B2C : Qualification éligibilité transition énergétique et audit gratuit",
    summary: "Appel à froid pour bilan énergétique solaire. L'agent rassure le prospect sur le caractère sans engagement des aides de l'État et planifie le passage d'un technicien conseil.",
    agentDialogues: [
      "Bonjour Madame Leroy, Thomas du pôle Transition Énergétique Régionale. Je vous contacte au sujet du plan de solarisation de votre commune.",
      "Rassurez-vous, je ne vous vends rien au téléphone, il s'agit d'une vérification d'éligibilité aux subventions MaPrimeRénov.",
      "Êtes-vous bien propriétaire d'une maison individuelle construite depuis plus de deux ans ?",
      "Votre toiture présente une orientation idéale pour une baisse immédiate de 40% sur votre facture d'électricité.",
      "Je réserve le créneau de jeudi à 17h avec notre technicien certifié RGE pour réaliser votre bilan thermique gratuit."
    ],
    clientDialogues: [
      "Allô ? C'est encore du démarchage publicitaire ? Je suis sur liste rouge, comment avez-vous eu mon numéro ?",
      "Je reçois dix appels par semaine pour des panneaux solaires, c'est insupportable.",
      "Oui je suis propriétaire de ma maison depuis 2015, mais je n'ai pas les moyens d'investir des milliers d'euros.",
      "Les aides d'État prennent en charge une vraie partie des travaux ou c'est un crédit déguisé ?",
      "D'accord pour jeudi 17h si c'est strictement gratuit et sans engagement de ma part."
    ],
    objections: ["Méfiance vis-à-vis du démarchage téléphonique", "Crainte d'un crédit masqué"],
    friction: "Saturation des appels sortants à domicile."
  },
  {
    type: 'CHASSE_CYBER_B2B' as const,
    intent: "Prospection sortante B2B : Sensibilisation Directive NIS 2 et offre d'audit de vulnérabilité",
    summary: "Chasse sortante ciblée sur les DSI de PME industrielles. L'agent aborde la conformité réglementaire NIS 2 et décroche un audit flash de surface d'attaque.",
    agentDialogues: [
      "Bonjour M. Benhamou, Amina Traoré de KALA Cyber. Je me permets de vous contacter suite à l'entrée en vigueur de la directive européenne NIS 2.",
      "Nous réalisons cette semaine des diagnostics gratuits de périmètre exposé pour les entreprises industrielles de votre région.",
      "En cas d'attaque par rançongiciel, vos sauvegardes critiques sont-elles isolées hors-ligne en mode immutable ?",
      "C'est précisément sur cette faille que 60% des PME sont bloquées lors d'un sinistre cyber.",
      "Je vous propose de vous restituer votre score d'exposition lors d'un point de 20 minutes jeudi matin."
    ],
    clientDialogues: [
      "Oui bonjour, je suis en réunion d'équipe, soyez très bref s'il vous plaît.",
      "Nous avons déjà un pare-feu de dernière génération et un prestataire infogérance externe.",
      "Nos sauvegardes sont sur le cloud Azure, donc nous sommes protégés en principe.",
      "Je ne connaissais pas ce point précis sur l'immutabilité réglementaire requise par la directive.",
      "Envoyez-moi un créneau jeudi à 11h, je regarderai vos conclusions."
    ],
    objections: ["Prestataire informatique déjà en place", "Budget annuel déjà clôturé"],
    friction: "Pression temporelle du DSI en journée."
  },
  {
    type: 'FLOTTE_MOBILE_PRO' as const,
    intent: "Téléprospection sortante : Optimisation des forfaits flottes d'entreprises",
    summary: "Appel à froid auprès d'un responsable d'exploitation logistique. L'agent analyse les surcoûts de data à l'international et propose un audit comparatif.",
    agentDialogues: [
      "Bonjour M. Mercier, Koffi de KALA Télécom Pro. Je vous contacte au sujet de la gestion de votre flotte mobile de chauffeurs livreurs.",
      "Nous constatons que beaucoup de sociétés de transport paient des dépassements de data de 40% sur leurs forfaits professionnels.",
      "Combien de lignes mobiles actives gérez-vous actuellement au sein de votre flotte ?",
      "Nous pouvons regrouper vos 25 lignes sur un forfait partagé avec data illimitée en Europe à tarif garanti.",
      "Je vous fais parvenir notre comparatif personnalisé avant notre échange de vendredi."
    ],
    clientDialogues: [
      "Bonjour, vous tombez mal, je prépare le départ des tournées de livraison.",
      "C'est vrai que les factures de dépassement data des chauffeurs ont explosé le mois dernier.",
      "Nous avons 25 lignes environ réparties sur deux opérateurs différents.",
      "Si vous pouvez vraiment nous faire économiser sans changer les cartes SIM en urgence, ça m'intéresse.",
      "Parfait, j'attends votre étude comparative par mail."
    ],
    objections: ["Manque de temps en exploitation", "Complexité de migration de cartes SIM"],
    friction: "Horaires serrés du responsable logistique."
  }
];

const NOISE_PROFILES = [
  { level: 'FAIBLE' as const, snr: 22.4, score: 94, type: 'PLATEAU_CALL_CENTER' as const },
  { level: 'MODÉRÉ' as const, snr: 15.2, score: 82, type: 'PLATEAU_CALL_CENTER' as const },
  { level: 'SÉVÈRE' as const, snr: 9.8, score: 68, type: 'GSM_COMPRESSION' as const },
  { level: 'CRITIQUE' as const, snr: 4.5, score: 52, type: 'ECHO_ACOUSTIQUE' as const }
];

export function generateCallsDataset(): Call[] {
  const calls: Call[] = [];
  const TOTAL_CALLS = 100;

  for (let i = 1; i <= TOTAL_CALLS; i++) {
    const agent = GENERATED_AGENTS[(i - 1) % GENERATED_AGENTS.length];
    const scenario = SCENARIOS[(i - 1) % SCENARIOS.length];
    const noise = NOISE_PROFILES[(i * 3) % NOISE_PROFILES.length];

    // Durée réaliste d'un appel à froid de prospection sortante : 90s à 240s
    const duration = 90 + ((i * 13) % 150);

    const day = (i % 28) + 1;
    const month = i > 60 ? '04' : i > 25 ? '03' : '02';
    const hour = 9 + (i % 8);
    const minute = (i * 7) % 60;
    const dateStr = `2024-${month}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Statut de traitement QA
    const statusCycle = ['EVALUE', 'EVALUE', 'A_ANALYSER', 'EVALUE', 'COACHING_RECOMMANDE', 'A_REVOIR'];
    const status = statusCycle[i % statusCycle.length] as CallStatus;

    let qualityScore: number | undefined = undefined;
    if (status === 'EVALUE' || status === 'COACHING_RECOMMANDE' || status === 'A_REVOIR') {
      if (status === 'COACHING_RECOMMANDE') {
        qualityScore = 64 + (i % 10);
      } else if (status === 'A_REVOIR') {
        qualityScore = 68 + (i % 8);
      } else {
        qualityScore = 78 + (i % 20);
      }
    }

    const isUrgent = status === 'A_REVOIR' || (qualityScore !== undefined && qualityScore < 70);

    // Générer les segments audio
    const segments = [];
    let currentTime = 1.5;
    for (let s = 0; s < 5; s++) {
      const isAgent = s % 2 === 0;
      const segDuration = 5 + ((i + s * 2) % 7);
      const text = isAgent ? scenario.agentDialogues[s] : scenario.clientDialogues[s];

      segments.push({
        id: `seg-${i}-${s + 1}`,
        transcriptionId: `trans-${i}`,
        speaker: isAgent ? ('AGENT' as const) : ('CLIENT' as const),
        speakerLabel: isAgent ? `CONSEILLER (${agent.name})` : 'PROSPECT',
        startTime: parseFloat(currentTime.toFixed(1)),
        endTime: parseFloat((currentTime + segDuration).toFixed(1)),
        text,
        confidenceScore: parseFloat((0.86 + ((i + s) % 12) * 0.01).toFixed(2)),
        isNoisyPassage: noise.level === 'SÉVÈRE' || noise.level === 'CRITIQUE',
        noiseImpactLevel: noise.level === 'FAIBLE' ? ('AUCUN' as const) : noise.level === 'MODÉRÉ' ? ('MODÉRÉ' as const) : ('FORT' as const)
      });
      currentTime += segDuration + 1.0;
    }

    const waveformSamples = Array.from({ length: 48 }, (_, idx) => 
      parseFloat((0.2 + 0.6 * Math.abs(Math.sin((idx + i) * 0.4))).toFixed(2))
    );

    const callRecord: Call = {
      id: `call-${i}`,
      callNumber: `OUT-2024-${month}${day.toString().padStart(2, '0')}-${1000 + i}`,
      agentId: agent.id,
      agentName: agent.name,
      teamId: agent.teamId,
      campaignId: agent.campaignId,
      campaignName: agent.campaignName,
      customerPhoneMasked: `+33 ${i % 2 === 0 ? '6' : '1'} •• •• ${((i * 17) % 90 + 10)} ${((i * 31) % 90 + 10)}`,
      customerNameMasked: `Prospect ${String.fromCharCode(65 + (i % 26))}. ${(i * 41) % 899 + 100}••`,
      callDate: dateStr,
      durationSeconds: duration,
      direction: 'SORTANT',
      callType: 'PROSPECTION',
      status,
      qualityScore,
      isUrgentReviewRequired: isUrgent,
      audioMetadata: {
        id: `audio-${i}`,
        filename: `rec_outbound_${month}_${day}_${i}.wav`,
        fileSizeBytes: duration * 16000 * 2,
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
        asrModelUsed: noise.snr < 15 ? 'Whisper Large-v3 + DeepFilterNet3' : 'Whisper Large-v3 (Direct)',
        totalWords: 120 + (i % 60),
        processingTimeMs: 240 + (i % 120),
        globalConfidenceScore: noise.score,
        noiseRobustnessScore: noise.snr > 12 ? 88 : 74,
        rawText: segments.map(s => `${s.speaker}: ${s.text}`).join(' '),
        segments,
        createdAt: dateStr
      },
      analytics: {
        id: `analytics-${i}`,
        callId: `call-${i}`,
        summary: scenario.summary,
        contactIntent: scenario.intent,
        mainTopics: ['Prospection Sortante', 'Accroche Décisionnaire', agent.campaignName.split('—')[0].trim()],
        keywords: ['Prospection', 'Accroche', 'Objection', 'Rendez-vous', 'Benchmark', 'Offre'],
        sentimentAgent: qualityScore && qualityScore >= 75 ? 'POSITIF' : 'NEUTRE',
        sentimentClient: isUrgent ? 'TRÈS_FRUSTRÉ' : qualityScore && qualityScore >= 80 ? 'POSITIF' : 'MITIGÉ',
        sentimentTimeline: [
          { minute: 1, agentSentiment: 0.5, clientSentiment: -0.4 },
          { minute: 2, agentSentiment: 0.7, clientSentiment: 0.3 },
          { minute: 3, agentSentiment: 0.8, clientSentiment: 0.7 }
        ],
        objectionsDetected: scenario.objections,
        unresolvedIssues: qualityScore && qualityScore >= 80 ? [] : ['Réticence sur le budget ou le créneau'],
        resolutionStatus: qualityScore && qualityScore >= 80 ? 'RÉSOLU' : 'NON_RÉSOLU',
        actionItemsRequested: ['Envoi de la synthèse par email', 'Calage créneau agenda'],
        importantInformation: ['Interlocuteur décideur qualifié', 'Parc existant sous engagement'],
        criticalMoments: isUrgent ? [
          {
            timestamp: 45,
            type: 'OBJECTION',
            description: scenario.friction
          }
        ] : [],
        agentTalkTimeSeconds: Math.round(duration * 0.55),
        clientTalkTimeSeconds: Math.round(duration * 0.38),
        talkToListenRatio: 1.45,
        interruptionCount: (i % 3),
        totalSilenceSeconds: Math.round(duration * 0.07),
        speechRateWpm: 145 + (i % 25),
        detectedCommunicationIssues: isUrgent ? ['Débit rapide lors de l\'accroche'] : [],
        aiDisclaimer: "Analyse acoustique & sémantique automatisée — Aide à la décision pour superviseur."
      }
    };

    calls.push(callRecord);
  }

  return calls;
}
