import React, { useState, useEffect } from 'react';
import { 
  Volume2, Clock, Activity, CheckCircle, AlertTriangle, 
  Edit3, Save, X, Sparkles, UploadCloud, FileAudio, RotateCcw
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { audioSignalService } from '../../services/audioSignalService';
import { AudioPlayer } from '../common/AudioPlayer';
import { RealTranscription } from '../common/RealTranscription';
import { Call, UserRole, TranscriptionSegment } from '../../types';

interface TranscriptionStudioViewProps {
  selectedCallId: string;
  onSelectCall: (callId: string) => void;
  currentRole: UserRole;
}

export const TranscriptionStudioView: React.FC<TranscriptionStudioViewProps> = ({ 
  selectedCallId, 
  onSelectCall 
}) => {
  const [calls, setCalls] = useState<Call[]>(() => storageService.getCalls());
  const currentCall = (calls.find(c => c.id === selectedCallId) || calls[0]) as Call | undefined;

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SEGMENTS' | 'COMPARE'>('SEGMENTS');

  useEffect(() => {
    const unsubStorage = storageService.subscribe(() => {
      setCalls([...storageService.getCalls()]);
    });
    return () => unsubStorage();
  }, []);

  useEffect(() => {
    const unsub = audioSignalService.onTimeUpdate((time) => {
      setCurrentTime(time);
    });
    return () => unsub();
  }, []);

  const handleImportSaved = () => {
    setShowImportModal(false);
    const updated = storageService.getCalls();
    if (updated.length > 0) {
      onSelectCall(updated[0].id);
    }
  };

  if (!currentCall) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '64px 32px', gap: '20px',
          border: '2px dashed rgba(74, 111, 165, 0.3)',
          background: 'rgba(74, 111, 165, 0.04)'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(74, 111, 165, 0.12)',
            border: '2px solid rgba(74, 111, 165, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileAudio size={32} color="var(--primary-light)" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0' }}>
              Aucun enregistrement audio
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6, margin: '0 auto' }}>
              Importez un fichier audio pour visualiser la transcription Whisper, éditer les segments horodatés et analyser le signal vocal.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowImportModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '10px 24px' }}
          >
            <UploadCloud size={16} />
            <span>Importer et transcrire un audio</span>
          </button>
        </div>

        {/* Modal d'import */}
        {showImportModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }} onClick={() => setShowImportModal(false)}>
            <div className="glass-panel" style={{ width: '760px', maxWidth: '96%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Importer un nouvel audio</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowImportModal(false)}>
                  <X size={14} />
                </button>
              </div>
              <RealTranscription onSaved={handleImportSaved} />
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleStartEdit = (segment: TranscriptionSegment) => {
    setEditingSegmentId(segment.id);
    setEditedText(segment.correctedText || segment.text);
  };

  const handleSaveEdit = (segmentId: string) => {
    storageService.updateCallTranscriptionSegment(currentCall.id, segmentId, editedText);
    setEditingSegmentId(null);
  };

  const handleCancelEdit = () => {
    setEditingSegmentId(null);
  };

  const handleSegmentClick = (startTime: number) => {
    audioSignalService.seek(startTime);
    audioSignalService.play(startTime, currentCall.audioMetadata.durationSeconds);
  };

  const trans = currentCall.transcription;
  const meta = currentCall.audioMetadata;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Barre de Sélection d'Appel & Import */}
      <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileAudio size={20} color="var(--primary-light)" />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Appel sélectionné :</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                value={currentCall.id}
                onChange={(e) => onSelectCall(e.target.value)}
                className="role-select"
                style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}
              >
                {calls.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.callNumber} — {c.agentName} ({c.audioMetadata.estimatedNoiseLevel} bruit)
                  </option>
                ))}
              </select>
              <span className="badge badge-purple" style={{ fontSize: '11px' }}>
                Version : v{trans.versionNumber} {trans.versionNumber > 1 ? '(Corrigée)' : '(Originale)'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'SEGMENTS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('SEGMENTS')}
            >
              Vue Synchronisée Diarisée
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'COMPARE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('COMPARE')}
              style={{ marginLeft: '4px' }}
            >
              Comparatif Original vs Corrigé
            </button>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowImportModal(true)}
          >
            <UploadCloud size={14} />
            <span>Importer un Audio</span>
          </button>
        </div>
      </div>

      {/* Lecteur Audio Principal avec Waveform Interactive */}
      <AudioPlayer metadata={meta} onTimeSeek={(time) => setCurrentTime(time)} />

      {/* Cartes Indicateurs Techniques & Acoustiques */}
      <div className="kpi-grid" style={{ marginBottom: 0 }}>
        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#9fb7d6" /> Durée Audio
          </div>
          <div className="kpi-value" style={{ fontSize: '20px', marginTop: '4px' }}>
            {Math.floor(meta.durationSeconds / 60)}m {meta.durationSeconds % 60}s
          </div>
          <div className="kpi-subtext">{meta.sampleRateHz / 1000} kHz • Mono</div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={14} color="#6db89a" /> Qualité & Bruit Estimé
          </div>
          <div className="kpi-value" style={{ fontSize: '20px', marginTop: '4px', color: meta.snrDb > 15 ? '#6db89a' : '#d9ae55' }}>
            {meta.estimatedNoiseLevel}
          </div>
          <div className="kpi-subtext">SNR mesuré : {meta.snrDb} dB</div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="#b3aed1" /> Mots & Temps Traitement
          </div>
          <div className="kpi-value" style={{ fontSize: '20px', marginTop: '4px' }}>
            {trans.totalWords} mots
          </div>
          <div className="kpi-subtext">{trans.processingTimeMs} ms • Modèle {trans.asrModelUsed.split('+')[0]}</div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px' }}>
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={14} color="#9fb7d6" /> Confiance Globale
          </div>
          <div className="kpi-value" style={{ fontSize: '20px', marginTop: '4px', color: '#9fb7d6' }}>
            {trans.globalConfidenceScore} %
          </div>
          <div className="kpi-subtext">Robustesse bruit : {trans.noiseRobustnessScore}%</div>
        </div>
      </div>

      {/* Bannière de Transparence IA */}
      <div className="ai-disclaimer-banner">
        <Sparkles size={16} />
        <span>
          <strong>Garantie de Rigueur IA :</strong> La segmentation des locuteurs et le score de confiance sont issus du modèle d'alignement temporel. Toute modification manuelle est horodatée et préserve l'archive brute originale.
        </span>
      </div>

      {/* Contenu : Vue Séquencée Diarisée */}
      {activeTab === 'SEGMENTS' ? (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Transcription Diarisée (Agent / Client)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Cliquez sur un tour de parole pour synchroniser l'audio à cette seconde exacte.
              </p>
            </div>
            {trans.lastEditedBy && (
              <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                Dernière modification : {trans.lastEditedBy} le {trans.lastEditedAt}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trans.segments.map((seg) => {
              const isActive = currentTime >= seg.startTime && currentTime <= seg.endTime;
              const isEditing = editingSegmentId === seg.id;

              return (
                <div 
                  key={seg.id} 
                  className={`transcript-segment-card ${seg.speaker === 'AGENT' ? 'agent-speaker' : 'client-speaker'} ${isActive ? 'active-playback' : ''} ${seg.isNoisyPassage ? 'noisy-warning' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '13px', 
                        color: seg.speaker === 'AGENT' ? 'var(--primary-light)' : '#6db89a' 
                      }}>
                        {seg.speakerLabel}
                      </span>
                      <button 
                        onClick={() => handleSegmentClick(seg.startTime)}
                        style={{ 
                          fontFamily: 'JetBrains Mono', 
                          fontSize: '11px', 
                          background: 'rgba(255,255,255,0.06)', 
                          border: 'none', 
                          color: 'var(--text-muted)', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Écouter à partir de cet instant"
                      >
                        {Math.floor(seg.startTime / 60)}:{(seg.startTime % 60).toFixed(1).padStart(4, '0')}s
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Badge Confiance */}
                      <span className={`badge ${
                        seg.confidenceScore >= 0.85 ? 'badge-green' : 
                        seg.confidenceScore >= 0.60 ? 'badge-amber' : 'badge-red'
                      }`} style={{ fontSize: '10.5px' }}>
                        Confiance : {Math.round(seg.confidenceScore * 100)}%
                      </span>

                      {/* Marqueur Bruit Ambiant */}
                      {seg.isNoisyPassage && (
                        <span className="badge badge-amber" style={{ fontSize: '10.5px' }} title="Passage altéré par le bruit ambiant ou parasitage réseau">
                          <AlertTriangle size={10} style={{ marginRight: '2px' }} />
                          Bruit : {seg.noiseImpactLevel}
                        </span>
                      )}

                      {/* Statut Édité */}
                      {seg.hasBeenEdited && (
                        <span className="badge badge-purple" style={{ fontSize: '10.5px' }}>
                          Corrigé manuellement
                        </span>
                      )}

                      {/* Bouton Édition */}
                      {!isEditing ? (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleStartEdit(seg)}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          title="Corriger la transcription de ce segment"
                        >
                          <Edit3 size={11} />
                          <span>Corriger</span>
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSaveEdit(seg.id)}
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            <Save size={11} />
                            <span>Valider</span>
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={handleCancelEdit}
                            style={{ padding: '3px 6px' }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Corps du texte */}
                  {isEditing ? (
                    <textarea 
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid var(--border-focus)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '13.5px',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {seg.correctedText ? (
                        <div>
                          <span>{seg.correctedText}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
                            Texte brut original conservé : « {seg.text} »
                          </span>
                        </div>
                      ) : (
                        <span>{seg.text}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Vue Comparatif : Texte Brut Original vs Texte Corrigé */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-panel">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#94a3b8' }}>
              Transcription Originale ASR (Non Altérée)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Archive brute générée par le modèle ASR sans intervention humaine.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1' }}>
              {trans.rawText}
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--primary-light)' }}>
              Transcription Actuelle (Version {trans.versionNumber})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Inclut les corrections manuelles effectuées par les superviseurs et auditeurs qualité.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '13px', lineHeight: 1.6, color: '#f8fafc' }}>
              {trans.correctedText || trans.rawText}
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Audio : transcription réelle (Whisper-small, signal brut) */}
      {showImportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div className="glass-panel" style={{ width: '680px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Transcrire un enregistrement</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowImportModal(false)}>
                <X size={14} />
              </button>
            </div>

            <RealTranscription onSaved={handleImportSaved} />
          </div>
        </div>
      )}
    </div>
  );
};
