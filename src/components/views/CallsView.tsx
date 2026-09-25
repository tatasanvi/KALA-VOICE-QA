import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Play, Sparkles, CheckCircle2, 
  Printer, Volume2, ShieldAlert, UploadCloud, Eye, ChevronDown
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ReportService } from '../../services/reportService';
import { AudioUploadModal } from '../common/AudioUploadModal';
import { CallDetailModal } from '../common/CallDetailModal';
import { Call, UserRole, CallStatus } from '../../types';

interface CallsViewProps {
  onSelectCall: (callId: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
  initialCallId?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  A_ANALYSER:           { label: 'À Analyser',           color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  TRANSCRIT:            { label: 'Transcrit',             color: '#9fb7d6', bg: 'rgba(96,165,250,0.12)'  },
  EVALUE:               { label: 'Évalué',                color: '#6db89a', bg: 'rgba(52,211,153,0.12)'  },
  A_REVOIR:             { label: 'À Revoir',              color: '#d9ae55', bg: 'rgba(251,191,36,0.12)'  },
  COACHING_RECOMMANDE:  { label: 'Coaching Recommandé',   color: '#d98383', bg: 'rgba(248,113,113,0.12)' },
};

const StatusBadge: React.FC<{ status?: CallStatus }> = ({ status }) => {
  if (!status) return <span className="badge badge-gray" style={{ fontSize: '10.5px' }}>—</span>;
  const s = STATUS_LABELS[status];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
      fontSize: '10.5px', fontWeight: 700, background: s.bg, color: s.color,
      border: `1px solid ${s.color}33`
    }}>
      {s.label}
    </span>
  );
};

