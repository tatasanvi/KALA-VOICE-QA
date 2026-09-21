import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileAudio, CheckCircle2, AlertCircle, X, Sparkles, 
  User, Layers, PhoneCall, Sliders, Play, Pause, BarChart2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Call } from '../../types';
import { RealTranscription } from './RealTranscription';

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
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)', overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.03)'
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
              Transcription réelle par Whisper-small, sur le signal brut.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <RealTranscription />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            La transcription n'est pas encore enregistrée comme appel : elle s'affiche ici uniquement.
          </div>
        </div>
      </div>
    </div>
  );
};
