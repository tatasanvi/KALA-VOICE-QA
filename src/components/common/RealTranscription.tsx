import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, AlertCircle, Loader2 } from 'lucide-react';
import { transcriptionsApi, TranscriptionResult, DenoisedResult } from '../../services/apiClient';

const MAX_BYTES = 25 * 1024 * 1024;

const fmt = (t: number | null) => {
  if (t === null || t === undefined) return '?';
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
};

const pct = (x: number) => `${(x * 100).toFixed(1)} %`;

type Metrics = Pick<TranscriptionResult, 'wer' | 'cer' | 'reference_normalized' | 'hypothesis_normalized'>;

const MeasuredMetrics: React.FC<{ result: Metrics }> = ({ result }) => {
  if (result.wer === null || result.cer === null) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="badge badge-blue" style={{ fontSize: '13px', fontWeight: 700 }}>WER mesuré : {pct(result.wer)}</span>
        <span className="badge badge-gray" style={{ fontSize: '13px' }}>CER mesuré : {pct(result.cer)}</span>
      </div>
      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
        Valeurs mesurées sur cet audio, par rapport à la référence saisie, après la même normalisation que dans le mémoire
        (minuscules, ponctuation, chiffres et tirets retirés).
      </div>
      <details style={{ marginTop: '8px', fontSize: '12px' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>Textes normalisés utilisés pour le calcul</summary>
        <div style={{ marginTop: '6px', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>
          <div><strong>Référence :</strong> {result.reference_normalized}</div>
          <div><strong>Hypothèse :</strong> {result.hypothesis_normalized}</div>
        </div>
      </details>
    </div>
  );
};

const ResultView: React.FC<{ result: TranscriptionResult | DenoisedResult; header?: React.ReactNode }> = ({ result, header }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
    {header ?? (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {'model' in result && <span className="badge badge-gray">Modèle : {result.model}</span>}
        {'duration' in result && <span className="badge badge-gray">Durée audio : {result.duration.toFixed(1)} s</span>}
        <span className="badge badge-gray">Temps de traitement : {result.processing_time.toFixed(1)} s</span>
      </div>
    )}

    <MeasuredMetrics result={result} />

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
);

const pts = (x: number) => `${x > 0 ? '+' : ''}${(x * 100).toFixed(1)} points`;

// Deux transcriptions côte à côte : aucune voie n'est présentée comme meilleure, l'écart est affiché tel que mesuré.
const ComparisonView: React.FC<{ result: TranscriptionResult }> = ({ result }) => {
  const b = result.denoised!;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className="badge badge-gray">Modèle : {result.model}</span>
        <span className="badge badge-gray">Durée audio : {result.duration.toFixed(1)} s</span>
        {result.wer_delta !== null && result.wer_delta !== undefined && (
          <span className="badge badge-blue" style={{ fontWeight: 700 }}>Écart de WER (avec − sans débruitage) : {pts(result.wer_delta)}</span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Sans débruitage (signal brut)</div>
          <ResultView result={result} header={
            <span className="badge badge-gray">Temps de transcription : {result.processing_time.toFixed(1)} s</span>
          } />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Avec débruitage ({b.denoiser})</div>
          <ResultView result={b} header={
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-gray">Débruitage : {b.denoise_time.toFixed(1)} s</span>
              <span className="badge badge-gray">Transcription : {b.processing_time.toFixed(1)} s</span>
              {b.enh_corr !== null && (
                <span className={`badge ${b.enh_ok ? 'badge-gray' : 'badge-amber'}`}
                  title="Corrélation entre le signal envoyé au débruiteur et sa sortie. En dessous de 0,5, le débruitage est signalé comme douteux.">
                  Corrélation entrée/sortie : {b.enh_corr.toFixed(3)}{b.enh_ok ? '' : ' (débruitage douteux)'}
                </span>
              )}
            </div>
          } />
        </div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Résultat mesuré sur cet audio. Voir le mémoire pour l'analyse sur corpus.
      </div>
    </div>
  );
};

// Upload réel -> service ASR local (Whisper-small, signal brut) -> affichage du résultat.
// N'affiche que des valeurs renvoyées par le service : WER/CER seulement si une référence est saisie.
export const RealTranscription: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState('');
  const [compareDfn3, setCompareDfn3] = useState(false);
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
    const res = await transcriptionsApi.transcribe(file, reference, compareDfn3);
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

      <div>
        <label htmlFor="reference-text" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
          Transcription de référence (facultatif)
        </label>
        <textarea
          id="reference-text"
          value={reference}
          onChange={e => { setReference(e.target.value); setResult(null); }}
          disabled={loading}
          rows={3}
          placeholder="Saisissez le texte réellement prononcé pour mesurer le WER et le CER."
          style={{
            width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical'
          }}
        />
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Sans référence, aucun WER ni CER n'est calculé.
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: loading ? 'default' : 'pointer' }}>
        <input type="checkbox" checked={compareDfn3} disabled={loading}
          onChange={e => { setCompareDfn3(e.target.checked); setResult(null); }} />
        Comparer avec débruitage (DeepFilterNet3)
      </label>

      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {compareDfn3
          ? "Le fichier est transcrit deux fois par Whisper-small : sur le signal brut, puis après DeepFilterNet3. Le traitement est environ deux fois plus long. Le fichier n'est pas conservé."
          : "Transcription par Whisper-small sur le signal brut, sans débruitage. Le fichier n'est pas conservé."}
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

      {result && (result.denoised ? <ComparisonView result={result} /> : <ResultView result={result} />)}
    </div>
  );
};
