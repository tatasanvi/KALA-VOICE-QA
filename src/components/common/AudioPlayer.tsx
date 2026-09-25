import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, AlertTriangle } from 'lucide-react';
import { audioSignalService, AudioPlayMode } from '../../services/audioSignalService';
import { AudioMetadata } from '../../types';

interface AudioPlayerProps {
  metadata: AudioMetadata;
  activeTime?: number;
  onTimeSeek?: (seconds: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ metadata, onTimeSeek }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playMode, setPlayMode] = useState<AudioPlayMode>('KALA_DENOISED');

  useEffect(() => {
    const unsubTime = audioSignalService.onTimeUpdate((time) => {
      setCurrentTime(time);
    });
    const unsubState = audioSignalService.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubTime();
      unsubState();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioSignalService.pause();
    } else {
      audioSignalService.play(currentTime, metadata.durationSeconds);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = ratio * metadata.durationSeconds;
    audioSignalService.seek(targetSeconds);
    setCurrentTime(targetSeconds);
    if (onTimeSeek) onTimeSeek(targetSeconds);
  };

  const handleModeChange = (mode: AudioPlayMode) => {
    setPlayMode(mode);
    audioSignalService.setPlayMode(mode);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / metadata.durationSeconds) * 100;
  const samples = metadata.waveformSamples || [0.3, 0.6, 0.8, 0.4, 0.7, 0.9, 0.5, 0.3];

  return (
    <div className="audio-player-card">
      {/* Header du lecteur avec sélecteur de mode de débruitage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(74, 111, 165, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9fb7d6' }}>
            <Volume2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metadata.filename}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Échantillonnage : {metadata.sampleRateHz / 1000} kHz Mono • Durée : {formatTime(metadata.durationSeconds)}
            </div>
          </div>
        </div>

        {/* Toggle Double Flux Audio : Original bruité vs Débruité KALA */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.5)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn btn-sm ${playMode === 'ORIGINAL_NOISY' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleModeChange('ORIGINAL_NOISY')}
            style={{ fontSize: '11.5px', padding: '4px 10px' }}
          >
            <AlertTriangle size={13} color={playMode === 'ORIGINAL_NOISY' ? '#fff' : '#f59e0b'} />
            <span>Audio Original (Bruité)</span>
          </button>
          <button 
            className={`btn btn-sm ${playMode === 'KALA_DENOISED' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleModeChange('KALA_DENOISED')}
            style={{ fontSize: '11.5px', padding: '4px 10px', marginLeft: '4px' }}
          >
            <Sparkles size={13} color="#b4c6de" />
            <span>Débruité KALA (simulation)</span>
          </button>
        </div>
      </div>

      {/* Waveform interactive */}
      <div 
        className="waveform-track"
        onClick={handleSeek}
        title="Cliquez pour naviguer dans l'enregistrement audio"
      >
        <div 
          className="waveform-playhead" 
          style={{ left: `${progressPercent}%` }} 
        />
        {samples.map((val, idx) => {
          const barPercent = (idx / samples.length) * 100;
          const isPassed = barPercent <= progressPercent;
          const isNoisyBar = metadata.estimatedNoiseLevel !== 'FAIBLE' && (idx >= 12 && idx <= 26);

          return (
            <div 
              key={idx}
              className={`waveform-bar ${isPassed ? 'active' : ''} ${isNoisyBar && playMode === 'ORIGINAL_NOISY' ? 'noisy' : ''}`}
              style={{ height: `${Math.max(12, val * 52)}px` }}
            />
          );
        })}
      </div>

      {/* Contrôles et Métriques Techniques */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleTogglePlay}
            style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', padding: 0 }}
            title={isPlaying ? "Mettre en pause" : "Écouter l'enregistrement audio"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              audioSignalService.seek(0);
              setCurrentTime(0);
              if (onTimeSeek) onTimeSeek(0);
            }}
            title="Revenir au début"
          >
            <RotateCcw size={14} />
          </button>

          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--primary-light)' }}>{formatTime(currentTime)}</span>
            <span style={{ color: 'var(--text-muted)' }}> / {formatTime(metadata.durationSeconds)}</span>
          </div>
        </div>

        {/* Badges Acoustiques & Bruit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-gray" title="Rapport Signal sur Bruit mesuré">
            SNR : <strong style={{ color: metadata.snrDb > 15 ? '#6db89a' : '#f59e0b' }}>{metadata.snrDb} dB</strong>
          </span>

          <span 
            className={`badge ${
              metadata.estimatedNoiseLevel === 'FAIBLE' ? 'badge-green' : 
              metadata.estimatedNoiseLevel === 'MODÉRÉ' ? 'badge-amber' : 'badge-red'
            }`}
            title="Niveau de perturbation estimé"
          >
            Bruit : {metadata.estimatedNoiseLevel}
          </span>

          <span className="badge badge-purple" title="Score global de clarté audio">
            Qualité Audio : {metadata.audioQualityScore}/100
          </span>
        </div>
      </div>
    </div>
  );
};
