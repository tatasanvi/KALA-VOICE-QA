import React, { useState } from 'react';
import { 
  TrendingUp, Target, Plus, CheckCircle2, 
  Calendar, Award, Sparkles, BookOpen, User, Clock, ArrowRight
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { CoachingPlan, UserRole } from '../../types';

interface CoachingViewProps {
  onNavigate: (view: any) => void;
  onSelectAgent: (agentId: string) => void;
  currentRole: UserRole;
}

export const CoachingView: React.FC<CoachingViewProps> = ({ onNavigate, onSelectAgent }) => {
  const agents = storageService.getAgents();
  const coachingPlans = storageService.getCoachingPlans();
  const trainingSessions = storageService.getTrainingSessions();

  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0].id);
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const activePlan = coachingPlans.find(cp => cp.agentId === selectedAgent.id);
  const agentSessions = trainingSessions.filter(ts => ts.agentId === selectedAgent.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Sélecteur d'Agent */}
      <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <User size={20} color="var(--primary-light)" />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Conseiller sélectionné :</span>
            <select 
              value={selectedAgent.id}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.teamName.split('—')[0]} (Score QA : {a.averageQualityScore}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              onSelectAgent(selectedAgent.id);
              onNavigate('agents');
            }}
          >
            Voir Fiche Profil 360°
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('training')}
          >
            <BookOpen size={14} />
            <span>Catalogue des Formations</span>
          </button>
        </div>
      </div>

      {/* Profil Synthétique Agent & KPI Coaching */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src={selectedAgent.avatarUrl} 
            alt={selectedAgent.name} 
            style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-full)', border: '2px solid var(--primary)', objectFit: 'cover' }}
          />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedAgent.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {selectedAgent.teamName} • Ancienneté : {selectedAgent.seniority}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <span className={`badge ${selectedAgent.status === 'EN_COACHING' ? 'badge-amber' : 'badge-green'}`}>
                Statut : {selectedAgent.status}
              </span>
              <span className="badge badge-purple">
                Score Qualité Moyen : {selectedAgent.averageQualityScore}%
              </span>
            </div>
          </div>
        </div>

        {activePlan && (
          <div style={{ 
            background: 'rgba(74, 111, 165, 0.08)', 
            border: '1px solid rgba(74, 111, 165, 0.3)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '14px 20px', 
            minWidth: '240px' 
          }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Progression du Plan de Coaching
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary-light)' }}>
                {activePlan.progressionPercentage}%
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>d'objectifs atteints</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${activePlan.progressionPercentage}%`, background: 'var(--primary-gradient)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Cartes Forces & Axes d'Amélioration Détectés par l'IA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <div className="glass-panel" style={{ borderLeft: '4px solid #3f9a7a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Award size={18} color="#6db89a" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#6db89a' }}>FORCES DE L'AGENT</h3>
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '13.5px', lineHeight: 1.6, color: '#d1fae5' }}>
            {selectedAgent.strengths.map((str, i) => (
              <li key={i}>{str}</li>
            ))}
          </ul>
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Target size={18} color="#d9ae55" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#d9ae55' }}>AXES D'AMÉLIORATION CIBLÉS</h3>
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '13.5px', lineHeight: 1.6, color: '#fef3c7' }}>
            {selectedAgent.improvementAxes.map((axe, i) => (
              <li key={i}>{axe}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Plan de Coaching Individuel */}
      {activePlan ? (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Programme d'Accompagnement Spécifique
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                Plan de Coaching Individuel — {activePlan.agentName}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Formateur référent : <strong>{activePlan.trainerName}</strong> • Date cible de clôture : {activePlan.targetCompletionDate}
              </p>
            </div>
            {activePlan.nextSessionDate && (
              <span className="badge badge-blue">
                <Calendar size={12} style={{ marginRight: '4px' }} /> Prochaine session : {activePlan.nextSessionDate}
              </span>
            )}
          </div>

          <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#e2e8f0', background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '18px' }}>
            {activePlan.overallObjectiveSummary}
          </p>

          {/* Grille des Objectifs avec colonnes métier */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activePlan.objectives.map((obj) => {
              const statusColor = obj.status === 'VALIDÉ' ? '#6db89a' : obj.status === 'EN_COURS' ? '#9fb7d6' : '#d9ae55';
              const statusBg = obj.status === 'VALIDÉ' ? 'rgba(52,211,153,0.12)' : obj.status === 'EN_COURS' ? 'rgba(96,165,250,0.12)' : 'rgba(251,191,36,0.12)';
              const statusLabel = obj.status === 'VALIDÉ' ? '✅ Objectif Atteint' : obj.status === 'EN_COURS' ? '🔄 En Cours' : '📋 À Faire';
              return (
                <div 
                  key={obj.id} 
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: `1px solid ${statusColor}33`, 
                    borderLeft: `4px solid ${statusColor}`,
                    borderRadius: 'var(--radius-md)', 
                    padding: '14px 18px' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Target size={15} color={statusColor} />
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {obj.title}
                      </h4>
                    </div>
                    <span style={{ 
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      background: statusBg, color: statusColor, border: `1px solid ${statusColor}33`
                    }}>
                      {statusLabel}
                    </span>
                  </div>

                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                    {obj.description}
                  </p>

                  {/* Grille métier : Niveau / Cible / Action / Responsable / Date */}
                  <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                    gap: '10px', marginBottom: '10px',
                    background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Niveau initial</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#d98383' }}>{obj.currentLevel}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowRight size={12} color="var(--text-muted)" style={{ marginTop: '12px' }} />
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Niveau cible</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#6db89a' }}>{obj.targetLevel}</div>
                      </div>
                    </div>
                    {obj.action && (
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Action concrète</div>
                        <div style={{ fontSize: '12px', color: '#e2e8f0' }}>{obj.action}</div>
                      </div>
                    )}
                    {obj.responsable && (
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Responsable</div>
                        <div style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <User size={11} /> {obj.responsable}
                        </div>
                      </div>
                    )}
                    {obj.date && (
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Date cible</div>
                        <div style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} /> {obj.date}
                        </div>
                      </div>
                    )}
                    {obj.resultat && (
                      <div>
                        <div style={{ fontSize: '10px', color: '#6db89a', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>Résultat</div>
                        <div style={{ fontSize: '12px', color: '#d1fae5', fontWeight: 600 }}>{obj.resultat}</div>
                      </div>
                    )}
                  </div>

                  {/* Exercices suggérés */}
                  {obj.suggestedExercises.length > 0 && (
                    <div style={{ background: 'rgba(74, 111, 165,0.05)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--primary-light)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#b4c6de', marginBottom: '3px' }}>Exercices & Simulations :</div>
                      <ul style={{ paddingLeft: '14px', fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
                        {obj.suggestedExercises.map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '18px', padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Observations du Formateur :</strong> {activePlan.trainerNotes}
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Sparkles size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Aucun plan de coaching actif pour ce conseiller</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 16px' }}>
            Générez un programme d'accompagnement individualisé basé sur les lacunes identifiées dans les contrôles qualité.
          </p>
          <button className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Créer un Plan de Coaching</span>
          </button>
        </div>
      )}

      {/* Historique des Sessions de Formation du Conseiller */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
          Historique des Formations & Mesure de l'Impact
        </h3>
        
        {agentSessions.length > 0 ? (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Module de Formation</th>
                  <th>Date & Formateur</th>
                  <th>Statut</th>
                  <th>Score Avant</th>
                  <th>Score Après</th>
                  <th>Progression (Uplift)</th>
                  <th>Résultats Simulations</th>
                </tr>
              </thead>
              <tbody>
                {agentSessions.map(sess => (
                  <tr key={sess.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sess.moduleTitle}</div>
                    </td>
                    <td>
                      <div>{sess.scheduledDate}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sess.trainerName}</div>
                    </td>
                    <td>
                      <span className={`badge ${sess.status === 'TERMINÉE' ? 'badge-green' : 'badge-amber'}`}>
                        {sess.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      {sess.preTrainingQualityScore}%
                    </td>
                    <td style={{ fontWeight: 700, color: sess.postTrainingQualityScore ? '#6db89a' : 'var(--text-muted)' }}>
                      {sess.postTrainingQualityScore ? `${sess.postTrainingQualityScore}%` : 'En attente'}
                    </td>
                    <td>
                      {sess.upliftPercentage ? (
                        <span className="badge badge-green">+{sess.upliftPercentage}%</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {sess.simulationExercisesCompleted.map((sim, i) => (
                          <div key={i} style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                            ✓ {sim.title} ({sim.score}/100)
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Aucune session de formation passée enregistrée pour cet agent.
          </div>
        )}
      </div>
    </div>
  );
};
