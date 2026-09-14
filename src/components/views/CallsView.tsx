import React, { useState } from 'react';
import { 
  Search, Filter, Play, Sparkles, CheckCircle2, 
  Printer, Volume2, ShieldAlert, UploadCloud
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ReportService } from '../../services/reportService';
import { AudioUploadModal } from '../common/AudioUploadModal';
import { Call, UserRole } from '../../types';

interface CallsViewProps {
  onSelectCall: (callId: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
}

export const CallsView: React.FC<CallsViewProps> = ({ onSelectCall, onNavigate }) => {
  const calls = storageService.getCalls();
  const campaigns = storageService.getCampaigns();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('ALL');
  const [selectedNoiseFilter, setSelectedNoiseFilter] = useState<string>('ALL');
  const [selectedResolution, setSelectedResolution] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const filteredCalls = calls.filter(c => {
    if (selectedCampaign !== 'ALL' && c.campaignId !== selectedCampaign) return false;
    if (selectedNoiseFilter !== 'ALL' && c.audioMetadata.estimatedNoiseLevel !== selectedNoiseFilter) return false;
    if (selectedResolution !== 'ALL' && c.analytics.resolutionStatus !== selectedResolution) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNumber = c.callNumber.toLowerCase().includes(q);
      const matchAgent = c.agentName.toLowerCase().includes(q);
      const matchClient = c.customerNameMasked.toLowerCase().includes(q);
      const matchSummary = c.analytics.summary.toLowerCase().includes(q);
      if (!matchNumber && !matchAgent && !matchClient && !matchSummary) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Barre de Recherche et Filtres */}
      <div className="glass-panel" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Champ de recherche */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text"
              placeholder="Rechercher par numéro d'appel, conseiller, client, motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
          </div>

          {/* Filtres déroulants */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select 
              value={selectedCampaign} 
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.35)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="ALL">Toutes les campagnes</option>
              {campaigns.map(cp => (
                <option key={cp.id} value={cp.id}>{cp.name}</option>
              ))}
            </select>

            <select 
              value={selectedNoiseFilter} 
              onChange={(e) => setSelectedNoiseFilter(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.35)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="ALL">Tous niveaux de bruit</option>
              <option value="FAIBLE">Bruit Faible (Studio / Calme)</option>
              <option value="MODÉRÉ">Bruit Modéré (Plateau standard)</option>
              <option value="SÉVÈRE">Bruit Sévère (GSM / Extérieur)</option>
            </select>

            <select 
              value={selectedResolution} 
              onChange={(e) => setSelectedResolution(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.35)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="ALL">Toutes résolutions</option>
              <option value="RÉSOLU">RÉSOLU</option>
              <option value="EN_COURS">EN COURS</option>
              <option value="NON_RÉSOLU">NON RÉSOLU</option>
            </select>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => ReportService.exportCallsToCSV(filteredCalls)}
              title="Exporter la liste filtrée en fichier CSV"
            >
              Exporter CSV
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowUploadModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Importer un fichier audio réel (.wav, .mp3)"
            >
              <UploadCloud size={14} />
              <span>Ingérer un Audio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'ingestion Audio */}
      <AudioUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={(newCall) => {
          onSelectCall(newCall.id);
          onNavigate('transcriptions');
        }}
      />

      {/* Tableau des Appels */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Identifiant & Date</th>
              <th>Conseiller & Équipe</th>
              <th>Client (Anonymisé RGPD)</th>
              <th>Qualité Audio & Bruit</th>
              <th>Analyse & Intention</th>
              <th>Score QA</th>
              <th>Actions Dédiées</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((c: Call) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{c.callNumber}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.callDate}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s • {c.direction}
                  </div>
                </td>

                <td>
                  <div style={{ fontWeight: 600 }}>{c.agentName}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{c.campaignName.split('—')[0]}</div>
                </td>

                <td>
                  <div style={{ fontWeight: 500 }}>{c.customerNameMasked}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {c.customerPhoneMasked}
                  </div>
                </td>

                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`badge ${
                      c.audioMetadata.estimatedNoiseLevel === 'FAIBLE' ? 'badge-green' :
                      c.audioMetadata.estimatedNoiseLevel === 'MODÉRÉ' ? 'badge-amber' : 'badge-red'
                    }`}>
                      <Volume2 size={11} style={{ marginRight: '3px' }} />
                      {c.audioMetadata.estimatedNoiseLevel} ({c.audioMetadata.snrDb} dB)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Type : {c.audioMetadata.noiseType}
                    </span>
                  </div>
                </td>

                <td>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '280px', lineHeight: 1.3 }}>
                    {c.analytics.contactIntent}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span className={`badge ${
                      c.analytics.resolutionStatus === 'RÉSOLU' ? 'badge-green' :
                      c.analytics.resolutionStatus === 'EN_COURS' ? 'badge-amber' : 'badge-red'
                    }`} style={{ fontSize: '10px' }}>
                      {c.analytics.resolutionStatus}
                    </span>
                    {c.isUrgentReviewRequired && (
                      <span className="badge badge-red" style={{ fontSize: '10px' }}>
                        <ShieldAlert size={10} style={{ marginRight: '2px' }} /> Revue Urgente
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  {c.qualityScore !== undefined ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <span className={`badge ${c.qualityScore >= 80 ? 'badge-green' : c.qualityScore >= 70 ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '12.5px', fontWeight: 700 }}>
                        {c.qualityScore} / 100
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {c.qualityScore >= 80 ? 'Conforme' : 'Axe d\'amélioration'}
                      </span>
                    </div>
                  ) : (
                    <span className="badge badge-gray">Non évalué</span>
                  )}
                </td>

                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onSelectCall(c.id);
                        onNavigate('transcriptions');
                      }}
                      title="Ouvrir le studio audio et transcription"
                    >
                      <Play size={12} />
                      <span>Studio</span>
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onSelectCall(c.id);
                        onNavigate('analytics');
                      }}
                      title="Consulter l'analyse IA de l'appel"
                    >
                      <Sparkles size={12} />
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onSelectCall(c.id);
                        onNavigate('quality');
                      }}
                      title="Ouvrir la grille de contrôle qualité"
                    >
                      <CheckCircle2 size={12} />
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => ReportService.printCallQualityReport(c)}
                      title="Imprimer le rapport officiel de l'appel"
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
    </div>
  );
};
