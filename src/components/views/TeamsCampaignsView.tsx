import React, { useState } from 'react';
import { 
  FolderGit2, Users, Flag, Award, CheckCircle2, PhoneCall, Plus, 
  UploadCloud, Settings, Wifi, Radio, RefreshCw, Save, X, FileText
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserRole, Campaign, CtiIntegrationConfig } from '../../types';

interface TeamsCampaignsViewProps {
  onSelectAgent: (id: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
  defaultTab?: 'CAMPAIGNS' | 'TEAMS' | 'CTI';
}

export const TeamsCampaignsView: React.FC<TeamsCampaignsViewProps> = ({ 
  onSelectAgent, 
  onNavigate,
  currentRole,
  defaultTab = 'CAMPAIGNS'
}) => {
  const campaigns = storageService.getCampaigns();
  const teams = storageService.getTeams();
  const agents = storageService.getAgents();
  const ctiConfig = storageService.getCtiConfig();

  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'TEAMS' | 'CTI'>(defaultTab);

  // État Modal Création Campagne
  const [showCampModal, setShowCampModal] = useState(false);
  const [campName, setCampName] = useState('');
  const [campSector, setCampSector] = useState('Télécommunications');
  const [campType, setCampType] = useState<'ENTRANT' | 'SORTANT'>('ENTRANT');
  const [targetQuality, setTargetQuality] = useState(85);
  const [campDesc, setCampDesc] = useState('');

  // État Configuration CTI
  const [ctiProvider, setCtiProvider] = useState(ctiConfig.provider);
  const [ctiEndpoint, setCtiEndpoint] = useState(ctiConfig.endpointUrl);
  const [ctiAutoAnalyze, setCtiAutoAnalyze] = useState(ctiConfig.autoAnalyze);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Création d'une nouvelle campagne
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) return;

    storageService.addCampaign({
      name: campName.trim(),
      clientSector: campSector,
      type: campType,
      targetQualityScore: targetQuality,
      activeAgentsCount: 6,
      totalCallsCount: 0,
      complianceRate: 100,
      description: campDesc.trim() || 'Campagne opérationnelle KALA.'
    });

