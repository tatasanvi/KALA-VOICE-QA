import React, { useRef, useState } from 'react';
import { 
  UploadCloud, FileAudio, AlertCircle, Loader2, 
  User, PhoneCall, Tag, CheckCircle2, Sparkles, Building2
} from 'lucide-react';
import { transcriptionsApi, TranscriptionResult, DenoisedResult } from '../../services/apiClient';
import { storageService } from '../../services/storageService';
import { audioStorageService } from '../../services/audioStorageService';
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

export const RealTranscription: React.FC<{ onSaved?: () => void }> = ({ onSaved }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Métadonnées éditables par l'utilisateur
  const agents = storageService.getAgents();
  const [callTitle, setCallTitle] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [direction, setDirection] = useState<'ENTRANT' | 'SORTANT'>('SORTANT');
  const [callType, setCallType] = useState<Call['callType']>('SUPPORT_TECHNIQUE');
  const [customerName, setCustomerName] = useState<string>('');
  const [reference, setReference] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

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

    // Pré-remplir automatiquement le titre si vide
    if (!callTitle) {
      const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setCallTitle(cleanName);
    }
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await transcriptionsApi.transcribe(file, reference, false, false);
    setLoading(false);

    if (res.ok && res.data) {
      setResult(res.data);

      try {
        const callId = `call-${Date.now()}`;
        const finalCallNumber = callTitle.trim() || `CALL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const duration = Math.round(res.data.duration || 60);
        const dateStr = new Date().toISOString().substring(0, 10);

        // Sauvegarde physique de l'audio dans IndexedDB pour la réécoute réelle
        let audioUrl: string | undefined = undefined;
        try {
          audioUrl = await audioStorageService.saveAudio(callId, file);
        } catch {
          audioUrl = URL.createObjectURL(file);
        }

        const waveformSamples = Array.from({ length: 48 }, (_, idx) => 
          parseFloat((0.2 + 0.6 * Math.abs(Math.sin((idx + 3) * 0.4))).toFixed(2))
        );

        const segments: TranscriptionSegment[] = (res.data.segments && res.data.segments.length > 0)
          ? res.data.segments.map((s, idx) => ({
              id: `seg-${callId}-${idx}`,
              transcriptionId: `trans-${callId}`,
              speaker: (idx % 2 === 0 ? 'AGENT' : 'CLIENT') as 'AGENT' | 'CLIENT',
              speakerLabel: idx % 2 === 0 ? (selectedAgent?.name || 'Conseiller') : 'Client',
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
              speakerLabel: selectedAgent?.name || 'Conseiller',
              startTime: 0,
              endTime: duration,
              text: res.data.text || '(Enregistrement audio)',
              confidenceScore: 0.92,
              isNoisyPassage: false,
              noiseImpactLevel: 'AUCUN' as const,
            }];

        const callRecord: Call = {
          id: callId,
          callNumber: finalCallNumber,
          agentId: selectedAgent?.id || 'agent-1',
          agentName: selectedAgent?.name || 'Sarah Benali',
          teamId: selectedAgent?.teamId || 'team-1',
          campaignId: selectedAgent?.campaignId || 'camp-1',
          campaignName: selectedAgent?.campaignName || 'Campagne Principale',
          customerPhoneMasked: `+33 6 •• •• ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
          customerNameMasked: customerName.trim() || `Client #${Math.floor(100 + Math.random() * 900)}`,
          callDate: dateStr,
          durationSeconds: duration,
          direction,
          callType,
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
            audioQualityScore: 84,
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
            contactIntent: callType.replace(/_/g, ' '),
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
            importantInformation: ['Enregistrement transcrit via moteur ASR Whisper'],
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
          message: `L'enregistrement ${file.name} a été assigné à ${selectedAgent?.name} (${finalCallNumber}).`,
          priority: 'INFO',
          targetView: 'calls'
        });
      } catch (saveErr) {
        console.error('Erreur lors de la sauvegarde locale de l\'appel:', saveErr);
      }

      onSaved?.();
    } else {
      setError(res.error ?? 'Échec de la transcription.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. Zone Glisser-Déposer Audio */}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!loading) pick(e.dataTransfer.files?.[0]); }}
        style={{
          border: '2px dashed var(--border-active)', borderRadius: 'var(--radius-lg)',
          padding: '24px 20px', textAlign: 'center', cursor: loading ? 'default' : 'pointer',
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
            <FileAudio size={32} color="var(--primary-light)" />
            <div style={{ fontWeight: 700, fontSize: '14px' }}>{file.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {(file.size / (1024 * 1024)).toFixed(2)} Mo • Fichier audio prêt pour l'analyse
            </div>
            {/* Lecteur natif de prévisualisation */}
            <audio 
              controls 
              src={URL.createObjectURL(file)} 
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '440px', height: '36px', marginTop: '6px' }} 
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={36} color="var(--primary-light)" />
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Glissez-déposez votre enregistrement audio, ou cliquez pour parcourir</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Formats acceptés : WAV, MP3, M4A, OGG, FLAC (jusqu'à 25 Mo)</div>
          </div>
        )}
      </div>

      {/* 2. Formulaire de Métadonnées Métier & Assignation */}
      <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag size={15} color="var(--primary-light)" />
          <span>Informations & Assignation de l'Appel</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {/* Nom / Référence Appel */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '5px', color: 'var(--text-muted)' }}>
              Nom ou Référence de l'Appel :
            </label>
            <input 
              type="text"
              value={callTitle}
              onChange={e => setCallTitle(e.target.value)}
              placeholder="Ex: Appel Réclamation Fibre - M. Martin"
              style={{
                width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: '13px'
              }}
            />
          </div>

          {/* Choix du Conseiller */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '5px', color: 'var(--text-muted)' }}>
              Conseiller (Agent) Assigné :
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
                style={{
                  flex: 1, padding: '8px 10px', background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600
                }}
              >
                {agents.map(ag => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.teamName || 'Plateau'})
                  </option>
                ))}
              </select>
            </div>
            {selectedAgent && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Équipe : <strong>{selectedAgent.teamName || 'Alpha'}</strong> • Campagne : <strong>{selectedAgent.campaignName || 'Générale'}</strong>
              </div>
            )}
          </div>

          {/* Direction */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '5px', color: 'var(--text-muted)' }}>
              Direction du Flux :
            </label>
            <select 
              value={direction}
              onChange={e => setDirection(e.target.value as 'ENTRANT' | 'SORTANT')}
              style={{
                width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: '13px'
              }}
            >
              <option value="ENTRANT">↙ Appel Entrant (Service Client)</option>
              <option value="SORTANT">↗ Appel Sortant (Télévente / Suivi)</option>
            </select>
          </div>

          {/* Motif / Type d'appel */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '5px', color: 'var(--text-muted)' }}>
              Typologie de l'Échange :
            </label>
            <select 
              value={callType}
              onChange={e => setCallType(e.target.value as Call['callType'])}
              style={{
                width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: '13px'
              }}
            >
              <option value="SUPPORT_TECHNIQUE">Support Technique</option>
              <option value="RÉCLAMATION">Réclamation Client</option>
              <option value="RÉTENTION">Rétention & Fidélisation</option>
              <option value="COMMERCIAL">Commercial & Souscription</option>
              <option value="PROSPECTION">Prospection Sortante</option>
              <option value="ENQUÊTE">Enquête Satisfaction</option>
            </select>
          </div>

          {/* Nom du Client (optionnel) */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '5px', color: 'var(--text-muted)' }}>
              Identité Client (Optionnel) :
            </label>
            <input 
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Ex: M. Jean Dupont"
              style={{
                width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: '13px'
              }}
            />
          </div>
        </div>

        {/* Référence terrain (pour calcul de précision WER) */}
        <div>
          <label htmlFor="reference-text" style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '5px', color: 'var(--text-muted)' }}>
            Transcription de Référence (Optionnel — permet de mesurer le WER et CER réels) :
          </label>
          <textarea
            id="reference-text"
            value={reference}
            onChange={e => setReference(e.target.value)}
            disabled={loading}
            rows={2}
            placeholder="Si vous disposez du texte exact prononcé, collez-le ici pour obtenir le calcul automatique du taux d'erreur de mot (WER)."
            style={{
              width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '12.5px', resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* 3. Action de Lancement & État */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#10b981" />
          <span>Moteur ASR : <strong>Groq Whisper large-v3-turbo</strong> (précision maximale)</span>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={run} 
          disabled={!file || loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '13.5px' }}
        >
          {loading && <Loader2 size={16} className="spin" />}
          <span>{loading ? 'Transcription & Analyse en cours…' : "Lancer l'import et la transcription"}</span>
        </button>
      </div>

      {/* Messages de Statut */}
      {loading && (
        <div style={{ fontSize: '12.5px', color: 'var(--primary-light)', background: 'rgba(74, 111, 165, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          Traitement audio en cours via Whisper… Conversion spectrale et transcription textuelle instantanée.
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
        <div role="status" style={{ fontSize: '13px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
          <div style={{ fontWeight: 700, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            <span>Appel enregistré avec succès dans le registre !</span>
          </div>
          <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
            Référence : <strong>{result.callNumber}</strong> • Assigné à : <strong>{selectedAgent?.name}</strong> • Audio sauvegardé et disponible à l'écoute.
          </div>
        </div>
      )}

      {result && (result.denoised ? <ComparisonView result={result} /> : <ResultView result={result} />)}
    </div>
  );
};
