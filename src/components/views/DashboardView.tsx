import React, { useState } from 'react';
import { 
  PhoneCall, Mic, Award, AlertOctagon, TrendingUp, 
  Users, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Filter, Play
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Call, UserRole } from '../../types';

interface DashboardViewProps {
  onSelectCall: (callId: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectCall, onNavigate }) => {
  const metrics = storageService.getMetrics();
  const calls = storageService.getCalls();
  const campaigns = storageService.getCampaigns();
  const teams = storageService.getTeams();

  const [selectedCampaign, setSelectedCampaign] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('MOIS');

  // Filtrage des appels
  const filteredCalls = calls.filter(call => {
    if (selectedCampaign !== 'ALL' && call.campaignId !== selectedCampaign) return false;
    if (selectedTeam !== 'ALL' && call.teamId !== selectedTeam) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Barre de Filtres Avancés */}
      <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="var(--primary-light)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filtres de pilotage :</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
          >
            <option value="SEMAINE">7 derniers jours</option>
            <option value="MOIS">Mois en cours (Avril 2024)</option>
            <option value="TRIMESTRE">1er Trimestre 2024</option>
          </select>

          <select 
            value={selectedCampaign} 
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
          >
            <option value="ALL">Toutes les campagnes</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
          >
            <option value="ALL">Toutes les équipes</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => { setSelectedCampaign('ALL'); setSelectedTeam('ALL'); setSelectedPeriod('MOIS'); }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Appels Traités & Analysés</span>
            <div className="kpi-icon-wrap kpi-icon-blue">
              <PhoneCall size={20} />
            </div>
          </div>
          <div className="kpi-value">{metrics.analyzedCalls.toLocaleString()}</div>
          <div className="kpi-subtext">
            <span className="trend-up"><ArrowUpRight size={14} style={{ display: 'inline' }} /> +8.4%</span>
            <span>vs mois précédent</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Score Qualité Moyen</span>
            <div className="kpi-icon-wrap kpi-icon-green">
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>{metrics.averageQualityScore} <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/ 100</span></div>
          <div className="kpi-subtext">
            <span className="trend-up"><ArrowUpRight size={14} style={{ display: 'inline' }} /> +3.2 pts</span>
            <span>Objectif cible : 85.0</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Taux de Conformité</span>
            <div className="kpi-icon-wrap kpi-icon-purple">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{metrics.complianceRate}%</div>
          <div className="kpi-subtext">
            <span className="trend-up"><ArrowUpRight size={14} style={{ display: 'inline' }} /> 98% RGPD</span>
            <span>0 manquement critique</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Progression Post-Formation</span>
            <div className="kpi-icon-wrap kpi-icon-amber">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#fbbf24' }}>+{metrics.averageProgressionPercentage}%</div>
          <div className="kpi-subtext">
            <span>Uplift moyen après coaching</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Appels Prioritaires / Litiges</span>
            <div className="kpi-icon-wrap kpi-icon-red">
              <AlertOctagon size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f87171' }}>{metrics.urgentReviewCallsCount}</div>
          <div className="kpi-subtext">
            <span className="trend-down"><ArrowDownRight size={14} style={{ display: 'inline' }} /> 2 en attente</span>
            <span>Revue QA requise</span>
          </div>
        </div>
      </div>

      {/* Graphiques Analytiques & Évolution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Évolution Temporelle Score Qualité */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Évolution du Score Qualité Moyen</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progression globale du centre de contacts (Janvier à Avril)</p>
            </div>
            <span className="badge badge-green">+13 pts de progression</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '170px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            {[
              { month: 'Janvier', score: 71, count: '640 appels' },
              { month: 'Février', score: 76, count: '780 appels' },
              { month: 'Mars', score: 81, count: '810 appels' },
              { month: 'Avril', score: 84, count: '810 appels (en cours)' }
            ].map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '22%' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: idx === 3 ? '#60a5fa' : 'var(--text-primary)' }}>{m.score}%</span>
                <div 
                  style={{ 
                    width: '100%', 
                    height: `${(m.score - 50) * 4}px`, 
                    background: idx === 3 ? 'var(--primary-gradient)' : 'rgba(59, 130, 246, 0.4)', 
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                    transition: 'all 0.3s ease'
                  }} 
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{m.month}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
            Progression soutenue liée aux plans de coaching ciblés et au débruitage ASR de nouvelle génération.
          </div>
        </div>

        {/* Comparaison des Équipes & Campagnes */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Performance par Équipe</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Moyenne qualité & volume par groupe d'agents</p>
            </div>
            <span className="badge badge-blue">3 Équipes Actives</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {teams.map((t) => (
              <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{t.name}</span>
                  <span style={{ fontWeight: 700, color: t.averageQualityScore >= 85 ? '#34d399' : '#60a5fa' }}>
                    {t.averageQualityScore}%
                  </span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${t.averageQualityScore}%`, 
                      background: t.averageQualityScore >= 85 ? 'var(--success)' : 'var(--primary)',
                      borderRadius: 'var(--radius-full)'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Superviseur : {t.supervisorName}</span>
                  <span>{t.memberCount} agents conseillers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau des Derniers Appels Analysés */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Dernières Conversations Traitées</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Appels récents avec transcription synchronisée et analyse IA</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('calls')}>
            Voir tous les appels
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Appel</th>
                <th>Agent</th>
                <th>Campagne</th>
                <th>Durée</th>
                <th>Bruit Ambiant</th>
                <th>Score Qualité</th>
                <th>Résolution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call: Call) => (
                <tr key={call.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{call.callNumber}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{call.callDate}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{call.agentName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{call.customerNameMasked}</div>
                  </td>
                  <td>
                    <span className="badge badge-gray">{call.campaignName.split('—')[0]}</span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                    {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                  </td>
                  <td>
                    <span className={`badge ${
                      call.audioMetadata.estimatedNoiseLevel === 'FAIBLE' ? 'badge-green' :
                      call.audioMetadata.estimatedNoiseLevel === 'MODÉRÉ' ? 'badge-amber' : 'badge-red'
                    }`}>
                      {call.audioMetadata.estimatedNoiseLevel} ({call.audioMetadata.snrDb} dB)
                    </span>
                  </td>
                  <td>
                    {call.qualityScore !== undefined ? (
                      <span className={`badge ${call.qualityScore >= 80 ? 'badge-green' : call.qualityScore >= 70 ? 'badge-amber' : 'badge-red'}`}>
                        {call.qualityScore} / 100
                      </span>
                    ) : (
                      <span className="badge badge-gray">En attente</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      call.analytics.resolutionStatus === 'RÉSOLU' ? 'badge-green' :
                      call.analytics.resolutionStatus === 'EN_COURS' ? 'badge-amber' : 'badge-red'
                    }`}>
                      {call.analytics.resolutionStatus}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onSelectCall(call.id);
                        onNavigate('transcriptions');
                      }}
                      title="Ouvrir dans le studio de transcription"
                    >
                      <Play size={13} />
                      <span>Studio Audio</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
