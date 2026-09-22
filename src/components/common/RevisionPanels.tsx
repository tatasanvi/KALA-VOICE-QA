import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Flag, RefreshCw, X } from 'lucide-react';
import { myEvaluationsApi, revisionsApi, RevisionRequest } from '../../services/apiClient';

const STATUS_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
};

const Message: React.FC<{ kind: 'error' | 'ok'; children: React.ReactNode }> = ({ kind, children }) => (
  <div role="alert" style={{
    display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', marginTop: '10px',
    background: kind === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
    border: `1px solid ${kind === 'error' ? 'var(--danger-border)' : 'var(--success-border)'}`,
    borderRadius: 'var(--radius-md)', padding: '10px 14px',
  }}>
    {kind === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
    <span>{children}</span>
  </div>
);

// ─── Côté conseiller : ses évaluations, en lecture seule, avec contestation ───
export const MyEvaluationsPanel: React.FC = () => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [requests, setRequests] = useState<RevisionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [contesting, setContesting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    const [ev, rq] = await Promise.all([myEvaluationsApi.list(), revisionsApi.list()]);
    if (ev.ok && ev.data) setEvaluations(ev.data); else setError(ev.error ?? 'Évaluations indisponibles.');
    if (rq.ok && rq.data) setRequests(rq.data);
  };
  useEffect(() => { load(); }, []);

  const submit = async (evaluationId: string) => {
    setError(null); setOk(null);
    const res = await revisionsApi.create(evaluationId, reason);
    if (res.ok) {
      setOk('Demande de révision transmise. Un superviseur va l’examiner.');
      setContesting(null); setReason('');
      load();
    } else setError(res.error ?? 'Envoi impossible.');
  };

  const requestFor = (evaluationId: string) => requests.find(r => r.evaluationId === evaluationId);

  return (
    <div className="glass-panel" style={{ padding: '16px 20px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Mes évaluations</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Consultation seule. Si vous n’êtes pas d’accord avec une évaluation, vous pouvez demander une révision :
        elle sera examinée par un superviseur, qui seul peut la modifier.
      </p>

      {evaluations.length === 0 ? (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Aucune évaluation vous concernant pour le moment.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {evaluations.map(e => {
            const req = requestFor(e.id);
            return (
              <div key={e.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontSize: '14px' }}>{e.form_title}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Évaluée le {e.evaluated_at} par {e.evaluator_name} • score {e.overall_score}/100
                    </div>
                  </div>
                  {req ? (
                    <span className={`badge ${req.status === 'EN_ATTENTE' ? 'badge-amber' : req.status === 'ACCEPTEE' ? 'badge-green' : 'badge-gray'}`}>
                      Révision : {STATUS_LABEL[req.status]}
                    </span>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setContesting(e.id); setReason(''); }}>
                      <Flag size={13} /> <span>Contester</span>
                    </button>
                  )}
                </div>

                {req?.resolutionNote && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Réponse de {req.handledByName} : {req.resolutionNote}
                  </div>
                )}

                {contesting === e.id && (
                  <div style={{ marginTop: '10px' }}>
                    <textarea
                      value={reason}
                      onChange={ev => setReason(ev.target.value)}
                      rows={3}
                      placeholder="Motif de la contestation"
                      style={{
                        width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', fontSize: '13px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setContesting(null)}>Annuler</button>
                      <button className="btn btn-primary btn-sm" disabled={!reason.trim()} onClick={() => submit(e.id)}>
                        Envoyer la demande
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <Message kind="error">{error}</Message>}
      {ok && <Message kind="ok">{ok}</Message>}
    </div>
  );
};

// ─── Côté superviseur et au-dessus : les contestations à traiter ─────────────
export const RevisionRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<RevisionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const load = async () => {
    const res = await revisionsApi.list();
    if (res.ok && res.data) { setRequests(res.data); setError(null); }
    else setError(res.error ?? 'Liste indisponible.');
  };
  useEffect(() => { load(); }, []);

  const handle = async (id: string, status: 'ACCEPTEE' | 'REFUSEE') => {
    const res = await revisionsApi.handle(id, status, note[id]);
    if (res.ok) load(); else setError(res.error ?? 'Traitement impossible.');
  };

  const pending = requests.filter(r => r.status === 'EN_ATTENTE');

  return (
    <div className="glass-panel" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
          Contestations en attente {pending.length > 0 && <span className="badge badge-amber">{pending.length}</span>}
        </h3>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={13} /> <span>Actualiser</span></button>
      </div>

      {pending.length === 0 ? (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aucune contestation en attente.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pending.map(r => (
            <div key={r.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                {r.requestedByName} conteste l’évaluation {r.evaluationId}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                Déposée le {new Date(r.createdAt).toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: '13px', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                {r.reason}
              </div>
              <input
                value={note[r.id] ?? ''}
                onChange={e => setNote({ ...note, [r.id]: e.target.value })}
                placeholder="Réponse (facultative)"
                style={{
                  width: '100%', marginTop: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.3)',
                  color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '13px',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handle(r.id, 'REFUSEE')}>
                  <X size={13} /> <span>Refuser</span>
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handle(r.id, 'ACCEPTEE')}>
                  <CheckCircle2 size={13} /> <span>Accepter la révision</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <Message kind="error">{error}</Message>}
    </div>
  );
};
