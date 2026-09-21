import React from 'react';
import { UploadCloud, X } from 'lucide-react';
import { RealTranscription } from './RealTranscription';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Appelé après l'enregistrement en base d'une vraie transcription.
  onSaved?: () => void;
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({ isOpen, onClose, onSaved }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '760px', maxHeight: '90vh',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)', overflowY: 'auto'
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
          <RealTranscription onSaved={onSaved} />
        </div>
      </div>
    </div>
  );
};
