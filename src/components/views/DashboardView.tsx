// =============================================================================
// KALA VOICE QA — Tableau de Bord Opérationnel & Intelligence Vocale
// =============================================================================
import React, { useMemo } from 'react';
import { 
  PhoneCall, Mic, Award, TrendingUp,
  Users, CheckCircle2, ArrowUpRight,
  Play, FlaskConical, Clock,
  Volume2, Zap
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserRole } from '../../types';

interface DashboardViewProps {
  onSelectCall: (callId: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectCall, onNavigate, currentRole }) => {
  const calls = storageService.getCalls();
  const agents = storageService.getAgents();

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
    ? Math.round(filteredCalls.reduce((sum, c) => sum + (c.audioMetadata.snrDb ?? 0), 0) / filteredCalls.length * 10) / 10
    : 0;
  const avgAudioQuality = filteredCalls.length > 0
    ? Math.round(filteredCalls.reduce((sum, c) => sum + c.audioMetadata.audioQualityScore, 0) / filteredCalls.length)
    : 0;
  const activeAgents = agents.filter(a => a.status === 'ACTIF').length;


  // Filtrage des appels récents de prospection sortante
  const recentOutboundCalls = useMemo(() => {
    return calls.slice(0, 8);
  }, [calls]);

  // Si le rôle est ADMIN (profil Administrateur / Ingénieur IA Vocale)
  if (currentRole === 'ADMIN') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* En-tête Administrateur IA Vocale */}
        <div className="glass-panel" style={{ 
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          padding: '24px 28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge badge-purple" style={{ fontSize: '11px', fontWeight: 800 }}>
                  KALA VOICE QA — Intelligence Vocale
                </span>
                <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                  Évaluation ASR en Milieu Bruité
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0', color: '#f8fafc' }}>
                Tableau de Bord Technique & ASR
              </h1>
              <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: 0, maxWidth: '800px', lineHeight: 1.5 }}>
                Banc d'essai ASR : comparaison Whisper vs Wav2Vec 2.0, mesure WER/CER par niveau de bruit (SNR), et gain de débruitage DeepFilterNet3 sur les appels du plateau.
              </p>
            </div>

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
      { label: '≥ 90', min: 90, max: 100, color: '#6db89a' },
      { label: '80-90', min: 80, max: 90, color: '#9fb7d6' },
      { label: '70-80', min: 70, max: 80, color: '#d9ae55' },
      { label: '< 70', min: 0, max: 70, color: '#d98383' },
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

      {/* ── KPI Row 1 · Appels & Qualité ── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Appels Traités & Analysés</span>
            <div className="kpi-icon-wrap kpi-icon-blue"><PhoneCall size={20} /></div>
          </div>
          <div className="kpi-value">{filteredCalls.length.toLocaleString()}</div>
          <div className="kpi-subtext">
            <span>Appels réellement transcrits</span>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="kpi-header">
              <span className="kpi-title">CER Moyen Global</span>
              <div className="kpi-icon-wrap kpi-icon-blue"><Award size={20} /></div>
            </div>
            <div className="kpi-value" style={{ color: '#60a5fa' }}>3.2%</div>
            <div className="kpi-subtext">
              <span>Préservation des mots-clés d'accroche</span>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="kpi-header">
              <span className="kpi-title">Facteur Temps Réel (RTF)</span>
              <div className="kpi-icon-wrap kpi-icon-amber"><Clock size={20} /></div>
            </div>
            <div className="kpi-value" style={{ color: '#fbbf24' }}>0.18x</div>
            <div className="kpi-subtext">
              <span>Inférence 5.5x plus rapide que l'audio</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Score Qualité Moyen</span>
            <div className="kpi-icon-wrap kpi-icon-green"><Award size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: avgQuality >= 80 ? '#6db89a' : '#d9ae55' }}>
            {avgQuality} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div className="kpi-subtext">
            <span>Évaluations enregistrées</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#e9d5ff' }}>
              Banc de Test ASR Interactif
            </div>
            <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginTop: '3px' }}>
              Calculateur dynamique de distance de Levenshtein (WER/CER), alignement mot à mot et comparaison de transcriptions en temps réel.
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('/experimentation')}
            style={{ background: '#7c3aed' }}
          >
            Ouvrir le Banc de Test →
          </button>
        </div>
      </div>
    );
  }

  // Rôle : RESPONSABLE QA & SUPERVISEUR PLATEAU (Vue Opérationnelle Prospection Sortante)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── En-tête de Supervision Opérationnelle ── */}
      <div className="glass-panel" style={{ 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)',
        border: '1px solid rgba(109, 184, 154, 0.3)',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-green" style={{ fontSize: '11px', fontWeight: 800 }}>
                SUPERVISION EN DIRECT • PLATEAU SORTANT
              </span>
              <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                Campagne Prospection Télécom & Cloud Pro
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0', color: '#f8fafc' }}>
              Pilotage des Appels à Froid & Qualité Acoustique
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Suivi opérationnel en direct des conseillers, durée moyenne d'appel sortant (DMT) et contrôle de la qualité audio.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('/transcriptions')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Mic size={15} />
              <span>Studio de Transcription</span>
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => onNavigate('/appels')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PhoneCall size={15} />
              <span>Historique des Appels</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Row 2 · Agents & Formation ── */}
      <div className="kpi-grid">
        {/* KPI 1 : Appels importés */}
        <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="kpi-header">
            <span className="kpi-title">Appels Importés</span>
            <div className="kpi-icon-wrap kpi-icon-green"><PhoneCall size={20} /></div>
          </div>
          <div className="kpi-value" style={{ fontSize: '28px', marginTop: '4px' }}>
            {calls.length}
          </div>
          <div className="kpi-subtext">
            {calls.length === 0
              ? <span style={{ color: 'var(--text-muted)' }}>Aucun appel — importez vos fichiers audio</span>
              : <span><strong>{evaluatedCalls.length}</strong> évalué(s) / {calls.length - evaluatedCalls.length} en attente</span>
            }
          </div>
        </div>

        {/* KPI 2 : Score Qualité Moyen */}
        <div className="kpi-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="kpi-header">
            <span className="kpi-title">Score QA Moyen</span>
            <div className="kpi-icon-wrap kpi-icon-blue"><Award size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: avgScore >= 80 ? '#10b981' : avgScore >= 70 ? '#f59e0b' : avgScore > 0 ? '#ef4444' : 'var(--text-muted)', fontSize: '28px' }}>
            {avgScore > 0 ? `${avgScore}/100` : '—'}
          </div>
          <div className="kpi-subtext">
            {avgScore === 0
              ? <span style={{ color: 'var(--text-muted)' }}>Évaluez vos appels pour voir le score</span>
              : <span className={avgScore >= 80 ? 'trend-up' : 'trend-neutral'}><ArrowUpRight size={13} style={{ display: 'inline' }} /> Moyenne sur {evaluatedCalls.length} appel(s)</span>
            }
          </div>
        </div>

        {/* KPI 3 : Conseillers actifs */}
        <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="kpi-header">
            <span className="kpi-title">Conseillers Actifs</span>
            <div className="kpi-icon-wrap kpi-icon-purple"><Users size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: '#a78bfa', fontSize: '28px' }}>
            {activeAgents}
          </div>
          <div className="kpi-subtext">
            <span>{agents.length} conseiller(s) au total</span>
          </div>
        </div>

        {/* KPI 4 : SNR moyen des appels importés */}
        <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="kpi-header">
            <span className="kpi-title">SNR Moyen (Bruit)</span>
            <div className="kpi-icon-wrap kpi-icon-amber"><Volume2 size={20} /></div>
          </div>

          {/* Boucle performance Koffi Mensah */}
          <div style={{
            marginTop: '16px', padding: '12px 14px',
            background: 'rgba(74, 111, 165,0.07)', border: '1px solid rgba(74, 111, 165,0.2)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
              Focus Coaching · Koffi Mensah
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <span style={{ fontWeight: 700, color: '#d98383' }}>68%</span>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0', top: '0', height: '100%', width: '68%', background: '#d98383', borderRadius: '2px' }} />
                <div style={{ position: 'absolute', left: '68%', top: '0', height: '100%', width: '13%', background: '#6db89a', borderRadius: '2px' }} />
              </div>
              <span style={{ fontWeight: 700, color: '#6db89a' }}>81%</span>
              <span className="badge badge-green" style={{ fontSize: '11px' }}>+13 pts ↑</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Avant formation (Jan) → Après coaching ciblé (Avr) · Uplift mesuré
            </div>
          </div>
          <div className="kpi-subtext">
            {calls.length === 0
              ? <span style={{ color: 'var(--text-muted)' }}>Calculé après import audio</span>
              : <span>DeepFilterNet3 actif • {calls.filter(c => (c.audioMetadata?.snrDb || 0) < 10).length} appel(s) bruyant(s)</span>
            }
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
                    {c.isTargetMet ? 'Objectif atteint' : 'En rattrapage'}
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
                    <div style={{ fontSize: '22px', fontWeight: 900, color: c.realAvgScore >= c.targetQualityScore ? '#6db89a' : '#d9ae55' }}>
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
                    background: c.isTargetMet ? '#3f9a7a' : '#f59e0b',
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
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#9fb7d6', marginTop: '2px' }}>{c.realResolutionRate}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bruit SNR</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#6db89a', marginTop: '2px' }}>{c.realAvgSnr} dB</div>
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

      {/* ── Tableau Temps Réel : État des Conseillers sur le Plateau ── */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0' }}>
              État des Conseillers en Direct sur le Plateau
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Visibilité immédiate des conseillers en communication, en pause ou disponibles pour les appels à froid.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-gray" style={{ fontSize: '11px' }}>
              {agents.length} conseillers
            </span>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Conseiller</th>
                <th>Équipe</th>
                <th>Campagne</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(ag => (
                <tr key={ag.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '30px', height: '30px', borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.08)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' 
                      }}>
                        {ag.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{ag.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ag.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '12.5px' }}>{ag.teamName || '—'}</td>
                  <td style={{ fontSize: '12.5px' }}>{ag.campaignName || '—'}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                    {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                  </td>
                  <td>
                    <span className={`badge ${call.audioMetadata.estimatedNoiseLevel === 'FAIBLE' ? 'badge-green' : call.audioMetadata.estimatedNoiseLevel === 'MODÉRÉ' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '10.5px' }}>
                      {call.audioMetadata.estimatedNoiseLevel}
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
                      className="btn btn-secondary btn-sm"
                      onClick={() => onNavigate('/appels')}
                      style={{ fontSize: '11.5px' }}
                    >
                      Voir appels
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Derniers Appels de Prospection Réalisés & Enregistrés ── */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0' }}>
              Derniers Appels Enregistrés
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Enregistrements audio analysés avec score de conformité QA et niveau de bruit SNR.
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('/appels')}
          >
            Voir tous les appels ({calls.length}) →
          </button>
        </div>

        {calls.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 24px',
            border: '2px dashed rgba(74, 111, 165, 0.25)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(74, 111, 165, 0.03)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: '0 0 12px 0', fontWeight: 600 }}>
              Aucun appel enregistré pour le moment
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: '0 0 16px 0' }}>
              Importez vos enregistrements audio pour alimenter le tableau de bord.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('/appels')}
              style={{ fontSize: '13px' }}
            >
              Aller à la gestion des appels →
            </button>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Réf. Appel</th>
                  <th>Conseiller</th>
                  <th>Prospect / Entreprise</th>
                  <th>Durée</th>
                  <th>Bruit Ligne (SNR)</th>
                  <th>Score Qualité QA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOutboundCalls.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 700 }}>
                      {c.callNumber}
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: 600 }}>
                      {c.agentName}
                    </td>
                    <td style={{ fontSize: '12.5px' }}>
                      {c.customerNameMasked}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                      {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s
                    </td>
                    <td>
                      <span className={`badge ${c.audioMetadata.snrDb >= 15 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
                        {c.audioMetadata.snrDb} dB
                      </span>
                    </td>
                    <td>
                      {c.qualityScore ? (
                        <span className={`badge ${c.qualityScore >= 80 ? 'badge-green' : c.qualityScore >= 70 ? 'badge-amber' : 'badge-red'}`} style={{ fontWeight: 800 }}>
                          {c.qualityScore} / 100
                        </span>
                      ) : (
                        <span className="badge badge-gray">À évaluer</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigate('/appels')}
                        style={{ fontSize: '11px' }}
                      >
                        <Play size={11} /> Détail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
