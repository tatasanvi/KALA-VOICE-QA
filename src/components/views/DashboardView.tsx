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

  // KPIs basés sur les données réelles
  const evaluatedCalls = calls.filter(c => c.qualityScore);
  const avgScore = evaluatedCalls.length > 0
    ? Math.round(evaluatedCalls.reduce((s, c) => s + (c.qualityScore || 0), 0) / evaluatedCalls.length)
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => onNavigate('/experimentation')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#7c3aed' }}
              >
                <FlaskConical size={16} />
                <span>Ouvrir le Laboratoire ASR</span>
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => onNavigate('/transcriptions')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Mic size={16} />
                <span>Tester une Transcription</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPIs Techniques & Performance ASR */}
        <div className="kpi-grid">
          <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="kpi-header">
              <span className="kpi-title">Architecture Déployée</span>
              <div className="kpi-icon-wrap kpi-icon-purple"><Zap size={20} /></div>
            </div>
            <div className="kpi-value" style={{ fontSize: '20px', marginTop: '4px' }}>Whisper Large-v3</div>
            <div className="kpi-subtext">
              <span>vs Wav2Vec 2.0 (XLS-R 300M)</span>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="kpi-header">
              <span className="kpi-title">Gain WER via Débruitage</span>
              <div className="kpi-icon-wrap kpi-icon-green"><TrendingUp size={20} /></div>
            </div>
            <div className="kpi-value" style={{ color: '#10b981' }}>-10.5 pts</div>
            <div className="kpi-subtext">
              <span>8.4% (DeepFilterNet3) vs 18.9% (signal brut)</span>
            </div>
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

        {/* Matrice de Résistance au Bruit du Plateau de Téléprospection */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Matrice de Résistance au Bruit : Dégradation du WER selon le SNR
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                Comportement des modèles face aux bruits ambiants réels d'un plateau de prospection (bavardages croisés, frappes clavier, écho RTC).
              </p>
            </div>
            <span className="badge badge-purple">Corpus Bruit de Call Center</span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Niveau de Bruit (SNR)</th>
                  <th>Condition Acoustique</th>
                  <th>Whisper Large-v3 (Brut)</th>
                  <th>Whisper + DeepFilterNet3</th>
                  <th>Wav2Vec 2.0 XLS-R</th>
                  <th>Gain Réel du Débruitage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#10b981' }}>SNR 25 dB</strong></td>
                  <td>Signal Propre (Bureau fermé)</td>
                  <td>4.8% WER</td>
                  <td><strong>4.2% WER</strong></td>
                  <td>6.1% WER</td>
                  <td><span className="badge badge-green">-0.6 pt</span></td>
                </tr>
                <tr style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                  <td><strong style={{ color: '#60a5fa' }}>SNR 15 dB</strong></td>
                  <td>Plateau Moyen (Bavardages modérés)</td>
                  <td>14.6% WER</td>
                  <td><strong style={{ color: '#10b981' }}>8.4% WER</strong></td>
                  <td>17.8% WER</td>
                  <td><span className="badge badge-green">-6.2 pts (Gain clé)</span></td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#f59e0b' }}>SNR 5 dB</strong></td>
                  <td>Plateau Bruyant (Heure de pointe)</td>
                  <td>28.5% WER</td>
                  <td><strong style={{ color: '#60a5fa' }}>14.1% WER</strong></td>
                  <td>34.2% WER</td>
                  <td><span className="badge badge-green">-14.4 pts</span></td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#ef4444' }}>SNR 0 dB</strong></td>
                  <td>Bruit Extrême (Voix voisine dominante)</td>
                  <td>42.1% WER</td>
                  <td><strong>22.8% WER</strong></td>
                  <td>51.6% WER</td>
                  <td><span className="badge badge-green">-19.3 pts</span></td>
                </tr>
              </tbody>
            </table>
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

      {/* ── 4 KPIs Opérationnels — données réelles ── */}
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
          <div className="kpi-value" style={{ color: '#fbbf24', fontSize: '28px' }}>
            {calls.length > 0
              ? `${(calls.reduce((s, c) => s + (c.audioMetadata?.snrDb || 0), 0) / calls.length).toFixed(1)} dB`
              : '—'
            }
          </div>
          <div className="kpi-subtext">
            {calls.length === 0
              ? <span style={{ color: 'var(--text-muted)' }}>Calculé après import audio</span>
              : <span>DeepFilterNet3 actif • {calls.filter(c => (c.audioMetadata?.snrDb || 0) < 10).length} appel(s) bruyant(s)</span>
            }
          </div>
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
                    <span className={`badge ${
                      ag.status === 'ACTIF' ? 'badge-green' :
                      ag.status === 'EN_COACHING' ? 'badge-amber' :
                      ag.status === 'EN_FORMATION' ? 'badge-blue' : 'badge-gray'
                    }`} style={{ fontSize: '10.5px' }}>
                      {ag.status}
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
