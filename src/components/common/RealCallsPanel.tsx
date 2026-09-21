import React, { useEffect, useState } from 'react';
import { Eye, X, RefreshCw } from 'lucide-react';
import { realCallsApi, RealCall, TranscriptionResult } from '../../services/apiClient';
import { ResultView, ComparisonView } from './RealTranscription';

export const RealCallBadge: React.FC = () => (
  <span className="badge badge-green" style={{ fontSize: '10px' }} title="Transcription réelle enregistrée par le backend">
    Réel
  </span>
);

const pct = (x: number | null) => (x === null ? null : `${(x * 100).toFixed(1)} %`);

// Reconstruit la forme attendue par l'affichage à partir de l'appel enregistré (aucune valeur ajoutée).
const toResult = (c: RealCall): TranscriptionResult => ({
  text: c.text,
  segments: c.segments,
  duration: c.durationSeconds,
  processing_time: c.processingTime,
  model: c.model,
  wer: c.wer,
  cer: c.cer,
  reference_normalized: c.referenceNormalized,
  hypothesis_normalized: c.hypothesisNormalized,
  denoised: c.denoised,
  wer_delta: c.werDelta,
});

const RealCallDetail: React.FC<{ call: RealCall; onClose: () => void }> = ({ call, onClose }) => {
  const result = toResult(call);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div className="glass-panel" style={{ width: '820px', maxWidth: '96%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{call.callNumber}</h3>
              <RealCallBadge />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {new Date(call.createdAt).toLocaleString('fr-FR')} • {call.filename} • importé par {call.createdByName}
              {' • '}{call.audioStored ? 'audio conservé' : 'audio non conservé'}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        {call.denoised ? <ComparisonView result={result} /> : <ResultView result={result} />}
      </div>
    </div>
  );
};

// Liste des appels réellement transcrits, alimentée par le backend (SQLite).
export const RealCallsPanel: React.FC<{ refreshKey?: number }> = ({ refreshKey = 0 }) => {
  const [calls, setCalls] = useState<RealCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RealCall | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await realCallsApi.list();
    setLoading(false);
    if (res.ok && res.data) { setCalls(res.data); setError(null); }
    else setError(res.status === 401 ? 'Connectez-vous avec le backend démarré pour voir les appels réels.' : (res.error ?? 'Liste indisponible.'));
  };

  useEffect(() => { load(); }, [refreshKey]);

  return (
    <div className="glass-panel" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Appels transcrits (réels)</h3>
          <RealCallBadge />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={13} /> <span>Actualiser</span>
        </button>
      </div>

      {error ? (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{error}</div>
      ) : calls.length === 0 ? (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {loading ? 'Chargement…' : 'Aucune transcription réelle pour le moment. Importez un audio pour lancer une transcription.'}
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Appel</th>
                <th>Date</th>
                <th>Durée</th>
                <th>Modèle</th>
                <th>WER</th>
                <th>Audio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {calls.map(c => (
                <tr key={c.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>{c.callNumber}</strong><RealCallBadge /></div></td>
                  <td style={{ fontSize: '12px' }}>{new Date(c.createdAt).toLocaleString('fr-FR')}</td>
                  <td style={{ fontSize: '12px' }}>{c.durationSeconds.toFixed(1)} s</td>
                  <td style={{ fontSize: '12px' }}>{c.model}</td>
                  <td style={{ fontSize: '12px' }}>{pct(c.wer) ?? <span style={{ color: 'var(--text-muted)' }}>non mesuré</span>}</td>
                  <td style={{ fontSize: '12px' }}>{c.audioStored ? 'conservé' : 'non conservé'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(c)}>
                      <Eye size={13} /> <span>Voir</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <RealCallDetail call={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};
