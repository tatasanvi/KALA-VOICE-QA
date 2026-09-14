import React, { useState, useMemo } from 'react';
import { 
  PhoneCall, Mic, Award, AlertOctagon, TrendingUp, 
  Users, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Filter, Play, GraduationCap, Target, BarChart2, Zap,
  RefreshCw, Clock
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Call, UserRole } from '../../types';

interface DashboardViewProps {
  onSelectCall: (callId: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectCall, onNavigate }) => {
  const calls = storageService.getCalls();
  const campaigns = storageService.getCampaigns();
  const teams = storageService.getTeams();
  const agents = storageService.getAgents();
  const coachingPlans = storageService.getCoachingPlans();
  const trainingSessions = storageService.getTrainingSessions();

  const [selectedCampaign, setSelectedCampaign] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('MOIS');

  // Filtrage des appels
  const filteredCalls = useMemo(() => calls.filter(call => {
    if (selectedCampaign !== 'ALL' && call.campaignId !== selectedCampaign) return false;
    if (selectedTeam !== 'ALL' && call.teamId !== selectedTeam) return false;
    return true;
  }), [calls, selectedCampaign, selectedTeam]);

  // ── KPIs calculés dynamiquement ──────────────────────────────────────────────
  const evaluatedCalls = filteredCalls.filter(c => c.qualityScore !== undefined);
  const avgQuality = evaluatedCalls.length > 0
    ? Math.round(evaluatedCalls.reduce((sum, c) => sum + (c.qualityScore ?? 0), 0) / evaluatedCalls.length)
    : 0;

  const pendingCalls = filteredCalls.filter(c => c.status === 'A_ANALYSER' || !c.status).length;
  const urgentCalls = filteredCalls.filter(c => c.isUrgentReviewRequired).length;
  const resolvedCalls = filteredCalls.filter(c => c.analytics.resolutionStatus === 'RÉSOLU').length;
  const complianceRate = filteredCalls.length > 0
    ? Math.round((resolvedCalls / filteredCalls.length) * 100)
    : 0;

  const agentsNeedCoaching = agents.filter(a => a.status === 'EN_COACHING' || a.averageQualityScore < 75).length;
  const agentsInTraining = agents.filter(a => a.status === 'EN_FORMATION').length;
  const activeCoachingPlans = coachingPlans.filter(cp => cp.status === 'ACTIF').length;

  const completedSessions = trainingSessions.filter(s => s.status === 'TERMINÉE' && s.upliftPercentage);
  const avgUplift = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.upliftPercentage ?? 0), 0) / completedSessions.length)
    : 13;

  const avgSnr = filteredCalls.length > 0
    ? Math.round(filteredCalls.reduce((sum, c) => sum + c.audioMetadata.snrDb, 0) / filteredCalls.length * 10) / 10
    : 0;
  const avgAudioQuality = filteredCalls.length > 0
    ? Math.round(filteredCalls.reduce((sum, c) => sum + c.audioMetadata.audioQualityScore, 0) / filteredCalls.length)
    : 0;

  // ── Top lacunes (depuis axes d'amélioration agents) ─────────────────────────
  const lacunesCount = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach(a => {
      a.improvementAxes.forEach(axe => {
        counts[axe] = (counts[axe] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [agents]);

  const maxLacune = lacunesCount.length > 0 ? lacunesCount[0][1] : 1;

  // ── Répartition des scores ───────────────────────────────────────────────────
  const scoreDistrib = useMemo(() => {
    const ranges = [
      { label: '≥ 90', min: 90, max: 100, color: '#34d399' },
      { label: '80–90', min: 80, max: 90, color: '#60a5fa' },
      { label: '70–80', min: 70, max: 80, color: '#fbbf24' },
      { label: '< 70', min: 0, max: 70, color: '#f87171' },
    ];
    const total = evaluatedCalls.length || 1;
    return ranges.map(r => ({
      ...r,
      count: evaluatedCalls.filter(c => (c.qualityScore ?? 0) >= r.min && (c.qualityScore ?? 0) < r.max).length,
      pct: Math.round(evaluatedCalls.filter(c => (c.qualityScore ?? 0) >= r.min && (c.qualityScore ?? 0) < r.max).length / total * 100),
    }));
  }, [evaluatedCalls]);

  // Métriques par campagne métier
  const campaignStats = useMemo(() => {
    return campaigns.map(camp => {
      const campCalls = filteredCalls.filter(c => c.campaignId === camp.id);
      const evaluated = campCalls.filter(c => c.qualityScore !== undefined);
      const avgScore = evaluated.length > 0 
        ? Math.round(evaluated.reduce((sum, c) => sum + (c.qualityScore ?? 0), 0) / evaluated.length)
        : camp.targetQualityScore;
      const resolved = campCalls.filter(c => c.analytics?.resolutionStatus === 'RÉSOLU').length;
      const resRate = campCalls.length > 0 ? Math.round((resolved / campCalls.length) * 100) : Math.round(camp.complianceRate);
      const avgSnrVal = campCalls.length > 0
        ? (campCalls.reduce((sum, c) => sum + (c.audioMetadata?.snrDb ?? 18), 0) / campCalls.length).toFixed(1)
        : '19.5';
      return {
        ...camp,
        realCallsCount: campCalls.length,
        realAvgScore: avgScore,
        realResolutionRate: resRate,
        realAvgSnr: avgSnrVal,
        isTargetMet: avgScore >= camp.targetQualityScore
      };
    });
  }, [campaigns, filteredCalls]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* ── Filtres ── */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} color="var(--primary-light)" />
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>Filtres de pilotage :</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
          >
            <option value="SEMAINE">7 derniers jours</option>
            <option value="MOIS">Mois en cours (Avril 2024)</option>
            <option value="TRIMESTRE">1er Trimestre 2024</option>
          </select>

          <select 
            value={selectedCampaign} 
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
          >
            <option value="ALL">Toutes les campagnes</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name.split('—')[0]}</option>
            ))}
          </select>

          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
          >
            <option value="ALL">Toutes les équipes</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name.split('—')[0]}</option>
            ))}
          </select>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => { setSelectedCampaign('ALL'); setSelectedTeam('ALL'); setSelectedPeriod('MOIS'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={12} /> Réinitialiser
          </button>
        </div>

        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>{filteredCalls.length}</strong> appels analysés
        </span>
      </div>

      {/* ── KPI Row 1 — Appels & Qualité ── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Appels Traités & Analysés</span>
            <div className="kpi-icon-wrap kpi-icon-blue"><PhoneCall size={20} /></div>
          </div>
          <div className="kpi-value">{filteredCalls.length.toLocaleString()}</div>
          <div className="kpi-subtext">
            <span className="trend-up"><ArrowUpRight size={13} style={{ display: 'inline' }} /> +8.4%</span>
            <span>vs mois précédent</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">En Attente d'Analyse</span>
            <div className="kpi-icon-wrap kpi-icon-amber"><Clock size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: pendingCalls > 10 ? '#fbbf24' : '#34d399' }}>{pendingCalls}</div>
          <div className="kpi-subtext">
            <span style={{ color: 'var(--text-muted)' }}>{Math.round((pendingCalls / Math.max(filteredCalls.length, 1)) * 100)}% du volume total</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Score Qualité Moyen</span>
            <div className="kpi-icon-wrap kpi-icon-green"><Award size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: avgQuality >= 80 ? '#34d399' : '#fbbf24' }}>
            {avgQuality} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div className="kpi-subtext">
            <span className="trend-up"><ArrowUpRight size={13} style={{ display: 'inline' }} /> +3.2 pts</span>
            <span>Objectif cible : 85</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Taux de Résolution</span>
            <div className="kpi-icon-wrap kpi-icon-purple"><CheckCircle2 size={20} /></div>
          </div>
          <div className="kpi-value">{complianceRate}%</div>
          <div className="kpi-subtext">
            <span className="trend-up"><ArrowUpRight size={13} style={{ display: 'inline' }} /> FCR amélioré</span>
            <span>{resolvedCalls} appels résolus</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Appels Urgents / Litiges</span>
            <div className="kpi-icon-wrap kpi-icon-red"><AlertOctagon size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: '#f87171' }}>{urgentCalls}</div>
          <div className="kpi-subtext">
            <span className="trend-down"><ArrowDownRight size={13} style={{ display: 'inline' }} /> Revue QA requise</span>
          </div>
        </div>
      </div>

      {/* ── KPI Row 2 — Agents & Formation ── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Agents Actifs</span>
            <div className="kpi-icon-wrap kpi-icon-blue"><Users size={20} /></div>
          </div>
          <div className="kpi-value">{agents.length}</div>
          <div className="kpi-subtext">
            <span style={{ color: 'var(--text-muted)' }}>{teams.length} équipes • {campaigns.length} campagnes</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Agents en Coaching</span>
            <div className="kpi-icon-wrap kpi-icon-amber"><Target size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: '#fbbf24' }}>{agentsNeedCoaching}</div>
          <div className="kpi-subtext">
            <span style={{ color: 'var(--text-muted)' }}>{activeCoachingPlans} plans actifs</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Agents en Formation</span>
            <div className="kpi-icon-wrap kpi-icon-purple"><GraduationCap size={20} /></div>
          </div>
          <div className="kpi-value">{agentsInTraining + trainingSessions.filter(s => s.status === 'PLANIFIÉE').length}</div>
          <div className="kpi-subtext">
            <span style={{ color: 'var(--text-muted)' }}>{trainingSessions.filter(s => s.status === 'TERMINÉE').length} formations terminées</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Progression Post-Formation</span>
            <div className="kpi-icon-wrap kpi-icon-green"><TrendingUp size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>+{avgUplift}%</div>
          <div className="kpi-subtext">
            <span className="trend-up">Uplift moyen coaching</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Qualité Audio Moy. (SNR)</span>
            <div className="kpi-icon-wrap kpi-icon-blue"><Mic size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: avgSnr >= 20 ? '#34d399' : '#fbbf24' }}>{avgSnr} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>dB</span></div>
          <div className="kpi-subtext">
            <span style={{ color: 'var(--text-muted)' }}>Qualité audio : {avgAudioQuality}/100</span>
          </div>
        </div>
      </div>

      {/* ── Graphiques Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        
        {/* Évolution Temporelle */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Évolution du Score Qualité</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Progression globale Jan → Avr 2024</p>
            </div>
            <span className="badge badge-green">+13 pts</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '150px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            {[
              { month: 'Jan', score: 71, count: 640 },
              { month: 'Fév', score: 76, count: 780 },
              { month: 'Mar', score: 81, count: 810 },
              { month: 'Avr', score: 84, count: 810 }
            ].map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '22%' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: idx === 3 ? '#60a5fa' : 'var(--text-primary)' }}>{m.score}%</span>
                <div style={{ 
                  width: '100%', height: `${(m.score - 50) * 3.5}px`, 
                  background: idx === 3 ? 'var(--primary-gradient)' : 'rgba(59,130,246,0.35)', 
                  borderRadius: '6px 6px 0 0', transition: 'all 0.3s'
                }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.month}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.count} appels</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
            Progression soutenue liée au débruitage ASR + plans de coaching ciblés.
          </p>
        </div>

        {/* Performance par Équipe */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Performance par Équipe</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Score qualité moyen par groupe d'agents</p>
            </div>
            <span className="badge badge-blue">{teams.length} équipes</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {teams.map((t) => {
              const teamCalls = filteredCalls.filter(c => c.teamId === t.id && c.qualityScore !== undefined);
              const teamAvg = teamCalls.length > 0 
                ? Math.round(teamCalls.reduce((sum, c) => sum + (c.qualityScore ?? 0), 0) / teamCalls.length)
                : t.averageQualityScore;
              return (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ fontWeight: 600 }}>{t.name.split('—')[0]}</span>
                    <span style={{ fontWeight: 800, color: teamAvg >= 85 ? '#34d399' : teamAvg >= 75 ? '#60a5fa' : '#fbbf24' }}>
                      {teamAvg}%
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', width: `${teamAvg}%`,
                      background: teamAvg >= 85 ? 'var(--success)' : teamAvg >= 75 ? 'var(--primary)' : '#fbbf24',
                      borderRadius: '4px', transition: 'width 0.8s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{t.supervisorName}</span>
                    <span>{t.memberCount} agents • {teamCalls.length} appels</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Graphiques Row 2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>

        {/* Top Lacunes */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Top Lacunes Détectées</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Axes d'amélioration les plus fréquents</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('coaching')}>
              Voir Coaching
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lacunesCount.map(([lacune, count], i) => (
              <div key={lacune} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px', fontWeight: 700,
                      background: i === 0 ? '#f87171' : i === 1 ? '#fbbf24' : i === 2 ? '#60a5fa' : 'rgba(255,255,255,0.1)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lacune}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>{count} agents</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', width: `${(count / maxLacune) * 100}%`,
                    background: i === 0 ? '#f87171' : i === 1 ? '#fbbf24' : i === 2 ? '#60a5fa' : 'rgba(148,163,184,0.5)',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des Scores */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Répartition des Scores QA</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Distribution sur {evaluatedCalls.length} appels évalués</p>
            </div>
            <span className="badge badge-purple">
              <BarChart2 size={11} style={{ marginRight: '3px' }} />
              Analyse
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scoreDistrib.map(range => (
              <div key={range.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: range.color }} />
                    <span style={{ fontWeight: 600 }}>Score {range.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{range.count} appels</span>
                    <span style={{ fontWeight: 700, color: range.color }}>{range.pct}%</span>
                  </div>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${range.pct}%`,
                    background: range.color, borderRadius: '4px', transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Boucle performance Koffi Mensah */}
          <div style={{
            marginTop: '16px', padding: '12px 14px',
            background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
              🌟 Focus Coaching — Koffi Mensah
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <span style={{ fontWeight: 700, color: '#f87171' }}>68%</span>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0', top: '0', height: '100%', width: '68%', background: '#f87171', borderRadius: '2px' }} />
                <div style={{ position: 'absolute', left: '68%', top: '0', height: '100%', width: '13%', background: '#34d399', borderRadius: '2px' }} />
              </div>
              <span style={{ fontWeight: 700, color: '#34d399' }}>81%</span>
              <span className="badge badge-green" style={{ fontSize: '11px' }}>+13 pts ↑</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Avant formation (Jan) → Après coaching ciblé (Avr) — Uplift mesuré
            </div>
          </div>
        </div>
      </div>

      {/* ── Comparatif des Campagnes Métiers ── */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Comparatif d'Efficacité des Campagnes Métiers</h3>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Objectifs qualité, résolution au premier contact (FCR) et qualité acoustique par typologie de flux</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('campaigns')}>
            Structure des Campagnes
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {campaignStats.map(c => (
            <div 
              key={c.id} 
              style={{
                background: 'rgba(255, 255, 255, 0.025)',
                border: `1px solid ${c.isTargetMet ? 'rgba(52, 211, 153, 0.25)' : 'rgba(251, 191, 36, 0.25)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`badge ${c.type === 'ENTRANT' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '10.5px' }}>
                    {c.type} • {c.clientSector}
                  </span>
                  <span className={`badge ${c.isTargetMet ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '10.5px' }}>
                    {c.isTargetMet ? '✓ Objectif atteint' : '⚠ En rattrapage'}
                  </span>
                </div>

                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {c.name}
                </h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
                  {c.description}
                </p>

                {/* Score vs Objectif */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score Qualité Réel</span>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: c.realAvgScore >= c.targetQualityScore ? '#34d399' : '#fbbf24' }}>
                      {c.realAvgScore}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cible contractuelle</span>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {c.targetQualityScore}%
                    </div>
                  </div>
                </div>

                {/* Barre de progression Score */}
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(c.realAvgScore, 100)}%`,
                    background: c.isTargetMet ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    borderRadius: '3px'
                  }} />
                </div>

                {/* 3 mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px 8px', borderRadius: '8px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Appels</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{c.realCallsCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>FCR Résol.</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>{c.realResolutionRate}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bruit SNR</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>{c.realAvgSnr} dB</div>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px', marginTop: '4px' }}
                onClick={() => {
                  setSelectedCampaign(c.id);
                }}
              >
                Filtrer sur cette campagne
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tableau des Derniers Appels ── */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Dernières Conversations Traitées</h3>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Appels récents avec transcription & analyse IA</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('calls')}>
            Voir tous les appels ({filteredCalls.length})
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Appel</th>
                <th>Conseiller</th>
                <th>Campagne</th>
                <th>Durée</th>
                <th>Bruit Ambiant</th>
                <th>Score Qualité</th>
                <th>Résolution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.slice(0, 8).map((call: Call) => (
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
                    <span className="badge badge-gray" style={{ fontSize: '10.5px' }}>{call.campaignName.split('—')[0]}</span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                    {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                  </td>
                  <td>
                    <span className={`badge ${call.audioMetadata.estimatedNoiseLevel === 'FAIBLE' ? 'badge-green' : call.audioMetadata.estimatedNoiseLevel === 'MODÉRÉ' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '10.5px' }}>
                      {call.audioMetadata.estimatedNoiseLevel} ({call.audioMetadata.snrDb} dB)
                    </span>
                  </td>
                  <td>
                    {call.qualityScore !== undefined ? (
                      <span className={`badge ${call.qualityScore >= 80 ? 'badge-green' : call.qualityScore >= 70 ? 'badge-amber' : 'badge-red'}`} style={{ fontWeight: 700, fontSize: '12px' }}>
                        {call.qualityScore} / 100
                      </span>
                    ) : (
                      <span className="badge badge-gray" style={{ fontSize: '10.5px' }}>En attente</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${call.analytics.resolutionStatus === 'RÉSOLU' ? 'badge-green' : call.analytics.resolutionStatus === 'EN_COURS' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '10.5px' }}>
                      {call.analytics.resolutionStatus}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => { onSelectCall(call.id); onNavigate('transcriptions'); }}
                    >
                      <Play size={12} />
                      <span>Studio</span>
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
