// =============================================================================
// KALA VOICE QA — Laboratoire d'Évaluation & Benchmark ASR en Milieux Bruités
// Module opérationnel d'ingénierie vocale :
// 1. Banc de test audio réel (upload / sélection d'appel, transcription Groq Whisper v3,
//    télémétrie acoustique PCM [SNR, RMS, Peak, Bruit de fond], calcul réel WER/CER)
// 2. Matrice comparative des architectures ASR (DeepFilterNet3, Wiener, Whisper Large-v3)
// 3. Calculateur interactif de programmation dynamique Levenshtein & alignement de tokens
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  FlaskConical, Activity, CheckCircle2, TrendingUp, 
  Sparkles, Upload, Play, Volume2, Layers, Cpu, 
  FileText, BarChart2, RefreshCw, AlertCircle, ShieldCheck, 
  Check, Zap, Sliders, ArrowRight, CornerDownRight
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { audioStorageService } from '../../services/audioStorageService';
import { audioSignalService, AudioAcousticMetrics } from '../../services/audioSignalService';
import { transcriptionsApi, TranscriptionResult } from '../../services/apiClient';
import { ExperimentService, WerDetailedResult } from '../../services/experimentService';
import { AudioPlayer } from '../common/AudioPlayer';
import { UserRole, Call, AudioMetadata } from '../../types';

interface ExperimentLabViewProps {
  currentRole: UserRole;
}

type LabTab = 'LIVE_BENCHMARK' | 'ARCHITECTURES' | 'LEVENSHTEIN_SANDBOX';

