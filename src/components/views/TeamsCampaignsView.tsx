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
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#6db89a' }}>{camp.targetQualityScore}%</div>
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
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Déclencherait Whisper-small (non branché en démonstration) dès la fin de l'appel.</div>
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
                <Wifi size={18} color="#6db89a" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Simulateur de Flux Téléphonique Live</h3>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                disabled
                title="La simulation d'appels est désactivée : elle fabriquait des appels et des scores fictifs"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} />
                <span>Indisponible en démonstration</span>
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Simulation désactivée : aucun appel, aucune transcription ni aucun score n'est généré depuis ce panneau.
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
              color: '#b9d6c8',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {simulationLog.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
                  Aucun événement CTI. La simulation d'appels est indisponible en démonstration.
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
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
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
