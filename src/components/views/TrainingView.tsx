import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, Clock, Users, Plus, 
  Calendar, CheckCircle2, TrendingUp, X
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserRole, TrainingSession } from '../../types';

interface TrainingViewProps {
  onNavigate: (view: any) => void;
  currentRole: UserRole;
}

export const TrainingView: React.FC<TrainingViewProps> = () => {
  const modules = storageService.getTrainingModules();
  const sessions = storageService.getTrainingSessions();
  const agents = storageService.getAgents();

  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0].id);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0].id);
  const [sessionDate, setSessionDate] = useState<string>('2024-04-22');

  const handleAssignSession = () => {
    const mod = modules.find(m => m.id === selectedModuleId);
    const agent = agents.find(a => a.id === selectedAgentId);
    if (!mod || !agent) return;

    const newSession: TrainingSession = {
      id: `sess-${Date.now()}`,
      agentId: agent.id,
      agentName: agent.name,
      trainerId: 'user-trainer',
      trainerName: 'Patrick Simon (Formateur)',
      moduleId: mod.id,
      moduleTitle: mod.title,
      scheduledDate: sessionDate,
      status: 'PLANIFIÉE',
      preTrainingQualityScore: agent.averageQualityScore,
      trainerFeedback: 'Nouvelle session planifiée dans le cadre du plan de montée en compétences.',
      simulationExercisesCompleted: []
    };

    storageService.addTrainingSession(newSession);
    setShowAssignModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* En-tête Espace Formateur */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={22} color="var(--primary-light)" />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Espace Formateur & Académie Métier</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gestion des modules de compétences, planification des ateliers et analyse d'impact avant/après.
          </p>
        </div>

        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowAssignModal(true)}
        >
          <Plus size={14} />
          <span>Planifier une Formation</span>
        </button>
      </div>

      {/* ── Spotlight ROI & Boucle d'Impact Métier ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 78, 59, 0.08))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Uplift Moyen Post-Formation</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399' }}>+14.8%</div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Progression moyenne constatée sur la note QA des appels réels dans les 30 jours suivant la validation d'un module.
          </p>
        </div>

        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(49, 46, 129, 0.08))', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Taux de Validation Simulations</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#818cf8' }}>94.2%</div>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {sessions.filter(s => s.status === 'TERMINÉE').length} sessions complétées avec succès sur simulations vocales interactives.
          </p>
        </div>

        {/* Focus Cas d'École Koffi Mensah */}
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(120, 53, 15, 0.08))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🌟</span>
              <div>
                <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cas d'École Pilote
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Koffi Mensah (Rétention Fibre)
                </div>
              </div>
            </div>
            <span className="badge badge-green" style={{ fontSize: '11px', fontWeight: 800 }}>+13 pts</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', marginTop: '6px' }}>
            <span style={{ fontWeight: 700, color: '#f87171' }}>68% (Jan)</span>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '68%', background: '#f87171', borderRadius: '2px' }} />
              <div style={{ position: 'absolute', left: '68%', top: 0, height: '100%', width: '13%', background: '#34d399', borderRadius: '2px' }} />
            </div>
            <span style={{ fontWeight: 800, color: '#34d399' }}>81% (Avr)</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.3 }}>
            Module <em>Traitement Objections</em> : passage au-dessus du seuil de conformité grâce aux ateliers ciblés.
          </p>
        </div>
      </div>

      {/* Catalogue des Modules */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
          Catalogue des Modules de Formation Disponible
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {modules.map(mod => (
            <div key={mod.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-gray" style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px' }}>{mod.code}</span>
                  <span className="badge badge-purple" style={{ fontSize: '11px' }}>{mod.difficultyLevel}</span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
                  {mod.title}
                </h4>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {mod.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {mod.targetCompetencies.map((comp, idx) => (
                    <span key={idx} className="badge badge-blue" style={{ fontSize: '10.5px' }}>
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {mod.durationMinutes} min
                </span>
                <span>{mod.interactiveSimulationsCount} mises en situation</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions Planifiées & Comparatif Avant / Après */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
          Sessions de Formation & Mesure d'Efficacité (Avant / Après)
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Conseiller</th>
                <th>Module Formateur</th>
                <th>Date Planifiée</th>
                <th>Statut</th>
                <th>Note Initiale QA</th>
                <th>Note Post-Formation</th>
                <th>Impact / Uplift</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(sess => (
                <tr key={sess.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{sess.agentName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sess.trainerName}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sess.moduleTitle}</div>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                    {sess.scheduledDate}
                  </td>
                  <td>
                    <span className={`badge ${sess.status === 'TERMINÉE' ? 'badge-green' : 'badge-amber'}`}>
                      {sess.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {sess.preTrainingQualityScore}%
                  </td>
                  <td style={{ fontWeight: 700, color: sess.postTrainingQualityScore ? '#34d399' : 'var(--text-muted)' }}>
                    {sess.postTrainingQualityScore ? `${sess.postTrainingQualityScore}%` : 'À réaliser'}
                  </td>
                  <td>
                    {sess.upliftPercentage ? (
                      <span className="badge badge-green" style={{ fontWeight: 700 }}>
                        <TrendingUp size={11} style={{ marginRight: '3px' }} /> +{sess.upliftPercentage}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>En attente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'Affectation de Formation */}
      {showAssignModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Planifier une session de formation</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAssignModal(false)}>
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Conseiller à former :
                </label>
                <select 
                  value={selectedAgentId} 
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="role-select"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.teamName.split('—')[0]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Module de formation ciblé :
                </label>
                <select 
                  value={selectedModuleId} 
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="role-select"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                >
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.title} ({m.durationMinutes} min)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Date d'exécution de la session :
                </label>
                <input 
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleAssignSession}>
                Confirmer l'affectation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
