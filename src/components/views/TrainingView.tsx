import React, { useState } from 'react';
import { Clock, GraduationCap, Plus, Pencil, Trash2, X } from 'lucide-react';
import { trainingApi } from '../../services/apiClient';
import { storageService as localStorageService } from '../../services/storageService';
import { Agent, TrainingModule, TrainingSession, UserRole } from '../../types';

interface TrainingViewProps { onNavigate: (view: any) => void; currentRole: UserRole; }
const blankModule = (): Partial<TrainingModule> => ({ code: '', title: '', category: '', durationMinutes: 60, description: '', targetCompetencies: [], interactiveSimulationsCount: 0, difficultyLevel: 'DÉBUTANT' });

export const TrainingView: React.FC<TrainingViewProps> = ({ currentRole }) => {
  const [modules, setModules] = useState(localStorageService.getTrainingModules());
  const [sessions, setSessions] = useState(localStorageService.getTrainingSessions());
  const [agents] = useState<Agent[]>(localStorageService.getAgents());
  const [showSession, setShowSession] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editing, setEditing] = useState<TrainingModule | null>(null);
  const [moduleForm, setModuleForm] = useState<Partial<TrainingModule>>(blankModule());
  const [competencies, setCompetencies] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const canManage = currentRole !== 'AGENT';

  const openModule = (module?: TrainingModule) => {
    setEditing(module ?? null);
    setModuleForm(module ? { ...module } : blankModule());
    setCompetencies(module?.targetCompetencies.join('\n') ?? '');
    setShowModuleForm(true);
    setMessage('');
  };

  const saveModule = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const payload = { ...moduleForm, targetCompetencies: competencies.split('\n').map(x => x.trim()).filter(Boolean) };
    try {
      const result = editing ? await trainingApi.updateModule(editing.id, payload) : await trainingApi.createModule(payload);
      if (!result.ok || !result.data) throw new Error(result.error ?? 'Enregistrement impossible.');
      const saved = result.data;
      const updated = editing ? modules.map(item => item.id === editing.id ? saved : item) : [...modules, saved];
      localStorageService.setTrainingModules(updated); setModules(updated); setEditing(null); setShowModuleForm(false);
      window.dispatchEvent(new Event('kala:data-refresh'));
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.'); }
    finally { setBusy(false); }
  };

  const deleteModule = async (module: TrainingModule) => {
    if (!window.confirm(`Supprimer le module « ${module.title} » ?`)) return;
    setMessage('');
    try {
      const result = await trainingApi.deleteModule(module.id);
      if (!result.ok) throw new Error(result.error ?? 'Suppression impossible.');
      const updated = modules.filter(item => item.id !== module.id);
      localStorageService.setTrainingModules(updated); setModules(updated); window.dispatchEvent(new Event('kala:data-refresh'));
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Suppression impossible.'); }
  };

  const createSession = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const module = modules.find(item => item.id === selectedModuleId);
    const agent = agents.find(item => item.id === selectedAgentId);
    if (!module || !agent) { setMessage('Choisis un module et un conseiller.'); setBusy(false); return; }
    if (agent.callsAnalyzedCount < 1) { setMessage('Une évaluation QA réelle est nécessaire pour établir le niveau initial avant la formation.'); setBusy(false); return; }
    const session: Partial<TrainingSession> = {
      id: `session-${crypto.randomUUID()}`, agentId: agent.id, agentName: agent.name,
      moduleId: module.id, moduleTitle: module.title, scheduledDate: sessionDate,
      status: 'PLANIFIÉE', preTrainingQualityScore: agent.averageQualityScore,
      trainerFeedback: '', simulationExercisesCompleted: [],
    };
    try {
      const result = await trainingApi.addSession(session);
      if (!result.ok || !result.data) throw new Error(result.error ?? 'Planification impossible.');
      const saved = result.data;
      const updated = [...sessions, saved]; localStorageService.setTrainingSessions(updated); setSessions(updated);
      setShowSession(false); window.dispatchEvent(new Event('kala:data-refresh'));
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Planification impossible.'); }
    finally { setBusy(false); }
  };

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
      <div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GraduationCap size={22} color="var(--primary-light)" /><h2 style={{ fontSize: 20, fontWeight: 800 }}>Formations</h2></div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Crée des modules à partir de vos scripts, critères qualité, vocabulaire et objectifs métier.</p></div>
      {canManage && <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-secondary btn-sm" onClick={() => openModule()}><Plus size={14} /> Nouveau module</button><button className="btn btn-primary btn-sm" disabled={!modules.length || !agents.length} onClick={() => { setMessage(''); setSelectedModuleId(modules[0]?.id ?? ''); setSelectedAgentId(agents[0]?.id ?? ''); setShowSession(true); }}><Plus size={14} /> Planifier</button></div>}
    </div>

    {message && <div role="status" className="glass-panel" style={{ color: 'var(--text-secondary)' }}>{message}</div>}
    <div className="glass-panel"><h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Catalogue des modules</h3>
      {modules.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aucun module enregistré. Ajoute un module avec son contenu métier validé par ton équipe.</p> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>{modules.map(mod => <article key={mod.id} className="glass-panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span className="badge badge-gray">{mod.code}</span><span className="badge badge-purple">{mod.difficultyLevel}</span></div>
          <h4 style={{ margin: '12px 0 6px', fontSize: 15 }}>{mod.title}</h4><div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{mod.category}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.5, margin: '10px 0' }}>{mod.description || 'Description non renseignée.'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{mod.targetCompetencies.map((item, i) => <span key={i} className="badge badge-blue">{item}</span>)}</div>
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}><span><Clock size={13} /> {mod.durationMinutes} min</span><span>{mod.interactiveSimulationsCount} mises en situation</span></div>
          {canManage && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}><button className="btn btn-secondary btn-sm" onClick={() => openModule(mod)} aria-label="Modifier le module"><Pencil size={14} /></button><button className="btn btn-secondary btn-sm" onClick={() => void deleteModule(mod)} aria-label="Supprimer le module"><Trash2 size={14} /></button></div>}
        </article>)}</div>}
    </div>

    <div className="glass-panel"><h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Sessions enregistrées</h3>
      {sessions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aucune session de formation enregistrée.</p> : <div className="data-table-container"><table className="data-table"><thead><tr><th>Conseiller</th><th>Module</th><th>Date</th><th>Statut</th><th>Évaluation avant</th><th>Évaluation après</th></tr></thead><tbody>{sessions.map(item => <tr key={item.id}><td>{item.agentName}<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.trainerName}</div></td><td>{item.moduleTitle}</td><td>{item.scheduledDate}</td><td>{item.status}</td><td>{item.preTrainingQualityScore == null ? 'Non mesurée' : `${item.preTrainingQualityScore}%`}</td><td>{item.postTrainingQualityScore == null ? 'Non mesurée' : `${item.postTrainingQualityScore}%`}</td></tr>)}</tbody></table></div>}
    </div>

    {showModuleForm && <div style={overlay}><form className="glass-panel" onSubmit={saveModule} style={{ ...dialog, maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={dialogHeader}><h3>{editing ? 'Modifier le module' : 'Créer un module'}</h3><button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModuleForm(false)}><X size={14} /></button></div>
      <label>Code<input required maxLength={40} value={moduleForm.code ?? ''} onChange={e => setModuleForm({ ...moduleForm, code: e.target.value })} style={selectStyle} /></label>
      <label>Titre<input required maxLength={120} value={moduleForm.title ?? ''} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} style={selectStyle} /></label>
      <label>Secteur / catégorie<input required maxLength={100} placeholder="Ex. collecte de dons, télécom, assurance…" value={moduleForm.category ?? ''} onChange={e => setModuleForm({ ...moduleForm, category: e.target.value })} style={selectStyle} /></label>
      <label>Description<textarea rows={3} value={moduleForm.description ?? ''} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} style={selectStyle} /></label>
      <label>Compétences visées (une par ligne)<textarea rows={4} value={competencies} onChange={e => setCompetencies(e.target.value)} style={selectStyle} /></label>
      <label>Durée (minutes)<input type="number" min="1" max="1440" required value={moduleForm.durationMinutes ?? 60} onChange={e => setModuleForm({ ...moduleForm, durationMinutes: Number(e.target.value) })} style={selectStyle} /></label>
      <label>Difficulté<select value={moduleForm.difficultyLevel ?? 'DÉBUTANT'} onChange={e => setModuleForm({ ...moduleForm, difficultyLevel: e.target.value as TrainingModule['difficultyLevel'] })} style={selectStyle}><option>DÉBUTANT</option><option>INTERMÉDIAIRE</option><option>AVANCÉ</option></select></label>
      <label>Mises en situation (nombre)<input type="number" min="0" max="100" value={moduleForm.interactiveSimulationsCount ?? 0} onChange={e => setModuleForm({ ...moduleForm, interactiveSimulationsCount: Number(e.target.value) })} style={selectStyle} /></label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}><button type="button" className="btn btn-secondary" onClick={() => setShowModuleForm(false)}>Annuler</button><button disabled={busy} className="btn btn-primary">Enregistrer le module</button></div>
    </form></div>}

    {showSession && <div style={overlay}><form className="glass-panel" onSubmit={createSession} style={dialog}><div style={dialogHeader}><h3>Planifier une session</h3><button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSession(false)}><X size={14} /></button></div>
      <label>Conseiller<select required value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)} className="role-select" style={selectStyle}>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
      <label>Module<select required value={selectedModuleId} onChange={e => setSelectedModuleId(e.target.value)} className="role-select" style={selectStyle}>{modules.map(mod => <option key={mod.id} value={mod.id}>{mod.title}</option>)}</select></label>
      <label>Date<input required type="date" min={new Date().toISOString().slice(0, 10)} value={sessionDate} onChange={e => setSessionDate(e.target.value)} style={selectStyle} /></label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}><button type="button" className="btn btn-secondary" onClick={() => setShowSession(false)}>Annuler</button><button disabled={busy} className="btn btn-primary">Confirmer</button></div>
    </form></div>}
  </div>;
};

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
const dialog: React.CSSProperties = { width: 500, maxWidth: '92vw', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 };
const dialogHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 };
const selectStyle: React.CSSProperties = { display: 'block', width: '100%', marginTop: 5, padding: '8px 12px', background: 'rgba(0,0,0,.4)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' };
