import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, AlertCircle, Loader2 } from 'lucide-react';
import { transcriptionsApi, TranscriptionResult } from '../../services/apiClient';

const MAX_BYTES = 25 * 1024 * 1024;

const fmt = (t: number | null) => {
  if (t === null || t === undefined) return '?';
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
};

// Upload réel -> service ASR local (Whisper-small, signal brut) -> affichage du résultat.
// N'affiche que des valeurs renvoyées par le service : aucun WER, SNR ni score.
export const RealTranscription: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  const pick = (f: File | undefined) => {
    setResult(null);
    setError(null);
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setFile(null);
      setError('Fichier trop volumineux (25 Mo maximum).');
      return;
    }
    setFile(f);
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await transcriptionsApi.transcribe(file);
    setLoading(false);
    if (res.ok && res.data) setResult(res.data);
    else setError(res.error ?? 'Échec de la transcription.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!loading) pick(e.dataTransfer.files?.[0]); }}
        style={{
          border: '2px dashed var(--border-active)', borderRadius: 'var(--radius-lg)',
          padding: '28px 20px', textAlign: 'center', cursor: loading ? 'default' : 'pointer',
          background: 'rgba(255, 255, 255, 0.03)'
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={e => pick(e.target.files?.[0])}
        />
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <FileAudio size={28} color="var(--primary-light)" />
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{file.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {(file.size / (1024 * 1024)).toFixed(2)} Mo
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <UploadCloud size={32} color="var(--primary-light)" />
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Glissez-déposez un fichier audio, ou cliquez pour parcourir</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>WAV, MP3, M4A, OGG, FLAC • 25 Mo maximum</div>
          </div>
        )}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Transcription par Whisper-small sur le signal brut, sans débruitage. Le fichier n'est pas conservé.
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={run} disabled={!file || loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {loading && <Loader2 size={16} />}
          <span>{loading ? 'Transcription en cours…' : 'Lancer la transcription'}</span>
        </button>
      </div>

      {loading && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Le calcul se fait en local sur processeur : comptez environ la durée de l'audio, parfois davantage.
        </div>
      )}

      {error && (
        <div role="alert" style={{
          display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px',
          background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#e8b4b4'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-gray">Modèle : {result.model}</span>
            <span className="badge badge-gray">Durée audio : {result.duration.toFixed(1)} s</span>
            <span className="badge badge-gray">Temps de traitement : {result.processing_time.toFixed(1)} s</span>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Transcription</div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', lineHeight: 1.6 }}>
              {result.text || <em style={{ color: 'var(--text-muted)' }}>Aucune parole reconnue.</em>}
            </div>
          </div>

          {result.segments.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Segments horodatés</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                {result.segments.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {fmt(s.start)} → {fmt(s.end)}
                    </span>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