export const CallsView: React.FC<CallsViewProps> = ({ onSelectCall, onNavigate, currentRole, initialCallId }) => {
  const [calls, setCalls] = useState<Call[]>(() => storageService.getCalls());
  const campaigns = storageService.getCampaigns();
  const teams = storageService.getTeams();
  
  // Écouter les mises à jour de storageService (import audio, nouvelle évaluation...)
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCalls([...storageService.getCalls()]);
    });
    return () => unsubscribe();
  }, []);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [selectedNoiseFilter, setSelectedNoiseFilter] = useState<string>('ALL');
  const [selectedResolution, setSelectedResolution] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(() => {
    if (initialCallId) {
      return calls.find(c => c.id === initialCallId) || null;
    }
    return null;
  });
  const [sortField, setSortField] = useState<string>('callDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  React.useEffect(() => {
    if (initialCallId) {
      const found = calls.find(c => c.id === initialCallId);
      if (found) setSelectedCall(found);
    }
  }, [initialCallId, calls]);

  const filteredCalls = calls.filter(c => {
    if (selectedCampaign !== 'ALL' && c.campaignId !== selectedCampaign) return false;
    if (selectedTeam !== 'ALL' && c.teamId !== selectedTeam) return false;
    if (selectedNoiseFilter !== 'ALL' && c.audioMetadata.estimatedNoiseLevel !== selectedNoiseFilter) return false;
    if (selectedResolution !== 'ALL' && c.analytics.resolutionStatus !== selectedResolution) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNumber = c.callNumber.toLowerCase().includes(q);
      const matchAgent = c.agentName.toLowerCase().includes(q);
      const matchClient = c.customerNameMasked.toLowerCase().includes(q);
      const matchSummary = c.analytics.summary.toLowerCase().includes(q);
      if (!matchNumber && !matchAgent && !matchClient && !matchSummary) return false;
    }
    return true;
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'qualityScore') return ((a.qualityScore ?? 0) - (b.qualityScore ?? 0)) * dir;
    if (sortField === 'durationSeconds') return (a.durationSeconds - b.durationSeconds) * dir;
    if (sortField === 'callDate') return a.callDate.localeCompare(b.callDate) * dir;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const statusCounts = Object.keys(STATUS_LABELS).reduce((acc, s) => {
    acc[s] = calls.filter(c => c.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* En-tête de la vue Appels avec Action d'import */}
      <div className="glass-panel" style={{ 
        padding: '18px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '14px' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
              Registre des Appels
            </h2>
            <span className="badge badge-purple" style={{ fontSize: '11px', fontWeight: 700 }}>
              {calls.length} appel{calls.length > 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Supervision des enregistrements audio, transcription Whisper et audits de conformité
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontSize: '13px' }}
        >
          <UploadCloud size={16} />
          <span>Importer un enregistrement audio</span>
        </button>
      </div>

      {/* Bandeau de statuts rapides */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedStatus('ALL')}
          style={{
            padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
            background: selectedStatus === 'ALL' ? 'rgba(74, 111, 165,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${selectedStatus === 'ALL' ? 'rgba(74, 111, 165,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: selectedStatus === 'ALL' ? 'var(--primary-light)' : 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Tous ({calls.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key)}
            style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
              background: selectedStatus === key ? `${val.color}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedStatus === key ? `${val.color}55` : 'rgba(255,255,255,0.1)'}`,
              color: selectedStatus === key ? val.color : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {val.label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Champ de recherche */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '11px' }} />
            <input 
              type="text"
              placeholder="Rechercher : numéro, conseiller, client, motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 34px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={14} color="var(--text-muted)" />

            <select 
              value={selectedCampaign} 
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.35)', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
            >
              <option value="ALL">Toutes campagnes</option>
              {campaigns.map(cp => (
                <option key={cp.id} value={cp.id}>{cp.name.split('—')[0]}</option>
              ))}
            </select>

            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.35)', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
            >
              <option value="ALL">Toutes équipes</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name.split('—')[0]}</option>
              ))}
            </select>

            <select 
              value={selectedNoiseFilter} 
              onChange={(e) => setSelectedNoiseFilter(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.35)', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
            >
              <option value="ALL">Tous niveaux bruit</option>
              <option value="FAIBLE">Bruit Faible</option>
              <option value="MODÉRÉ">Bruit Modéré</option>
              <option value="SÉVÈRE">Bruit Sévère</option>
            </select>

            <select 
              value={selectedResolution} 
              onChange={(e) => setSelectedResolution(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.35)', padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
            >
              <option value="ALL">Toutes résolutions</option>
              <option value="RÉSOLU">RÉSOLU</option>
              <option value="EN_COURS">EN COURS</option>
              <option value="NON_RÉSOLU">NON RÉSOLU</option>
            </select>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => ReportService.exportCallsToCSV(filteredCalls)}
            >
              Exporter CSV
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowUploadModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <UploadCloud size={13} />
              <span>Ingérer Audio</span>
            </button>
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>{filteredCalls.length}</strong> appel{filteredCalls.length > 1 ? 's' : ''} affiché{filteredCalls.length > 1 ? 's' : ''} sur {calls.length} total
        </div>
      </div>

      {/* Modal d'ingestion Audio */}
      <AudioUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSaved={() => setShowUploadModal(false)}
      />

      {/* Modal Fiche Appel Détaillée */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
          onNavigate={onNavigate}
          onSelectCall={onSelectCall}
          currentRole={currentRole}
        />
      )}

      {/* Tableau des Appels — ou état vide */}
      {calls.length === 0 ? (
        /* ── ÉTAT VIDE : Aucun appel — invitation à importer ── */
        <div className="glass-panel" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '64px 32px', gap: '20px',
          border: '2px dashed rgba(74, 111, 165, 0.3)',
          background: 'rgba(74, 111, 165, 0.04)'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(74, 111, 165, 0.12)',
            border: '2px solid rgba(74, 111, 165, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UploadCloud size={32} color="var(--primary-light)" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              Aucun appel enregistré
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6, margin: '0 auto 4px' }}>
              Importez vos fichiers audio pour démarrer. KALA transcrit automatiquement l'appel via{' '}
              <strong style={{ color: 'var(--primary-light)' }}>Whisper large-v3-turbo</strong> et
              prépare la fiche pour l'évaluation qualité.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 auto' }}>
              Formats acceptés : WAV, MP3, M4A, OGG, FLAC • 25 Mo maximum
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '10px 24px' }}
          >
            <UploadCloud size={16} />
            <span>Importer un enregistrement audio</span>
          </button>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
            Les données sont stockées localement dans votre navigateur.
          </p>
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Aucun appel ne correspond aux filtres sélectionnés.
          </p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
              <th>
                <button onClick={() => handleSort('callDate')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  Identifiant & Date <ChevronDown size={12} />
                </button>
              </th>
              <th>Conseiller & Équipe</th>
              <th>Client (RGPD)</th>
              <th>Statut</th>
              <th>Qualité Audio</th>
              <th>
                <button onClick={() => handleSort('durationSeconds')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  Durée <ChevronDown size={12} />
                </button>
              </th>
              <th>
                <button onClick={() => handleSort('qualityScore')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  Score QA <ChevronDown size={12} />
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((c: Call) => (
              <tr 
                key={c.id}
                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74, 111, 165,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => setSelectedCall(c)}
              >
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-light)', cursor: 'pointer' }} onClick={() => setSelectedCall(c)}>
                    {c.callNumber}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.callDate}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {c.direction === 'ENTRANT' ? '↙ Entrant' : '↗ Sortant'}
                  </div>
                </td>

                <td>
                  <div style={{ fontWeight: 600 }}>{c.agentName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.campaignName.split('—')[0]}</div>
                </td>

                <td>
                  <div style={{ fontWeight: 500 }}>{c.customerNameMasked}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {c.customerPhoneMasked}
                  </div>
                </td>

                <td>
                  <StatusBadge status={c.status} />
                  {c.isUrgentReviewRequired && (
                    <div style={{ marginTop: '3px' }}>
                      <span style={{ fontSize: '10px', color: '#d98383', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ShieldAlert size={10} /> Urgent
                      </span>
                    </div>
                  )}
                </td>

                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span className={`badge ${
                      c.audioMetadata.estimatedNoiseLevel === 'FAIBLE' ? 'badge-green' :
                      c.audioMetadata.estimatedNoiseLevel === 'MODÉRÉ' ? 'badge-amber' : 'badge-red'
                    }`} style={{ fontSize: '10.5px' }}>
                      <Volume2 size={10} style={{ display: 'inline', marginRight: '2px' }} />
                      {c.audioMetadata.estimatedNoiseLevel} ({c.audioMetadata.snrDb} dB)
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      Qualité : {c.audioMetadata.audioQualityScore}/100
                    </span>
                  </div>
                </td>

                <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12.5px' }}>
                  {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s
                </td>

                <td>
                  {c.qualityScore !== undefined ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <span className={`badge ${c.qualityScore >= 80 ? 'badge-green' : c.qualityScore >= 70 ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '12px', fontWeight: 700 }}>
                        {c.qualityScore} / 100
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {c.analytics.resolutionStatus}
                      </span>
                    </div>
                  ) : (
                    <span className="badge badge-gray" style={{ fontSize: '11px' }}>Non évalué</span>
                  )}
                </td>

                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedCall(c)}
                      title="Ouvrir la fiche appel détaillée"
                      style={{ background: 'rgba(74, 111, 165,0.12)', borderColor: 'rgba(74, 111, 165,0.3)', color: 'var(--primary-light)' }}
                    >
                      <Eye size={12} />
                    </button>
                    
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onSelectCall(c.id);
                        onNavigate('transcriptions');
                      }}
                      title="Ouvrir le studio audio"
                    >
                      <Play size={12} />
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onSelectCall(c.id);
                        onNavigate('analytics');
                      }}
                      title="Analyse IA"
                    >
                      <Sparkles size={12} />
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onSelectCall(c.id);
                        onNavigate('quality');
                      }}
                      title="Contrôle Qualité"
                    >
                      <CheckCircle2 size={12} />
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => ReportService.printCallQualityReport(c)}
                      title="Imprimer rapport"
                    >
                      <Printer size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};
