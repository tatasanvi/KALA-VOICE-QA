import React, { useState } from 'react';
import { 
  FileText, Download, Printer, Award, Users, 
  Flag, GraduationCap, TrendingUp, CheckCircle2 
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ReportService } from '../../services/reportService';
import { UserRole } from '../../types';

interface ReportsViewProps {
  currentRole: UserRole;
}

export const ReportsView: React.FC<ReportsViewProps> = () => {
  const calls = storageService.getCalls();
  const agents = storageService.getAgents();
  const teams = storageService.getTeams();
  const campaigns = storageService.getCampaigns();
  const sessions = storageService.getTrainingSessions();

  const [selectedReportType, setSelectedReportType] = useState<string>('CALL');
  const [selectedCallId, setSelectedCallId] = useState<string>(calls[0].id);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0].id);

  const currentCall = calls.find(c => c.id === selectedCallId) || calls[0];
  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handlePrintCurrentReport = () => {
    if (selectedReportType === 'CALL') {
      ReportService.printCallQualityReport(currentCall);
    } else {
      window.print();
    }
  };

  const handleExportCSV = () => {
    ReportService.exportCallsToCSV(calls);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sélecteur de Type de Rapport */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="var(--primary-light)" />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Centre d'Édition & Rapports Métiers</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Génération de bilans opérationnels certifiés, conformes aux exigences qualité et d'audit.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} />
            <span>Export Global CSV</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrintCurrentReport}>
            <Printer size={14} />
            <span>Imprimer / Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Boutons Choix du Rapport */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { id: 'CALL', label: "Rapport d'Appel", icon: FileText },
          { id: 'QUALITY', label: "Rapport Qualité", icon: Award },
          { id: 'AGENT', label: "Rapport Agent", icon: Users },
          { id: 'TEAM', label: "Rapport Équipe", icon: Flag },
          { id: 'TRAINING', label: "Rapport Formation", icon: GraduationCap },
          { id: 'PROGRESS', label: "Rapport Progression", icon: TrendingUp }
        ].map(r => {
          const Icon = r.icon;
          const isActive = selectedReportType === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedReportType(r.id)}
              className={`glass-panel ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-subtle)',
                color: isActive ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <Icon size={20} color={isActive ? 'var(--primary-light)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '12.5px', fontWeight: 700 }}>{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Aperçu du Rapport Sélectionné */}
      <div className="glass-panel" style={{ background: '#0d1322', border: '1px solid rgba(255,255,255,0.1)' }}>
        {selectedReportType === 'CALL' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <span className="badge badge-blue">Rapport Individuel d'Interaction</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                  Bilan d'Appel N° {currentCall.callNumber}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Choisir l'appel :</span>
                <select 
                  value={currentCall.id}
                  onChange={(e) => setSelectedCallId(e.target.value)}
                  className="role-select"
                  style={{ background: 'rgba(0,0,0,0.4)', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                >
                  {calls.map(c => (
                    <option key={c.id} value={c.id}>{c.callNumber} ({c.agentName})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Conseiller</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{currentCall.agentName}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Client</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{currentCall.customerNameMasked}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score Qualité Attribué</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>{currentCall.qualityScore} / 100</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Environnement Acoustique</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Bruit {currentCall.audioMetadata.estimatedNoiseLevel} ({currentCall.audioMetadata.snrDb} dB)</div>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13.5px', lineHeight: 1.6 }}>
              <strong>Synthèse Exécutive de l'Appel :</strong><br/>
              {currentCall.analytics.summary}
            </div>
          </div>
        )}

        {selectedReportType === 'QUALITY' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
              Bilan Global du Contrôle Qualité (Période Avril 2024)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moyenne Générale Qualité</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#34d399' }}>82.8 / 100</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Sur un échantillon de 2 840 appels analysés</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Conformité Légale & RGPD</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary-light)' }}>94.6 %</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>0 anomalie critique non traitée</div>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'AGENT' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Rapport Annuel de Performance Conseiller</h3>
              <select 
                value={currentAgent.id}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="role-select"
                style={{ background: 'rgba(0,0,0,0.4)', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              L'agent <strong>{currentAgent.name}</strong> ({currentAgent.teamName}) affiche un score moyen de <strong>{currentAgent.averageQualityScore}%</strong>. Sa progression a atteint <strong>+13 points</strong> entre Janvier et Avril 2024 grâce à la validation du module de reformulation empathique.
            </p>
          </div>
        )}

        {selectedReportType === 'TRAINING' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
              Rapport d'Efficacité des Formations
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Le taux de progression moyen après passage dans l'un des 4 modules de l'Académie Métier est mesuré à <strong>+11.2%</strong> en qualité d'interaction et à <strong>-38%</strong> sur le nombre d'interruptions client.
            </p>
          </div>
        )}

        {selectedReportType === 'TEAM' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
              Comparatif des Performances Inter-Équipes
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              L'Équipe Titan (Sinistres) conserve la tête avec un score de <strong>88.7%</strong>, suivie de l'Équipe Phénix (<strong>86.1%</strong>) et de l'Équipe Alpha (<strong>82.4%</strong>).
            </p>
          </div>
        )}

        {selectedReportType === 'PROGRESS' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
              Rapport de Progression Chronologique du Centre
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              L'introduction conjointe du débruitage ASR adaptatif (+11.2 dB SNR) et des plans de coaching personnalisés a permis d'élever le score qualité de 71% en Janvier à 84% en Avril.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