    setShowCampModal(false);
    setCampName('');
    setCampDesc('');
  };

  // Sauvegarde configuration CTI
  const handleSaveCti = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateCtiConfig({
      provider: ctiProvider,
      endpointUrl: ctiEndpoint,
      autoAnalyze: ctiAutoAnalyze,
      status: 'CONNECTÉ'
    });
    alert('✅ Paramètres CTI enregistrés avec succès !');
  };

  // Simuler un appel entrant CTI en temps réel
  const handleSimulateCtiCall = () => {
    setIsSimulating(true);
    const ts = new Date().toLocaleTimeString();
    setSimulationLog(prev => [
      `[${ts}] 📞 Signal RING entrant détecté via Webhook CTI (${ctiProvider})...`,
      ...prev
    ]);

    setTimeout(() => {
      const callNum = `CTI-IN-${Math.floor(1000 + Math.random() * 9000)}`;
      const assignedAgent = agents[Math.floor(Math.random() * agents.length)];
      
      setSimulationLog(prev => [
        `[${new Date().toLocaleTimeString()}] ✅ Décroché par ${assignedAgent.name} (Poste 104) — Stream audio SIP capturé (G.711 / 16kHz)`,
        `[${new Date().toLocaleTimeString()}] 🎙️ Pipeline Débruitage KALA actif : WER estimé ~4.1%`,
        `[${new Date().toLocaleTimeString()}] 💾 Appel ${callNum} enregistré et archivé avec succès`,
        ...prev
      ]);

      // Ajouter l'appel simulé
      storageService.addCall({
        id: `call-cti-${Date.now()}`,
        callNumber: callNum,
        agentId: assignedAgent.id,
        agentName: assignedAgent.name,
        teamId: assignedAgent.teamId,
        campaignId: assignedAgent.campaignId,
        campaignName: assignedAgent.campaignName,
        customerPhoneMasked: '+33 6 •• •• 88 12',
        customerNameMasked: 'Mme Sophie Bernard (Anonymisé)',
        callDate: new Date().toISOString().substring(0, 10),
        durationSeconds: 145,
        direction: 'ENTRANT',
        callType: 'SUPPORT_TECHNIQUE',
        audioMetadata: {
          id: `audio-${callNum}`,
          filename: `${callNum}.wav`,
          fileSizeBytes: 1840000,
          durationSeconds: 145,
          sampleRateHz: 16000,
          channels: 1,
          snrDb: 18.4,
          estimatedNoiseLevel: 'MODÉRÉ',
          noiseType: 'PLATEAU_CALL_CENTER',
          audioQualityScore: 88,
          waveformSamples: [0.1, 0.4, 0.7, 0.5, 0.8, 0.6, 0.3, 0.7, 0.9, 0.4]
        },
        transcription: {
          id: `trans-${callNum}`,
          callId: `call-cti-${Date.now()}`,
          audioFileId: `audio-${callNum}`,
          versionNumber: 1,
          isLatest: true,
          asrModelUsed: 'KALA-Denoiser+Whisper-Large-v3',
          totalWords: 45,
          processingTimeMs: 820,
          globalConfidenceScore: 94,
          noiseRobustnessScore: 92,
          rawText: `Bonjour, ${assignedAgent.name} à votre écoute, en quoi puis-je vous être utile ?`,
          createdAt: new Date().toISOString().substring(0, 10),
          segments: [
            {
              id: 'cti-seg-1',
              transcriptionId: `trans-${callNum}`,
              speaker: 'AGENT',
              speakerLabel: assignedAgent.name,
              startTime: 1.0,
              endTime: 4.5,
              text: `Bonjour, ${assignedAgent.name} à votre écoute, en quoi puis-je vous être utile ?`,
              confidenceScore: 0.96,
              isNoisyPassage: false,
              noiseImpactLevel: 'AUCUN',
              hasBeenEdited: false
            },
            {
              id: 'cti-seg-2',
              transcriptionId: `trans-${callNum}`,
              speaker: 'CLIENT',
              speakerLabel: 'Client',
              startTime: 5.2,
              endTime: 12.0,
              text: "Bonjour, je vous contacte suite à un message automatique reçu ce matin.",
              confidenceScore: 0.93,
              isNoisyPassage: false,
              noiseImpactLevel: 'AUCUN',
              hasBeenEdited: false
            },
            {
              id: 'cti-seg-3',
              transcriptionId: `trans-${callNum}`,
              speaker: 'AGENT',
              speakerLabel: assignedAgent.name,
              startTime: 12.8,
              endTime: 22.0,
              text: "Je vous rassure, je prends en charge votre demande immédiatement.",
              confidenceScore: 0.95,
              isNoisyPassage: false,
              noiseImpactLevel: 'AUCUN',
              hasBeenEdited: false
            }
          ]
        },
        analytics: {
          id: `analytics-${callNum}`,
          callId: `call-cti-${Date.now()}`,
          summary: `Appel reçu en direct via le connecteur CTI ${ctiProvider}. Prise en charge rapide par ${assignedAgent.name}.`,
          contactIntent: "Renseignement suite à message automatique",
          mainTopics: ["Renseignement", "Notification reçue"],
          keywords: ['message', 'suivi', 'prise en charge'],
          sentimentAgent: 'POSITIF',
          sentimentClient: 'POSITIF',
          sentimentTimeline: [
            { minute: 0.5, agentSentiment: 0.8, clientSentiment: 0.4 },
            { minute: 1.0, agentSentiment: 0.9, clientSentiment: 0.8 }
          ],
          objectionsDetected: [],
          unresolvedIssues: [],
          resolutionStatus: 'RÉSOLU',
          actionItemsRequested: [],
          importantInformation: [],
          criticalMoments: [],
          agentTalkTimeSeconds: 80,
          clientTalkTimeSeconds: 65,
          talkToListenRatio: 1.2,
          interruptionCount: 0,
          totalSilenceSeconds: 2,
          speechRateWpm: 140,
          detectedCommunicationIssues: [],
          aiDisclaimer: "Analyse générée automatiquement via le flux CTI KALA à titre indicatif."
        },
        isUrgentReviewRequired: false,
        qualityScore: 92
      });

      storageService.addNotification({
        type: 'SYSTEM',
        title: `Nouvel appel capturé CTI : ${callNum}`,
        message: `Prise en charge par ${assignedAgent.name} via ${ctiProvider}. Transcription disponible.`,
        targetView: 'calls',
        priority: 'INFO'
      });

      setIsSimulating(false);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* En-tête & Onglets */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderGit2 size={22} color="var(--primary-light)" />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Organisation : Équipes, Campagnes & Téléphonie</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Structure opérationnelle, objectifs qualité par campagne et connecteur de téléphonie CTI.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeTab === 'CAMPAIGNS' && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowCampModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Créer une Campagne</span>
            </button>
          )}

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'CAMPAIGNS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('CAMPAIGNS')}
            >
              <Flag size={13} />
              <span>Campagnes ({campaigns.length})</span>
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'TEAMS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('TEAMS')}
              style={{ marginLeft: '4px' }}
            >
              <Users size={13} />
              <span>Équipes ({teams.length})</span>
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'CTI' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('CTI')}
              style={{ marginLeft: '4px' }}
            >
              <Radio size={13} />
              <span>Connecteur CTI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── ONGLET 1 : CAMPAGNES ────────────────────────────────────────── */}
      {activeTab === 'CAMPAIGNS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {campaigns.map(camp => (
            <div key={camp.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span className={`badge ${camp.type === 'ENTRANT' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '11px', marginBottom: '6px' }}>
                      {camp.type === 'ENTRANT' ? 'Appels Entrants' : 'Campagne Sortante'}
                    </span>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>{camp.name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Secteur : {camp.clientSector}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {camp.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agents Actifs</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{camp.activeAgentsCount}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Volume Appels</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-light)' }}>{camp.totalCallsCount}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cible QA</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>{camp.targetQualityScore}%</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <span className="badge badge-green" style={{ fontSize: '11.5px' }}>
                  <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                  Conformité : {camp.complianceRate}%
                </span>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('calls')}
                >
                  <PhoneCall size={12} />
                  <span>Voir les Appels</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── ONGLET 2 : ÉQUIPES ────────────────────────────────────────── */}
      {activeTab === 'TEAMS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {teams.map(team => {
            const teamMembers = agents.filter(a => a.teamId === team.id);
            return (
              <div key={team.id} className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{team.name}</h3>
                  <span className="badge badge-green" style={{ fontSize: '12px' }}>
                    Score : {team.averageQualityScore}%
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  {team.description}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '12.5px' }}>
                  <strong>Superviseur référent :</strong> {team.supervisorName}
                </div>

                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Conseillers de l'équipe ({teamMembers.length}) :
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {teamMembers.map(member => (
                    <div 
                      key={member.id} 
                      onClick={() => {
                        onSelectAgent(member.id);
                        onNavigate('agents');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      title="Cliquer pour voir la fiche 360°"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={member.avatarUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{member.name}</span>
                      </div>
                      <span className={`badge ${member.averageQualityScore >= 80 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
                        {member.averageQualityScore}% QA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── ONGLET 3 : CONNECTEUR CTI & TÉLÉPHONIE ──────────────────────── */}
      {activeTab === 'CTI' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          {/* Formulaire Configuration */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Radio size={20} color="var(--primary-light)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Intégration CTI & Flux Téléphoniques</h3>
            </div>

            <form onSubmit={handleSaveCti} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Fournisseur de Téléphonie / ACD
                </label>
                <select 
                  value={ctiProvider}
                  onChange={e => setCtiProvider(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                >
                  <option value="GENESYS_CLOUD">Genesys Cloud (REST + Webhook Recording)</option>
                  <option value="ASTERISK_PBX">Asterisk / FreePBX (AMI + SIP Recording)</option>
                  <option value="TWILIO_FLEX">Twilio Flex (Event Streams + Call Recording API)</option>
                  <option value="REST_WEBHOOK">Connecteur Générique Webhook HTTP (JSON + Audio URL)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  URL du Webhook / Endpoint d'Ingestion
                </label>
                <input 
                  type="text"
                  value={ctiEndpoint}
                  onChange={e => setCtiEndpoint(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '13px' }}
                />
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Analyse & Transcription Automatique Immédiate</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Déclenche Whisper-v3 + scoring IA dès la fin de l'appel.</div>
                </div>
                <input 
                  type="checkbox"
                  checked={ctiAutoAnalyze}
                  onChange={e => setCtiAutoAnalyze(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                <Save size={14} />
                <span>Enregistrer la Configuration</span>
              </button>
            </form>
          </div>

          {/* Simulateur de flux CTI live */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={18} color="#34d399" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Simulateur de Flux Téléphonique Live</h3>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleSimulateCtiCall}
                disabled={isSimulating}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} className={isSimulating ? 'spin' : ''} />
                <span>{isSimulating ? 'Réception en cours...' : 'Simuler Appel Entrant'}</span>
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Injecte un appel entrant simulé avec ses paquets RTP et déclenche le pipeline complet d'évaluation.
            </p>

            {/* Console de logs */}
            <div style={{
              flex: 1,
              minHeight: '220px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11.5px',
              color: '#a7f3d0',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {simulationLog.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
                  En attente d'événements CTI... Cliquez sur "Simuler Appel Entrant" pour tester le flux.
                </div>
              ) : (
                simulationLog.map((log, idx) => (
                  <div key={idx} style={{ lineHeight: 1.4 }}>{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Création de Campagne */}
      {showCampModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setShowCampModal(false)}>
          <div 
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '520px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)', overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>Créer une Nouvelle Campagne</h3>
              <button onClick={() => setShowCampModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Nom de la Campagne
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Énergie & Gaz — Rétention Particuliers"
                  value={campName}
                  onChange={e => setCampName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Secteur d'Activité
                  </label>
                  <select 
                    value={campSector}
                    onChange={e => setCampSector(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                  >
                    <option value="Télécommunications">Télécommunications</option>
                    <option value="Assurances">Assurances</option>
                    <option value="Banque & Finance">Banque & Finance</option>
                    <option value="Énergie & Services">Énergie & Services</option>
                    <option value="E-commerce & Retail">E-commerce & Retail</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Typologie Flux
                  </label>
                  <select 
                    value={campType}
                    onChange={e => setCampType(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                  >
                    <option value="ENTRANT">Appels Entrants</option>
                    <option value="SORTANT">Campagne Sortante</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Seuil Qualité Cible : <strong style={{ color: 'var(--primary-light)' }}>{targetQuality}%</strong>
                </label>
                <input 
                  type="range"
                  min="60"
                  max="95"
                  value={targetQuality}
                  onChange={e => setTargetQuality(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Description Opérationnelle
                </label>
                <textarea 
                  rows={3}
                  placeholder="Objectifs de la campagne, règles métier spécifiques..."
                  value={campDesc}
                  onChange={e => setCampDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCampModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer la Campagne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
