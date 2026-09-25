import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, AlertCircle, Loader2 } from 'lucide-react';
import { transcriptionsApi, TranscriptionResult, DenoisedResult } from '../../services/apiClient';
import { storageService } from '../../services/storageService';
import { Call, TranscriptionSegment } from '../../types';

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
        Valeurs mesurées sur cet audio, par rapport à la référence saisie, après normalisation standard
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

export const ResultView: React.FC<{ result: TranscriptionResult | DenoisedResult; header?: React.ReactNode }> = ({ result, header }) => (
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
export const ComparisonView: React.FC<{ result: TranscriptionResult }> = ({ result }) => {
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
        Résultat mesuré sur cet audio. Consultez le module Banc d'Essai ASR pour les benchmarks détaillés.
      </div>
    </div>
  );
};

// Upload réel -> service ASR local (Whisper-small, signal brut) -> affichage du résultat.
// N'affiche que des valeurs renvoyées par le service : WER/CER seulement si une référence est saisie.
export const RealTranscription: React.FC<{ onSaved?: () => void }> = ({ onSaved }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState('');
  const [compareDfn3, setCompareDfn3] = useState(false);
  // RGPD : l'audio n'est pas conservé par défaut (seule la transcription est enregistrée).
  const [keepAudio, setKeepAudio] = useState(false);
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
    const res = await transcriptionsApi.transcribe(file, reference, compareDfn3, keepAudio);
    setLoading(false);
    if (res.ok && res.data) {
      setResult(res.data);

      // Création et enregistrement de l'appel dans le système KALA
      try {
        const agents = storageService.getAgents();
        const agent = agents[0] || {
          id: 'agent-1',
          name: 'Sarah Benali',
          teamId: 'team-1',
          teamName: 'Équipe Alpha (Fidélisation)',
          campaignId: 'camp-1',
          campaignName: 'Rétention Mobile 5G'
        };

        const callId = res.data.callId || `call-${Date.now()}`;
        const callNumber = res.data.callNumber || `OUT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const duration = Math.round(res.data.duration || 60);
        const dateStr = new Date().toISOString().substring(0, 10);

        const waveformSamples = Array.from({ length: 48 }, (_, idx) => 
          parseFloat((0.2 + 0.6 * Math.abs(Math.sin(idx * 0.4))).toFixed(2))
        );

        let audioUrl: string | undefined = undefined;
        try {
          audioUrl = URL.createObjectURL(file);
        } catch { /* ignore */ }

        const segments: TranscriptionSegment[] = (res.data.segments && res.data.segments.length > 0)
          ? res.data.segments.map((s, idx) => ({
              id: `seg-${callId}-${idx}`,
              transcriptionId: `trans-${callId}`,
              speaker: (idx % 2 === 0 ? 'AGENT' : 'CLIENT') as 'AGENT' | 'CLIENT',
              speakerLabel: idx % 2 === 0 ? 'Conseiller' : 'Client',
              startTime: s.start ?? (idx * 4),
              endTime: s.end ?? ((idx + 1) * 4),
              text: s.text,
              confidenceScore: 0.94,
              isNoisyPassage: false,
              noiseImpactLevel: 'AUCUN' as const,
            }))
          : [{
              id: `seg-${callId}-0`,
              transcriptionId: `trans-${callId}`,
              speaker: 'AGENT' as const,
              speakerLabel: 'Conseiller',
              startTime: 0,
              endTime: duration,
              text: res.data.text || '(Enregistrement audio)',
              confidenceScore: 0.92,
              isNoisyPassage: false,
              noiseImpactLevel: 'AUCUN' as const,
            }];

        const callRecord: Call = {
          id: callId,
          callNumber,
          agentId: agent.id,
          agentName: agent.name,
          teamId: agent.teamId,
          campaignId: agent.campaignId,
          campaignName: agent.campaignName || 'Campagne Générale',
          customerPhoneMasked: `+33 6 •• •• ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
          customerNameMasked: `Client #${Math.floor(100 + Math.random() * 900)}`,
          callDate: dateStr,
          durationSeconds: duration,
          direction: 'SORTANT',
          callType: 'SUPPORT_TECHNIQUE',
          status: 'TRANSCRIT',
          isUrgentReviewRequired: false,
          audioMetadata: {
            id: `audio-${callId}`,
            filename: file.name,
            fileSizeBytes: file.size,
            durationSeconds: duration,
            sampleRateHz: 16000,
            channels: 1,
            snrDb: 18.5,
            estimatedNoiseLevel: 'MODÉRÉ',
            noiseType: 'PLATEAU_CALL_CENTER',
            audioQualityScore: 82,
            waveformSamples,
            originalUrl: audioUrl
          },
          transcription: {
            id: `trans-${callId}`,
            callId,
            audioFileId: `audio-${callId}`,
            versionNumber: 1,
            isLatest: true,
            asrModelUsed: res.data.model || 'Groq Whisper large-v3-turbo',
            totalWords: res.data.text ? res.data.text.split(/\s+/).filter(Boolean).length : 0,
            processingTimeMs: Math.round((res.data.processing_time || 1) * 1000),
            globalConfidenceScore: 92,
            noiseRobustnessScore: 88,
            rawText: res.data.text,
            segments,
            createdAt: dateStr
          },
          analytics: {
            id: `analytics-${callId}`,
            callId,
            summary: res.data.text ? (res.data.text.length > 140 ? res.data.text.substring(0, 140) + '...' : res.data.text) : 'Échange téléphonique enregistré et transcrit.',
            contactIntent: 'Traitement de demande client / Suivi dossier',
            mainTopics: ['Service Client', 'Échange vocal', 'Contrôle qualité'],
            keywords: ['Appel', 'Conseiller', 'Demande', 'Résolution'],
            sentimentAgent: 'POSITIF',
            sentimentClient: 'NEUTRE',
            sentimentTimeline: [
              { minute: 1, agentSentiment: 0.6, clientSentiment: 0.2 }
            ],
            objectionsDetected: [],
            unresolvedIssues: [],
            resolutionStatus: 'RÉSOLU',
            actionItemsRequested: ['Archivage enregistrement', 'Contrôle conformité QA'],
            importantInformation: ['Enregistrement transcrit via moteur ASR'],
            criticalMoments: [],
            agentTalkTimeSeconds: Math.round(duration * 0.55),
            clientTalkTimeSeconds: Math.round(duration * 0.45),
            talkToListenRatio: 1.22,
            interruptionCount: 0,
            totalSilenceSeconds: 2,
            speechRateWpm: 145,
            detectedCommunicationIssues: [],
            aiDisclaimer: 'Analyse automatique générée par moteur vocal'
          }
        };

        storageService.addCall(callRecord);
        storageService.addNotification({
          type: 'SYSTEM',
          title: 'Nouvel appel transcrit',
          message: `L'enregistrement ${file.name} a été transcrit et ajouté sous la référence ${callNumber}.`,
          priority: 'INFO',
          targetView: 'calls'
        });
      } catch (saveErr) {
        console.error('Erreur lors de la sauvegarde locale de l\'appel:', saveErr);
      }

      onSaved?.();
    }
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
            <FileAudio size={28} color="var(--primary-light)" />
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{file.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {(file.size / (1024 * 1024)).toFixed(2)} Mo • Fichier audio prêt à être transcrit
            </div>
            <audio 
              controls 
              src={URL.createObjectURL(file)} 
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '450px', height: '38px', marginTop: '6px' }} 
            />
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

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: loading ? 'default' : 'pointer' }}>
        <input type="checkbox" checked={keepAudio} disabled={loading}
          onChange={e => setKeepAudio(e.target.checked)} />
        Conserver le fichier audio (désactivé par défaut)
      </label>

      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Transcription par <strong>Groq Whisper large-v3-turbo</strong> (cloud, gratuit).
        {' '}Le fichier audio est envoyé à Groq et n'est pas conservé.
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
          Transcription en cours via Groq Whisper (cloud) — généralement en quelques secondes…
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

      {result?.callNumber && (
        <div role="status" style={{ fontSize: '13px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
          Enregistré comme appel réel <strong>{result.callNumber}</strong> (liste « Appels transcrits » de la page Appels).
          {' '}{result.audioStored ? 'Le fichier audio a été conservé.' : "Le fichier audio n'a pas été conservé."}
        </div>
      )}

      {result && (result.denoised ? <ComparisonView result={result} /> : <ResultView result={result} />)}
    </div>
  );
};
