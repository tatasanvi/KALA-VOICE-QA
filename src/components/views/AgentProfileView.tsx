import React, { useState } from 'react';
import { 
  User, Award, TrendingUp, Calendar, CheckCircle2, 
  Target, BookOpen, Clock, ShieldCheck, Play
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserRole } from '../../types';

interface AgentProfileViewProps {
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  onSelectCall: (callId: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
}

export const AgentProfileView: React.FC<AgentProfileViewProps> = ({ 
  selectedAgentId, 
  onSelectAgent,
  onSelectCall,
  onNavigate
}) => {
  const agents = storageService.getAgents();
  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const calls = storageService.getCalls().filter(c => c.agentId === currentAgent.id);
  const coachingPlan = storageService.getCoachingPlanByAgentId(currentAgent.id);
  const sessions = storageService.getTrainingSessions().filter(s => s.agentId === currentAgent.id);

  const firstScore = currentAgent.monthlyScores[0]?.score ?? Math.round(currentAgent.averageQualityScore);
  const lastScore = currentAgent.monthlyScores[currentAgent.monthlyScores.length - 1]?.score ?? Math.round(currentAgent.averageQualityScore);
  const scoreDiff = lastScore - firstScore;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sélecteur d'Agent */}
      <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <User size={20} color="var(--primary-light)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Fiche Profil 360° Conseiller :</span>
          <select 
            value={currentAgent.id}
            onChange={(e) => onSelectAgent(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}
          >
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name} — {a.teamName.split('—')[0]}</option>
            ))}
          </select>
        </div>

        <span className={`badge ${currentAgent.status === 'ACTIF' ? 'badge-green' : 'badge-amber'}`}>
          Statut : {currentAgent.status}
        </span>
      </div>

      {/* Carte d'Identité & Statistiques Globales */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={currentAgent.avatarUrl} 
            alt={currentAgent.name} 
            style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', border: '3px solid var(--primary)', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{currentAgent.name}</h1>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {currentAgent.email} • Ancienneté : <strong>{currentAgent.seniority}</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">{currentAgent.teamName}</span>
              <span className="badge badge-purple">{currentAgent.campaignName}</span>
              <span className="badge badge-gray">Date d'embauche : {currentAgent.hireDate}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Appels Analysés</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>{currentAgent.callsAnalyzedCount}</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Score Qualité Moyen</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#6db89a', marginTop: '2px' }}>{currentAgent.averageQualityScore}%</div>
          </div>

          <div style={{ background: 'rgba(74, 111, 165, 0.1)', border: '1px solid rgba(74, 111, 165, 0.3)', padding: '12px 20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Taux de Conformité</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--primary-light)', marginTop: '2px' }}>{currentAgent.complianceRate}%</div>
          </div>
        </div>
      </div>

      {/* Plan de Coaching Actif (si présent) */}
      {coachingPlan && (
        <div className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(74, 111, 165, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={20} color="var(--primary-light)" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Plan de Coaching Actif — {coachingPlan.trainerName}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{coachingPlan.overallObjectiveSummary}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-purple">Progression : {coachingPlan.progressionPercentage}%</span>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('coaching')}>
                Ouvrir Coaching
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {coachingPlan.objectives.map(obj => (
              <div key={obj.id} style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{obj.targetCompetency}</span>
                  <span className={`badge ${obj.status === 'VALIDÉ' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '10px' }}>
                    {obj.status}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{obj.title}</div>
                {obj.resultat && (
                  <div style={{ fontSize: '11px', color: '#6db89a', marginTop: '4px', fontWeight: 600 }}>
                    ✓ {obj.resultat}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Évolution Temporelle du Score Qualité (Janvier -> Avril) */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Évolution Temporelle du Score Qualité</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progression chronologique des notes d'évaluations mensuelles</p>
          </div>
          <span className={`badge ${scoreDiff >= 0 ? 'badge-green' : 'badge-amber'}`}>
            {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} pts de progression globale
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          {currentAgent.monthlyScores.map((ms, idx) => {
            const isLast = idx === currentAgent.monthlyScores.length - 1;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '20%' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: isLast ? '#9fb7d6' : 'var(--text-primary)' }}>
                  {ms.score}%
                </span>
                <div 
                  style={{ 
                    width: '100%', 
                    height: `${(ms.score - 50) * 4.2}px`, 
                    background: isLast ? 'var(--primary-gradient)' : 'rgba(74, 111, 165, 0.45)', 
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' 
                  }} 
                />
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {ms.month} : {ms.score} %
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forces, Axes & Formations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ borderLeft: '4px solid #3f9a7a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#6db89a', marginBottom: '10px' }}>
            Principaux Points Forts
          </h3>
          <ul style={{ paddingLeft: '18px', fontSize: '13.5px', lineHeight: 1.7, color: '#d1fae5' }}>
            {currentAgent.strengths.map((str, i) => (
              <li key={i}>{str}</li>
            ))}
          </ul>
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#d9ae55', marginBottom: '10px' }}>
            Principaux Axes d'Amélioration
          </h3>
          <ul style={{ paddingLeft: '18px', fontSize: '13.5px', lineHeight: 1.7, color: '#fef3c7' }}>
            {currentAgent.improvementAxes.map((axe, i) => (
              <li key={i}>{axe}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Formations Suivies & Recommandées */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
          Parcours de Formation & Montée en Compétences
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Formations Suivies & Validées ({sessions.filter(s => s.status === 'TERMINÉE').length}) :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sessions.filter(s => s.status === 'TERMINÉE').map(sess => (
                <div key={sess.id} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#b9d6c8' }}>{sess.moduleTitle}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Validé le {sess.scheduledDate} avec un uplift de <strong>+{sess.upliftPercentage}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Formations Recommandées par l'IA :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: 'rgba(125, 122, 166, 0.08)', border: '1px solid rgba(125, 122, 166, 0.25)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#e9d5ff' }}>Techniques Avancées de Traitement des Objections</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Recommandé suite aux hésitations relevées lors des objections tarifaires concurrentielles.
                </div>
              </div>

              <div style={{ background: 'rgba(125, 122, 166, 0.08)', border: '1px solid rgba(125, 122, 166, 0.25)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#e9d5ff' }}>Gestion du Tempo et Élimination des Interruptions</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Recommandé pour supprimer les coupures acoustiques résiduelles.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des Appels du Conseiller */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
          Historique Récent des Appels de {currentAgent.name}
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Appel</th>
                <th>Date</th>
                <th>Client</th>
                <th>Bruit Estimé</th>
                <th>Score Qualité</th>
                <th>Résolution</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {calls.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{c.callNumber}</td>
                  <td>{c.callDate}</td>
                  <td>{c.customerNameMasked}</td>
                  <td>
                    <span className="badge badge-gray">{c.audioMetadata.estimatedNoiseLevel}</span>
                  </td>
                  <td>
                    <span className="badge badge-green">{c.qualityScore} / 100</span>
                  </td>
                  <td>
                    <span className="badge badge-blue">{c.analytics.resolutionStatus}</span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onSelectCall(c.id);
                        onNavigate('transcriptions');
                      }}
                    >
                      <Play size={12} />
                      <span>Écouter</span>
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