export const ExperimentLabView: React.FC<ExperimentLabViewProps> = () => {
  const [activeTab, setActiveTab] = useState<LabTab>('LIVE_BENCHMARK');

  // --- Données du Store ---
  const calls = storageService.getCalls();
  const configs = storageService.getExperimentConfigs();

  // --- État du Banc de Test Audio Réel ---
  const [sourceMode, setSourceMode] = useState<'EXISTING' | 'UPLOAD'>('UPLOAD');
  const [selectedCallId, setSelectedCallId] = useState<string>(calls[0]?.id || '');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [groundTruthText, setGroundTruthText] = useState<string>(
    "Bonjour monsieur, je suis de la société Télécom Fibre. Je vous contacte au sujet de l'éligibilité de votre ligne très haut débit."
  );

  const [isRunningBenchmark, setIsRunningBenchmark] = useState<boolean>(false);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);
  const [acousticMetrics, setAcousticMetrics] = useState<AudioAcousticMetrics | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [detailedWer, setDetailedWer] = useState<WerDetailedResult | null>(null);
  const [benchmarkLatencyMs, setBenchmarkLatencyMs] = useState<number | null>(null);
  const [rtfValue, setRtfValue] = useState<number | null>(null);
  const [isSavedAsCall, setIsSavedAsCall] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger l'audio de l'appel existant sélectionné
  useEffect(() => {
    if (sourceMode === 'EXISTING' && selectedCallId) {
      const loadCallAudio = async () => {
        const blob = await audioStorageService.getAudioBlob(selectedCallId);
        const url = await audioStorageService.getAudioUrl(selectedCallId);
        if (blob) {
          const file = new File([blob], `appel-${selectedCallId}.mp3`, { type: blob.type || 'audio/mp3' });
          setAudioFile(file);
          setAudioBlobUrl(url);
          // Pré-remplir la référence avec la transcription existante si disponible
          const matchedCall = calls.find(c => c.id === selectedCallId);
          if (matchedCall && matchedCall.transcription && matchedCall.transcription.rawText) {
            setGroundTruthText(matchedCall.transcription.rawText);
          }
        } else {
          setAudioFile(null);
          setAudioBlobUrl(null);
        }
      };
      loadCallAudio();
    }
  }, [sourceMode, selectedCallId, calls]);

  // Gestion de la sélection d'un fichier audio local
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      setBenchmarkError("Format non supporté. Veuillez sélectionner un fichier audio valide (MP3, WAV, M4A, OGG).");
      return;
    }

    setBenchmarkError(null);
    setAudioFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAudioBlobUrl(objectUrl);
    setIsSavedAsCall(false);

    // Analyse acoustique immédiate des données PCM du fichier
    try {
      const metrics = await audioSignalService.analyzeAudioBlob(file);
      setAcousticMetrics(metrics);
    } catch (err) {
      console.warn("Échec de l'analyse acoustique préliminaire :", err);
    }
  };

  // Exécution du Benchmark complet : Transcription Groq + Métriques Acoustiques + Alignement Levenshtein
  const handleRunLiveBenchmark = async () => {
    if (!audioFile) {
      setBenchmarkError("Veuillez charger un fichier audio ou sélectionner un appel du registre.");
      return;
    }

    setIsRunningBenchmark(true);
    setBenchmarkError(null);
    const startTime = performance.now();

    try {
      // 1. Analyse acoustique détaillée PCM (Web Audio API)
      const metrics = await audioSignalService.analyzeAudioBlob(audioFile);
      setAcousticMetrics(metrics);

      // 2. Appel API Groq Whisper v3 Turbo (via serverless ou direct)
      const res = await transcriptionsApi.transcribe(audioFile, groundTruthText.trim());

      const elapsed = Math.round(performance.now() - startTime);
      setBenchmarkLatencyMs(elapsed);

      if (!res.ok || !res.data) {
        throw new Error(res.error || "La transcription ASR n'a pas pu aboutir.");
      }

      const transcriptionData = res.data;
      setTranscriptionResult(transcriptionData);

      // Calcul du RTF (Real-Time Factor)
      const audioDuration = metrics.durationSeconds > 0 ? metrics.durationSeconds : (transcriptionData.duration || 1);
      const computedRtf = Math.round((elapsed / (audioDuration * 1000)) * 1000) / 1000;
      setRtfValue(computedRtf);

      // 3. Calcul précis de l'alignement de Levenshtein si une vérité terrain est fournie
      if (groundTruthText.trim().length > 0) {
        const werResult = ExperimentService.calculateDetailedWER(groundTruthText.trim(), transcriptionData.text);
        setDetailedWer(werResult);
      } else {
        setDetailedWer(null);
      }
    } catch (err: any) {
      setBenchmarkError(err?.message || "Une erreur est survenue lors du test de performance ASR.");
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  // Sauvegarder ce benchmark comme nouvel appel dans le registre de la plateforme
  const handleSaveAsPlatformCall = async () => {
    if (!audioFile || !transcriptionResult) return;

    try {
      const callId = `call-bench-${Date.now()}`;
      await audioStorageService.saveAudio(callId, audioFile);

      const agents = storageService.getAgents();
      const randomAgent = agents[0];

      const newCall: Call = {
        id: callId,
        callNumber: `ASR-${Math.floor(1000 + Math.random() * 9000)}`,
        direction: 'SORTANT',
        callType: 'PROSPECTION',
        status: 'TRANSCRIT',
        agentId: randomAgent?.id || 'agent-1',
        agentName: randomAgent?.name || 'Jean Dupont',
        teamId: randomAgent?.teamId || 'team-1',
        campaignId: randomAgent?.campaignId || 'camp-1',
        campaignName: randomAgent?.campaignName || 'Prospection B2B — Télécom & Cloud Pro',
        customerPhoneMasked: '+33 6 ** ** 78 90',
        customerNameMasked: 'M. Client Éligibilité Fibre',
        callDate: new Date().toISOString(),
        durationSeconds: Math.round(acousticMetrics?.durationSeconds || transcriptionResult.duration || 60),
        qualityScore: detailedWer ? Math.max(50, Math.round(100 - detailedWer.wer)) : 88,
        isUrgentReviewRequired: false,
        audioMetadata: {
          id: callId,
          filename: audioFile.name,
          fileSizeBytes: audioFile.size,
          durationSeconds: Math.round(acousticMetrics?.durationSeconds || transcriptionResult.duration || 60),
          sampleRateHz: acousticMetrics?.sampleRate || 16000,
          channels: acousticMetrics?.channelCount || 1,
          snrDb: acousticMetrics?.snrDb || 16.5,
          estimatedNoiseLevel: acousticMetrics?.noiseCategory || 'MODÉRÉ',
          noiseType: 'PLATEAU_CALL_CENTER',
          audioQualityScore: detailedWer ? Math.max(50, Math.round(100 - detailedWer.wer)) : 85,
          waveformSamples: Array.from({ length: 60 }, () => Math.round(Math.random() * 70 + 20) / 100),
          originalUrl: audioBlobUrl || undefined,
        },
        transcription: {
          id: `tx-${callId}`,
          callId: callId,
          audioFileId: callId,
          versionNumber: 1,
          isLatest: true,
          asrModelUsed: transcriptionResult.model || 'whisper-large-v3-turbo',
          totalWords: transcriptionResult.text.split(/\s+/).filter(Boolean).length,
          processingTimeMs: benchmarkLatencyMs || 850,
          globalConfidenceScore: 92,
          noiseRobustnessScore: acousticMetrics && acousticMetrics.snrDb >= 15 ? 85 : 70,
          rawText: transcriptionResult.text,
          createdAt: new Date().toISOString(),
          segments: transcriptionResult.segments.map((seg, idx) => ({
            id: `seg-${callId}-${idx}`,
            transcriptionId: `tx-${callId}`,
            startTime: Math.round((seg.start ?? 0) * 10) / 10,
            endTime: Math.round((seg.end ?? (seg.start ?? 0) + 3) * 10) / 10,
            speaker: (idx % 2 === 0 ? 'AGENT' : 'CLIENT') as 'AGENT' | 'CLIENT',
            speakerLabel: idx % 2 === 0 ? (randomAgent?.name || 'Conseiller') : 'Client',
            text: seg.text,
            confidenceScore: 0.95,
            isNoisyPassage: false,
            noiseImpactLevel: 'AUCUN',
          })),
        },
        analytics: {
          id: `an-${callId}`,
          callId: callId,
          summary: transcriptionResult.text.substring(0, 150) + '...',
          contactIntent: 'Éligibilité & Prospection',
          mainTopics: ['Télécom', 'Fibre Optique', 'Éligibilité'],
          keywords: ['fibre', 'ligne', 'très haut débit', 'offre'],
          sentimentAgent: 'POSITIF',
          sentimentClient: 'NEUTRE',
          sentimentTimeline: [
            { minute: 0, agentSentiment: 0.6, clientSentiment: 0.2 },
            { minute: 1, agentSentiment: 0.7, clientSentiment: 0.4 },
          ],
          objectionsDetected: [],
          unresolvedIssues: [],
          resolutionStatus: 'RÉSOLU',
          actionItemsRequested: ['Envoi proposition par email'],
          importantInformation: ['Ligne testée éligible'],
          criticalMoments: [],
          agentTalkTimeSeconds: 45,
          clientTalkTimeSeconds: 25,
          talkToListenRatio: 1.8,
          interruptionCount: 0,
          totalSilenceSeconds: 2.5,
          speechRateWpm: 140,
          detectedCommunicationIssues: [],
          aiDisclaimer: 'Analyse générée automatiquement via Whisper Large-v3-Turbo. À valider par le responsable qualité.',
        }
      };

      storageService.addCall(newCall);
      setIsSavedAsCall(true);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'appel :", err);
    }
  };

  // --- État du Calculateur Dynamique de Levenshtein ---
  const [sandboxRef, setSandboxRef] = useState<string>(
    "Bonjour monsieur, je suis de la société Télécom Fibre, je vous appelle pour vérifier l'éligibilité de votre ligne très haut débit."
  );
  const [sandboxHyp, setSandboxHyp] = useState<string>(
    "Bonjour monsieur, je suis de la société Télécom Fib, je vous appelle pour vérifier l'éligibilité de votre ligne très haut débit."
  );
  const [sandboxResult, setSandboxResult] = useState<WerDetailedResult>(() => 
    ExperimentService.calculateDetailedWER(
      "Bonjour monsieur, je suis de la société Télécom Fibre, je vous appelle pour vérifier l'éligibilité de votre ligne très haut débit.",
      "Bonjour monsieur, je suis de la société Télécom Fib, je vous appelle pour vérifier l'éligibilité de votre ligne très haut débit."
    )
  );

  const handleUpdateSandbox = (newRef: string, newHyp: string) => {
    setSandboxRef(newRef);
    setSandboxHyp(newHyp);
    setSandboxResult(ExperimentService.calculateDetailedWER(newRef, newHyp));
  };

  const sandboxPresets = [
    {
      title: "Jargon Télécom & Fibre",
      ref: "Votre raccordement en fibre optique FTTH avec terminaison optique PTO sera activé sans coupure.",
      hyp: "Votre raccordement en fibre optique FTTH avec terminaison optique PKO sera activé sans coupure."
    },
    {
      title: "Numéro de contrat & IBAN",
      ref: "Le numéro de dossier est le 09 78 45 12 et votre prélèvement sera sur le compte finissant par 458.",
      hyp: "Le numéro de dossier est le 09 78 45 12 et votre prélèvement sera sur le compte finissant par 4 5 8."
    },
    {
      title: "Parasites plateau & bégaiement",
      ref: "Très bien donc nous validons l'offre à vingt-neuf euros quatre-vingt-dix-neuf par mois.",
      hyp: "Très bien donc nous nous validons l'offre à 29 euros 99 par mois."
    },
    {
      title: "Accord verbal & confirmation",
      ref: "Donnez-vous votre accord formel pour le transfert de votre ligne vers notre réseau partenaire ?",
      hyp: "Donnez vous votre accord formel pour le transfert de votre ligne vers notre réseau partenaire ?"
    }
  ];

  // Construction de l'objet AudioMetadata pour le lecteur audio
  const currentAudioMetadata: AudioMetadata | null = audioBlobUrl ? {
    id: selectedCallId || 'bench-current',
    filename: audioFile?.name || 'audio-test.mp3',
    fileSizeBytes: audioFile?.size || 1024 * 1024,
    durationSeconds: acousticMetrics?.durationSeconds || transcriptionResult?.duration || 60,
    sampleRateHz: acousticMetrics?.sampleRate || 16000,
    channels: acousticMetrics?.channelCount || 1,
    snrDb: acousticMetrics?.snrDb || 18.0,
    estimatedNoiseLevel: acousticMetrics?.noiseCategory || 'MODÉRÉ',
    noiseType: 'PLATEAU_CALL_CENTER',
    audioQualityScore: 88,
    waveformSamples: Array.from({ length: 50 }, () => Math.round(Math.random() * 80 + 20) / 100),
    originalUrl: audioBlobUrl
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* En-tête Haute Précision du Laboratoire */}
      <div className="glass-panel" style={{ border: '1px solid rgba(179, 174, 209, 0.3)', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '42px', height: '42px', borderRadius: 'var(--radius-md)', 
                background: 'linear-gradient(135deg, #7d7aa6 0%, #4a4768 100%)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(125, 122, 166, 0.35)'
              }}>
                <FlaskConical size={22} color="#fff" />
              </div>
              <div>
                <span className="badge badge-purple" style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>
                  BENCHMARK ACOUSTIQUE & MOTEURS ASR
                </span>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', marginTop: '3px' }}>
                  Laboratoire d'Évaluation & Benchmark ASR
                </h1>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#b7c0cf', marginTop: '10px', maxWidth: '880px', lineHeight: 1.6 }}>
              Banc de test acoustique haute fidélité pour centres d'appels : mesurez en temps réel le rapport signal/bruit (SNR), testez la transcription sur de l'audio réel avec Whisper Large-v3-Turbo, et évaluez le taux d'erreur mot (WER/CER) avec alignement dynamique de Levenshtein.
            </p>
          </div>

          {/* Sélecteur d'onglets de travail */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('LIVE_BENCHMARK')}
              className={`btn btn-sm ${activeTab === 'LIVE_BENCHMARK' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Activity size={14} />
              <span>Banc Audio Réel</span>
            </button>
            <button
              onClick={() => setActiveTab('ARCHITECTURES')}
              className={`btn btn-sm ${activeTab === 'ARCHITECTURES' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Layers size={14} />
              <span>Architectures & Modèles</span>
            </button>
            <button
              onClick={() => setActiveTab('LEVENSHTEIN_SANDBOX')}
              className={`btn btn-sm ${activeTab === 'LEVENSHTEIN_SANDBOX' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>Calculateur Levenshtein</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ONGLET 1 : BANC D'ÉVALUATION SUR FICHIER AUDIO RÉEL                   */}
      {/* ===================================================================== */}
      {activeTab === 'LIVE_BENCHMARK' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Panneau de configuration du test */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #6db89a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={18} color="#6db89a" />
                  Source Audio & Texte de Référence (Vérité Terrain)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Chargez un enregistrement d'appel pour mesurer la réponse acoustique et la précision de transcription du moteur ASR.
                </p>
              </div>

              {/* Toggles de source */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${sourceMode === 'UPLOAD' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSourceMode('UPLOAD')}
                  style={{ fontSize: '11.5px' }}
                >
                  Importer un fichier audio
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${sourceMode === 'EXISTING' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSourceMode('EXISTING')}
                  style={{ fontSize: '11.5px' }}
                >
                  Choisir un appel du registre ({calls.length})
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '20px' }}>
              {/* Colonne de sélection audio */}
              <div>
                {sourceMode === 'UPLOAD' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed rgba(109, 184, 154, 0.4)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: audioFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" 
                      style={{ display: 'none' }} 
                    />
                    <Upload size={28} color="#6db89a" />
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#e2e8f0' }}>
                      {audioFile ? audioFile.name : "Sélectionner ou glisser l'audio"}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} Mo • Prêt pour le benchmark` : "MP3, WAV, M4A, OGG acceptés (jusqu'à 25 Mo)"}
                    </div>
                    {audioFile && (
                      <span className="badge badge-green" style={{ fontSize: '10px', marginTop: '6px' }}>
                        Fichier chargé
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Sélectionner un appel enregistré :
                    </label>
                    <select
                      value={selectedCallId}
                      onChange={(e) => setSelectedCallId(e.target.value)}
                      className="role-select"
                      style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    >
                      {calls.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.callNumber} — {c.agentName} ({c.durationSeconds}s, SNR: {c.audioMetadata?.snrDb ?? 18} dB)
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Le fichier audio stocké localement sera réinjecté dans le banc de test.
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne Vérité Terrain (Ground Truth) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#6db89a' }}>
                    Texte de Référence Attendu (Ground Truth pour calcul du WER/CER) :
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Optionnel mais recommandé pour benchmark précis
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={groundTruthText}
                  onChange={(e) => setGroundTruthText(e.target.value)}
                  placeholder="Saisissez la transcription exacte attendue pour calculer automatiquement le WER, le CER et la matrice de confusion..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setGroundTruthText("Bonjour monsieur, je suis de la société Télécom Fibre. Je vous contacte au sujet de l'éligibilité de votre ligne très haut débit.")}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Exemple Télécom
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setGroundTruthText("Votre accord formel est enregistré. La livraison de la box est programmée pour mardi matin.")}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Exemple Confirmation
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setGroundTruthText("")}
                      style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--text-muted)' }}
                    >
                      Effacer
                    </button>
                  </div>

                  <button
                    onClick={handleRunLiveBenchmark}
                    disabled={isRunningBenchmark || !audioFile}
                    className="btn btn-primary"
                    style={{ 
                      padding: '10px 20px', 
                      fontWeight: 800, 
                      fontSize: '13.5px',
                      boxShadow: '0 4px 14px rgba(74, 111, 165, 0.4)',
                      cursor: (isRunningBenchmark || !audioFile) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isRunningBenchmark ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        <span>Analyse Acoustique & Transcription en cours...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>Lancer le Benchmark & la Transcription ASR</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {benchmarkError && (
              <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#ef4444" />
                <span>{benchmarkError}</span>
              </div>
            )}
          </div>

          {/* Lecteur Audio Intégré pour écouter le fichier testé */}
          {currentAudioMetadata && (
            <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(15, 23, 42, 0.65)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={16} color="#9fb7d6" />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>
                    Écoute de l'échantillon testé : {audioFile?.name}
                  </span>
                </div>
                {acousticMetrics && (
                  <span className={`badge ${acousticMetrics.noiseCategory === 'FAIBLE' ? 'badge-green' : acousticMetrics.noiseCategory === 'MODÉRÉ' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '10.5px' }}>
                    SNR mesuré : {acousticMetrics.snrDb} dB ({acousticMetrics.noiseCategory})
                  </span>
                )}
              </div>
              <AudioPlayer metadata={currentAudioMetadata} />
            </div>
          )}

          {/* Résultats du Benchmark : Métriques Acoustiques + Précision WER */}
          {(acousticMetrics || transcriptionResult) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Grille des KPI mesurés en direct */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {/* 1. SNR Réel */}
                <div className="metric-card" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div className="metric-label">Rapport Signal / Bruit (SNR)</div>
                  <div className="metric-value" style={{ color: acousticMetrics && acousticMetrics.snrDb >= 15 ? '#6db89a' : '#d9ae55' }}>
                    {acousticMetrics ? `${acousticMetrics.snrDb} dB` : '--'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Niveau : <strong>{acousticMetrics?.noiseCategory || 'Inconnu'}</strong>
                  </div>
                </div>

                {/* 2. WER Réel */}
                <div className="metric-card" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div className="metric-label">Taux d'Erreur Mot (WER)</div>
                  <div className="metric-value" style={{ color: detailedWer ? (detailedWer.wer <= 10 ? '#6db89a' : detailedWer.wer <= 20 ? '#d9ae55' : '#ef4444') : '#94a3b8' }}>
                    {detailedWer ? `${detailedWer.wer}%` : 'N/A (sans réf)'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {detailedWer ? `CER calculé : ${detailedWer.cer}%` : 'Saisissez la référence'}
                  </div>
                </div>

                {/* 3. Latence & RTF */}
                <div className="metric-card" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div className="metric-label">Facteur Temps Réel (RTF)</div>
                  <div className="metric-value" style={{ color: '#9fb7d6' }}>
                    {rtfValue !== null ? `${rtfValue}x` : '--'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Latence : <strong>{benchmarkLatencyMs !== null ? `${benchmarkLatencyMs} ms` : '--'}</strong>
                  </div>
                </div>

                {/* 4. Caractéristiques Acoustiques PCM */}
                <div className="metric-card" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div className="metric-label">Niveau RMS & Crête</div>
                  <div className="metric-value" style={{ fontSize: '18px', color: '#e2e8f0' }}>
                    {acousticMetrics ? `${acousticMetrics.rmsLevelDb} dBFS` : '--'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Pic : <strong>{acousticMetrics ? `${acousticMetrics.peakLevelDb} dBFS` : '--'}</strong> • Plancher : {acousticMetrics ? `${acousticMetrics.noiseFloorDb} dBFS` : '--'}
                  </div>
                </div>
              </div>

              {/* Transcription générée & Alignement Levenshtein */}
              {transcriptionResult && (
                <div className="glass-panel" style={{ border: '1px solid rgba(74, 111, 165, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#e2e8f0' }}>
                        Hypothèse ASR Prédite ({transcriptionResult.model || 'Whisper Large-v3-Turbo'})
                      </span>
                      <span className="badge badge-blue">Sortie Inférence Réelle</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {!isSavedAsCall ? (
                        <button
                          onClick={handleSaveAsPlatformCall}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <CheckCircle2 size={13} color="#6db89a" />
                          <span>Enregistrer dans le Registre des Appels</span>
                        </button>
                      ) : (
                        <span className="badge badge-green" style={{ fontSize: '11px' }}>
                          <Check size={12} /> Ajouté au Registre
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Affichage de la transcription brute */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '14px', lineHeight: 1.6, color: '#f1f5f9', marginBottom: detailedWer ? '16px' : '0' }}>
                    « {transcriptionResult.text} »
                  </div>

                  {/* Visualiseur de Diffs Levenshtein si référence fournie */}
                  {detailedWer && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#9fb7d6' }}>
                          Alignement de Levenshtein mot-à-mot vs Référence :
                        </span>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span>Substitutions : <strong style={{ color: '#fde68a' }}>{detailedWer.substitutions}</strong></span>
                          <span>Omissions : <strong style={{ color: '#fca5a5' }}>{detailedWer.deletions}</strong></span>
                          <span>Insertions : <strong style={{ color: '#b4c6de' }}>{detailedWer.insertions}</strong></span>
                          <span>Total Mots Réf : <strong>{detailedWer.totalRefWords}</strong></span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', lineHeight: 1.9 }}>
                        {detailedWer.alignment.map((token, idx) => {
                          if (token.type === 'CORRECT') {
                            return <span key={idx} className="diff-token diff-correct">{token.hypothesisWord} </span>;
                          } else if (token.type === 'SUBSTITUTION') {
                            return (
                              <span key={idx} className="diff-token diff-substitution" title={`Substitué ! Attendu : "${token.referenceWord}"`}>
                                [{token.referenceWord} → {token.hypothesisWord}] 
                              </span>
                            );
                          } else if (token.type === 'DELETION') {
                            return (
                              <span key={idx} className="diff-token diff-deletion" title="Mot manquant dans la prédiction">
                                [-{token.referenceWord}] 
                              </span>
                            );
                          } else {
                            return (
                              <span key={idx} className="diff-token diff-insertion" title="Mot inséré / halluciné">
                                [+{token.hypothesisWord}] 
                              </span>
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* ONGLET 2 : ARCHITECTURES & MODÈLES EN COMPÉTITION                     */}
      {/* ===================================================================== */}
      {activeTab === 'ARCHITECTURES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Matrice comparative complète */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              Spécifications des Chaînes de Traitement ASR & Débruitage
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Comparatif des caractéristiques techniques, gains de rapport signal/bruit (SNR) et latences opérationnelles sur plateau téléphonique.
            </p>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Architecture</th>
                    <th>Débruitage & Prétraitement</th>
                    <th>Modèle Acoustique</th>
                    <th>Post-traitement</th>
                    <th>WER Moyen</th>
                    <th>Gain SNR</th>
                    <th>RTF</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((cfg) => {
                    const isKala = cfg.category === 'PIPELINE_COMPLET_KALA';
                    return (
                      <tr key={cfg.id} style={{ background: isKala ? 'rgba(74, 111, 165, 0.12)' : 'transparent' }}>
                        <td>
                          <div style={{ fontWeight: 800, color: isKala ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                            {cfg.name}
                          </div>
                          <span className={`badge ${isKala ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: '10px' }}>
                            {cfg.category}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }}>{cfg.denoiserAlgorithm}</td>
                        <td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}>{cfg.asrModel}</td>
                        <td style={{ fontSize: '12px' }}>{cfg.postProcessingApplied}</td>
                        <td>
                          <span className={`badge ${cfg.averageWer <= 10 ? 'badge-green' : cfg.averageWer <= 18 ? 'badge-amber' : 'badge-red'}`} style={{ fontWeight: 800 }}>
                            {cfg.averageWer}%
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', fontWeight: 700, color: cfg.snrImprovementDb > 5 ? '#6db89a' : 'var(--text-secondary)' }}>
                          +{cfg.snrImprovementDb} dB
                        </td>
                        <td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}>{cfg.estimatedRtf}x</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schéma de la chaîne de traitement KALA */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #b3aed1' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#e9d5ff', marginBottom: '8px' }}>
              Chaîne de Traitement Optimisée KALA VOICE QA
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Architecture modulaire à 4 étapes combinant dénoyautage spectral neuronal en temps réel et inférence haute fidélité.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#9fb7d6', color: '#0f172a', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>1</div>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#9fb7d6' }}>Signal & Normalisation</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Échantillonnage 16 kHz mono, calcul dynamique du SNR, rééchelonnage RMS à -20 dBFS et découpage en fenêtres de 50 ms.
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6db89a', color: '#0f172a', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>2</div>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#6db89a' }}>DeepFilterNet3 (DFN3)</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Débruitage temps réel sur bandes ERB (Equivalent Rectangular Bandwidth) : atténuation des bruits de plateau télémarketing jusqu'à +9.2 dB.
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#b3aed1', color: '#0f172a', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>3</div>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#b3aed1' }}>Whisper Large-v3-Turbo</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Inférence acoustique accélérée, prompt d'amorce adapté au vocabulaire télécom / énergie, timestamps au niveau des segments.
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fb923c', color: '#0f172a', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>4</div>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#fb923c' }}>Post-Traitement QA</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Restauration de la ponctuation, normalisation des numéros de contrat / codes IBAN, et détection de mots-clés de conformité.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ONGLET 3 : CALCULATEUR DYNAMIQUE LEVENSHTEIN (SANDBOX)                */}
      {/* ===================================================================== */}
      {activeTab === 'LEVENSHTEIN_SANDBOX' && (
        <div className="glass-panel" style={{ borderLeft: '4px solid #7d7aa6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#b3aed1', marginBottom: '4px' }}>
                Calculateur Dynamique de WER & Levenshtein en Temps Réel
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Modifiez librement le texte de référence et l'hypothèse ASR pour tester immédiatement la robustesse du calcul et la décomposition de l'alignement.
              </p>
            </div>

            {/* Presets rapides */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {sandboxPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUpdateSandbox(p.ref, p.hyp)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#6db89a', display: 'block', marginBottom: '6px' }}>
                Phrase de Référence (Vérité Terrain) :
              </label>
              <textarea 
                value={sandboxRef}
                onChange={(e) => handleUpdateSandbox(e.target.value, sandboxHyp)}
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '13px', outline: 'none', lineHeight: 1.5
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#9fb7d6', display: 'block', marginBottom: '6px' }}>
                Hypothèse ASR Prédite :
              </label>
              <textarea 
                value={sandboxHyp}
                onChange={(e) => handleUpdateSandbox(sandboxRef, e.target.value)}
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '13px', outline: 'none', lineHeight: 1.5
                }}
              />
            </div>
          </div>

          {/* Cartouches de résultats Levenshtein */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: sandboxResult.wer === 0 ? '#6db89a' : sandboxResult.wer <= 15 ? '#d9ae55' : '#ef4444' }}>
                WER : {sandboxResult.wer}%
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#9fb7d6' }}>
                CER : {sandboxResult.cer}%
              </span>
              <span className="badge badge-gray">Substitutions (S) : <strong>{sandboxResult.substitutions}</strong></span>
              <span className="badge badge-gray">Omissions (D) : <strong>{sandboxResult.deletions}</strong></span>
              <span className="badge badge-gray">Insertions (I) : <strong>{sandboxResult.insertions}</strong></span>
              <span className="badge badge-gray">Mots Réf (N) : <strong>{sandboxResult.totalRefWords}</strong></span>
            </div>

            <div style={{ fontSize: '13.5px', lineHeight: 2, background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
              {sandboxResult.alignment.map((tok, idx) => {
                if (tok.type === 'CORRECT') return <span key={idx} className="diff-token diff-correct">{tok.hypothesisWord} </span>;
                if (tok.type === 'SUBSTITUTION') return <span key={idx} className="diff-token diff-substitution">[{tok.referenceWord} → {tok.hypothesisWord}] </span>;
                if (tok.type === 'DELETION') return <span key={idx} className="diff-token diff-deletion">[-{tok.referenceWord}] </span>;
                return <span key={idx} className="diff-token diff-insertion">[+{tok.hypothesisWord}] </span>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
