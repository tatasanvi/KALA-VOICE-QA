// =============================================================================
// KALA VOICE QA — Tableau de Bord Opérationnel & Démonstrateur Scientifique
// Soutenance Master 2 IA & Big Data : Optimisation ASR en Milieu Bruité
// Adapté aux Appels à Froid (Prospection Sortante) & Supervision Temps Réel
// =============================================================================
import React, { useState, useMemo } from 'react';
import { 
  PhoneCall, Mic, Award, TrendingUp, 
  Users, CheckCircle2, ArrowUpRight,
  Play, FlaskConical, Clock, Coffee,
  Headphones, Volume2, ShieldCheck, Zap
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

  // État temps réel simulé du plateau de prospection sortante
  const [agentsFloor] = useState([
    { id: 'ag-1', name: 'Jean Dupont', status: 'EN_COMMUNICATION', callNumber: 'OUT-2024-4892', duration: '02:18', snrDb: 16.4, prospect: 'SARL Alpha BTP (Gérant)', hookResult: 'Objection levée' },
    { id: 'ag-2', name: 'Amina Benali', status: 'EN_COMMUNICATION', callNumber: 'OUT-2024-4895', duration: '03:45', snrDb: 12.8, prospect: 'Cabinet Conseil Martin (DRH)', hookResult: 'RDV Démo pris' },
    { id: 'ag-3', name: 'Koffi Mensah', status: 'EN_PAUSE', callNumber: '—', duration: '07:20', snrDb: null, prospect: '—', hookResult: 'Pause déjeuner' },
    { id: 'ag-4', name: 'Thomas Leroux', status: 'DISPONIBLE', callNumber: '—', duration: '00:45', snrDb: null, prospect: '—', hookResult: 'Prêt pour numérotation' },
    { id: 'ag-5', name: 'Sarah Martin', status: 'EN_COMMUNICATION', callNumber: 'OUT-2024-4901', duration: '01:12', snrDb: 18.2, prospect: 'Ateliers Mécaniques Dubois', hookResult: 'Accroche en cours' },
    { id: 'ag-6', name: 'Lucas Mercier', status: 'POST_APPEL', callNumber: 'OUT-2024-4889', duration: '00:35', snrDb: null, prospect: 'Logistique Express 75', hookResult: 'Compte-rendu CRM' },
    { id: 'ag-7', name: 'Fatou Diop', status: 'EN_COMMUNICATION', callNumber: 'OUT-2024-4903', duration: '02:50', snrDb: 14.1, prospect: 'Clinique Vétérinaire Val d\'Oise', hookResult: 'Qualification' },
    { id: 'ag-8', name: 'Émilie Roux', status: 'EN_PAUSE', callNumber: '—', duration: '04:15', snrDb: null, prospect: '—', hookResult: 'Pause café' },
  ]);

  // Statistiques opérationnelles calculées
  const inCallCount = agentsFloor.filter(a => a.status === 'EN_COMMUNICATION').length;
  const onBreakCount = agentsFloor.filter(a => a.status === 'EN_PAUSE').length;
  const availableCount = agentsFloor.filter(a => a.status === 'DISPONIBLE').length;
  const postCallCount = agentsFloor.filter(a => a.status === 'POST_APPEL').length;

  // Filtrage des appels récents de prospection sortante
  const recentOutboundCalls = useMemo(() => {
    return calls.slice(0, 8);
  }, [calls]);

  // Si le rôle est ADMIN (profil Chercheur IA / Évaluateur Scientifique Master 2)
  if (currentRole === 'ADMIN') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* En-tête Scientifique Master 2 */}
        <div className="glass-panel" style={{ 
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          padding: '24px 28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge badge-purple" style={{ fontSize: '11px', fontWeight: 800 }}>
                  SOUTENANCE MASTER 2 IA & BIG DATA
                </span>
                <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                  Évaluation ASR en Milieu Bruité
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 6px 0', color: '#f8fafc' }}>
                Synthèse Scientifique & Expérimentale ASR
              </h1>
              <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: 0, maxWidth: '800px', lineHeight: 1.5 }}>
                Comparaison quantitative des architectures ASR (Whisper vs Wav2Vec 2.0) et impact du pré-traitement acoustique (DeepFilterNet3) sur les appels à froid en environnement de centre de contact.
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

        {/* 4 KPIs Scientifiques Clés du Mémoire */}
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

        {/* Accès rapide au laboratoire expérimental */}
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
              Démonstration Interactive devant le Jury
            </div>
            <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginTop: '3px' }}>
              Testez en direct le calculateur dynamique de distance de Levenshtein (Substitutions, Omissions, Insertions) et l'alignement coloré mot à mot.
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('/experimentation')}
            style={{ background: '#7c3aed' }}
          >
            Lancer le Banc de Test Dynamique →
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

      {/* ── 4 KPIs Opérationnels Essentiels pour le Superviseur ── */}
      <div className="kpi-grid">
        {/* KPI 1 : Qui est en ligne / pause */}
        <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="kpi-header">
            <span className="kpi-title">Plateau en Direct</span>
            <div className="kpi-icon-wrap kpi-icon-green"><Headphones size={20} /></div>
          </div>
          <div className="kpi-value" style={{ fontSize: '24px', marginTop: '4px' }}>
            {inCallCount} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>en ligne</span>
          </div>
          <div className="kpi-subtext" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>🟢 {inCallCount} en comm.</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>🟡 {onBreakCount} en pause</span>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>🔵 {availableCount} dispo</span>
          </div>
        </div>

        {/* KPI 2 : Durée Moyenne de Traitement (DMT Sortant) */}
        <div className="kpi-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="kpi-header">
            <span className="kpi-title">DMT Appel Sortant</span>
            <div className="kpi-icon-wrap kpi-icon-blue"><Clock size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: '#60a5fa', fontSize: '24px' }}>2m 42s</div>
          <div className="kpi-subtext">
            <span className="trend-up"><ArrowUpRight size={13} style={{ display: 'inline' }} /> Cible respectée</span>
            <span>(Optimale prospection &lt; 3m)</span>
          </div>
        </div>

        {/* KPI 3 : Taux d'Accroche & Qualification (Sortant) */}
        <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="kpi-header">
            <span className="kpi-title">Taux d'Accroche Réussie</span>
            <div className="kpi-icon-wrap kpi-icon-purple"><CheckCircle2 size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: '#a78bfa', fontSize: '24px' }}>24.6%</div>
          <div className="kpi-subtext">
            <span>14 RDV qualifiés obtenus aujourd'hui</span>
          </div>
        </div>

        {/* KPI 4 : Niveau de Bruit Ambiant Plateau (SNR) */}
        <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="kpi-header">
            <span className="kpi-title">Bruit Plateau (SNR Moyen)</span>
            <div className="kpi-icon-wrap kpi-icon-amber"><Volume2 size={20} /></div>
          </div>
          <div className="kpi-value" style={{ color: '#fbbf24', fontSize: '24px' }}>
            14.8 <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>dB</span>
          </div>
          <div className="kpi-subtext">
            <span>Bruit modéré • Débruitage DeepFilterNet3 actif</span>
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
              {agentsFloor.length} conseillers supervisés
            </span>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Conseiller</th>
                <th>Statut Plateau</th>
                <th>Appel en cours</th>
                <th>Durée</th>
                <th>Cible Prospect (B2B)</th>
                <th>Qualité Audio (SNR)</th>
                <th>Étape / Résultat</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {agentsFloor.map(ag => (
                <tr key={ag.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '30px', height: '30px', borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.08)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' 
                      }}>
                        {ag.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{ag.name}</span>
                    </div>
                  </td>
                  <td>
                    {ag.status === 'EN_COMMUNICATION' && (
                      <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                        En communication
                      </span>
                    )}
                    {ag.status === 'EN_PAUSE' && (
                      <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Coffee size={12} />
                        En pause
                      </span>
                    )}
                    {ag.status === 'DISPONIBLE' && (
                      <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                        Disponible
                      </span>
                    )}
                    {ag.status === 'POST_APPEL' && (
                      <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        Post-appel
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                    {ag.callNumber}
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12.5px', fontWeight: 700 }}>
                    {ag.duration}
                  </td>
                  <td style={{ fontSize: '12.5px' }}>
                    {ag.prospect}
                  </td>
                  <td>
                    {ag.snrDb ? (
                      <span className={`badge ${ag.snrDb >= 15 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
                        {ag.snrDb} dB {ag.snrDb < 15 ? '(Bruit plateau)' : ''}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{ag.hookResult}</span>
                  </td>
                  <td>
                    {ag.status === 'EN_COMMUNICATION' ? (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigate('/transcriptions')}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11.5px' }}
                      >
                        <Headphones size={13} /> Écouter
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                    )}
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
              Derniers Appels de Prospection Sortante
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Enregistrements audio analysés avec score de qualité d'accroche et niveau de bruit SNR.
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('/appels')}
          >
            Voir tous les appels ({calls.length}) →
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Réf. Appel</th>
                <th>Conseiller</th>
                <th>Prospect / Entreprise</th>
                <th>Durée</th>
                <th>Bruit Ligne (SNR)</th>
                <th>Accroche & Objections</th>
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
                    <span style={{ fontSize: '12px' }}>
                      {c.qualityScore && c.qualityScore >= 80 ? '✓ Objections traitées' : '⚠ Accroche hésitante'}
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
                      onClick={() => onNavigate(`/transcriptions/${c.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '11px' }}
                      title="Ouvrir dans le Studio de Transcription"
                    >
                      <Play size={11} /> Transcrire
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
