import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileAudio, CheckCircle2, AlertCircle, X, Sparkles, 
  User, Layers, PhoneCall, Sliders, Play, Pause, BarChart2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Call } from '../../types';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCall: Call) => void;
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const agents = storageService.getAgents();
  const campaigns = storageService.getCampaigns();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Formulaire d'assignation
  const [agentId, setAgentId] = useState(agents[0]?.id || 'agent-1');
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || 'camp-1');
  const [callType, setCallType] = useState('SUPPORT_TECHNIQUE');
  const [direction, setDirection] = useState<'ENTRANT' | 'SORTANT'>('ENTRANT');
  const [customerPhone, setCustomerPhone] = useState('+33 6 •• •• 42 19');
  const [customerName, setCustomerName] = useState('M. Eric Lemaire (Anonymisé)');
  const [isUrgentReview, setIsUrgentReview] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [audioDuration, setAudioDuration] = useState(184);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Calculer la durée audio réelle si possible
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setAudioDuration(Math.round(tempAudio.duration));
      }
    };
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Aucune transcription n'est fabriquée : le pipeline ASR réel (Whisper) n'est pas encore branché.
  // Le fichier est seulement lu localement pour l'écoute ; aucun appel, score ou texte n'est généré.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '640px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)', overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.1))'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'var(--primary)', width: '28px', height: '28px',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <UploadCloud size={16} color="white" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Ingestion & Analyse d'Enregistrement Audio</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 36px' }}>
              Écoute locale du fichier. La transcription automatique n'est pas encore disponible.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Zone de Drag & Drop */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary)' : selectedFile ? '#10b981' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              background: dragActive ? 'rgba(99, 102, 241, 0.08)' : selectedFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => document.getElementById('audio-file-input')?.click()}
          >
            <input 
              id="audio-file-input"
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.ogg"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {selectedFile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileAudio size={22} color="#34d399" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#a7f3d0' }}>{selectedFile.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Taille : {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo • Durée estimée : {audioDuration}s
                </div>

                {audioUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }} onClick={e => e.stopPropagation()}>
                    <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={togglePlay}
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isPlaying ? 'Pause' : 'Écouter l\'extrait'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={32} color="var(--primary-light)" />
                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                  Glissez-déposez un fichier audio ici, ou <span style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>parcourez</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Formats supportés : WAV (recommandé), MP3, M4A, OGG • Échantillonnage auto 16 kHz
                </div>
              </div>
            )}
          </div>

          {/* Formulaire Métadonnées & Assignation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Conseiller / Agent Assigné
              </label>
              <select 
                value={agentId} 
                onChange={e => setAgentId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.teamName})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Campagne Métier
              </label>
              <select 
                value={campaignId} 
                onChange={e => setCampaignId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Typologie d'Appel
              </label>
              <select 
                value={callType} 
                onChange={e => setCallType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
              >
                <option value="SUPPORT_TECHNIQUE">Support Technique</option>
                <option value="RECLAMATION">Réclamation & Litige</option>
                <option value="RETENTION_RESILIATION">Rétention / Résiliation</option>
                <option value="INFORMATION">Information & Renseignement</option>
                <option value="VENTE">Souscription / Vente</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Sens de l'Appel
              </label>
              <select 
                value={direction} 
                onChange={e => setDirection(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
              >
                <option value="ENTRANT">Appel Entrant (Inbound)</option>
                <option value="SORTANT">Appel Sortant (Outbound)</option>
              </select>
            </div>
          </div>

          {/* Option Alerte Audit Urgent */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
            padding: '12px 16px', borderRadius: 'var(--radius-md)'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fca5a5' }}>
                Marquer comme Audit Qualité Urgent
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Envoie une notification prioritaire aux auditeurs QA pour évaluation sous 2h.
              </div>
            </div>
            <input 
              type="checkbox"
              checked={isUrgentReview}
              onChange={e => setIsUrgentReview(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Information honnête */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            Aucune transcription n'est produite pour le moment : aucun texte, WER, SNR ni score ne sera généré tant que le pipeline de transcription réel n'est pas branché.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={processing}>
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled
              title="Le pipeline de transcription réel n'est pas encore branché"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Sparkles size={16} />
              <span>Transcription bientôt disponible</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
