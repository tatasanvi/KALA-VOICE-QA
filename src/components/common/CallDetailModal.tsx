import React, { useState } from 'react';
import {
  X, PhoneCall, Mic, User, Bot, Shield, AlertTriangle, 
  CheckCircle2, Clock, MessageSquare, TrendingUp, BarChart2,
  Zap, Eye, HelpCircle, ChevronDown, ChevronUp, Play,
  Volume2, Pause, Sparkles, Target, ArrowRight
} from 'lucide-react';
import { Call, UserRole } from '../../types';
import { DemoDataBadge } from './DemoDataBanner';

interface CallDetailModalProps {
  call: Call;
  onClose: () => void;
  onNavigate: (view: any) => void;
  onSelectCall: (callId: string) => void;
  currentRole: UserRole;
}

const SentimentBadge: React.FC<{ sentiment: string }> = ({ sentiment }) => {
  const map: Record<string, { color: string; emoji: string }> = {
    POSITIF: { color: '#6db89a', emoji: '😊' },
    NEUTRE: { color: '#94a3b8', emoji: '😐' },
    MITIGÉ: { color: '#d9ae55', emoji: '😕' },
    NÉGATIF: { color: '#d98383', emoji: '😠' },
    TRÈS_FRUSTRÉ: { color: '#ef4444', emoji: '😡' },
  };
  const c = map[sentiment] || { color: '#94a3b8', emoji: '❓' };
  return (
    <span style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 600,
      background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}44`
    }}>
      {c.emoji} {sentiment.replace('_', ' ')}
    </span>
  );
};

export const CallDetailModal: React.FC<CallDetailModalProps> = ({ 
  call, onClose, onNavigate, onSelectCall
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'ai' | 'quality'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());

  const a = call.analytics;
  const t = call.transcription;
  const audio = call.audioMetadata;

  const durationMin = Math.floor(call.durationSeconds / 60);
  const durationSec = call.durationSeconds % 60;

  const agentTalkPct = Math.round((a.agentTalkTimeSeconds / call.durationSeconds) * 100);
  const clientTalkPct = Math.round((a.clientTalkTimeSeconds / call.durationSeconds) * 100);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
    { id: 'transcript', label: 'Transcription', icon: MessageSquare },
    { id: 'ai', label: 'Analyse IA', icon: Sparkles },
    { id: 'quality', label: 'Qualité & Score', icon: Shield },
  ] as const;

  const toggleSegment = (segId: string) => {
    setExpandedSegments(prev => {
      const next = new Set(prev);
      next.has(segId) ? next.delete(segId) : next.add(segId);
      return next;
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '960px', maxHeight: '90vh',
        background: 'rgba(15,20,40,0.98)',
        border: '1px solid rgba(74, 111, 165,0.3)',
        borderRadius: '20px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden'
      }}>

        {/* ─── Header ─── */}
        <div style={{
          padding: '20px 28px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(74, 111, 165,0.2)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
          flexShrink: 0
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <PhoneCall size={18} color="var(--primary-light)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Fiche Appel Détaillée
              </span>
              {call.status && (
                <span style={{
                  padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 700,
                  background: call.status === 'EVALUE' ? 'rgba(52,211,153,0.15)' :
                    call.status === 'A_REVOIR' ? 'rgba(251,191,36,0.15)' :
                    call.status === 'COACHING_RECOMMANDE' ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.15)',
                  color: call.status === 'EVALUE' ? '#6db89a' :
                    call.status === 'A_REVOIR' ? '#d9ae55' :
                    call.status === 'COACHING_RECOMMANDE' ? '#d98383' : '#94a3b8',
                }}>
                  {call.status.replace(/_/g, ' ')}
                </span>
              )}
              {call.isUrgentReviewRequired && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '3px',
                  padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 700,
                  background: 'rgba(239,68,68,0.15)', color: '#d98383'
                }}>
                  <AlertTriangle size={10} /> Revue Urgente
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>
              {call.callNumber} — {call.agentName}
            </h2>
            <div style={{ marginBottom: '6px' }}><DemoDataBadge /></div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>📅 {call.callDate}</span>
              <span>⏱ {durationMin}m {durationSec}s</span>
              <span>🏢 {call.campaignName.split('—')[0]}</span>
              <span>👤 {call.customerNameMasked}</span>
              <span>📞 {call.customerPhoneMasked}</span>
              <span style={{ color: call.direction === 'ENTRANT' ? '#6db89a' : '#9fb7d6' }}>
                {call.direction === 'ENTRANT' ? '↙ Entrant' : '↗ Sortant'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', transition: 'all 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Mini audio player ─── */}
        <div style={{
          padding: '12px 28px',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: '14px',
          flexShrink: 0
        }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--primary-gradient)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0
            }}
          >
            {isPlaying ? <Pause size={15} color="white" /> : <Play size={15} color="white" />}
          </button>
          
          {/* Waveform simulée */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', height: '32px', overflow: 'hidden' }}>
            {audio.waveformSamples.slice(0, 80).map((amp, i) => (
              <div key={i} style={{
                flex: '0 0 3px', height: `${Math.max(4, amp * 28)}px`,
                background: i < 40 && isPlaying ? 'var(--primary-light)' : 'rgba(74, 111, 165,0.5)',
                borderRadius: '2px', transition: 'background 0.3s'
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Volume2 size={13} />
              <span className={`badge ${
                audio.estimatedNoiseLevel === 'FAIBLE' ? 'badge-green' :
                audio.estimatedNoiseLevel === 'MODÉRÉ' ? 'badge-amber' : 'badge-red'
              }`} style={{ fontSize: '11px' }}>
                {audio.estimatedNoiseLevel} • SNR {audio.snrDb} dB
              </span>
            </span>
            <span>Qualité audio : <strong style={{ color: audio.audioQualityScore >= 80 ? '#6db89a' : '#d9ae55' }}>{audio.audioQualityScore}/100</strong></span>
            <span>{audio.noiseType.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div style={{
          display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '12px 16px',
                  background: isActive ? 'rgba(74, 111, 165,0.12)' : 'transparent',
                  border: 'none', borderBottom: isActive ? '2px solid var(--primary-light)' : '2px solid transparent',
                  color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 700 : 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ─── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>

          {/* ===== OVERVIEW ===== */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* KPI Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Score Qualité', value: call.qualityScore ? `${call.qualityScore}/100` : 'Non évalué', color: call.qualityScore && call.qualityScore >= 80 ? '#6db89a' : call.qualityScore ? '#d9ae55' : '#94a3b8' },
                  { label: 'Résolution', value: a.resolutionStatus, color: a.resolutionStatus === 'RÉSOLU' ? '#6db89a' : a.resolutionStatus === 'EN_COURS' ? '#d9ae55' : '#d98383' },
                  { label: 'Confiance ASR', value: `${t.globalConfidenceScore}%`, color: t.globalConfidenceScore >= 85 ? '#6db89a' : '#d9ae55' },
                  { label: 'Robustesse Bruit', value: `${t.noiseRobustnessScore}%`, color: t.noiseRobustnessScore >= 80 ? '#6db89a' : '#d9ae55' },
                  { label: 'Modèle ASR', value: t.asrModelUsed, color: '#9fb7d6' },
                ].map((kpi, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px', padding: '14px 16px'
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{kpi.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ background: 'rgba(74, 111, 165,0.06)', border: '1px solid rgba(74, 111, 165,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Sparkles size={14} color="var(--primary-light)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase' }}>Résumé IA de l'appel</span>
                </div>
                <p style={{ fontSize: '13.5px', lineHeight: 1.7, color: '#e2e8f0' }}>{a.summary}</p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Intention :</strong>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 600 }}>{a.contactIntent}</span>
                </div>
              </div>

              {/* Sentiment & Paralinguistique */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>Sentiment Agent / Client</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px' }}>🧑‍💼 Agent :</span>
                      <SentimentBadge sentiment={a.sentimentAgent} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px' }}>👤 Client :</span>
                      <SentimentBadge sentiment={a.sentimentClient} />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>Temps de Parole</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>Agent ({agentTalkPct}%)</span>
                        <span>{Math.floor(a.agentTalkTimeSeconds / 60)}m {a.agentTalkTimeSeconds % 60}s</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${agentTalkPct}%`, background: '#9fb7d6', borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>Client ({clientTalkPct}%)</span>
                        <span>{Math.floor(a.clientTalkTimeSeconds / 60)}m {a.clientTalkTimeSeconds % 60}s</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${clientTalkPct}%`, background: '#6db89a', borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>✂️ {a.interruptionCount} interruptions</span>
                      <span>⏸ {a.totalSilenceSeconds}s silences</span>
                      <span>💬 {a.speechRateWpm} mots/min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Moments Critiques */}
              {a.criticalMoments.length > 0 && (
                <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: '#d9ae55' }}>⚡ Moments Critiques Détectés</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {a.criticalMoments.slice(0, 5).map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12.5px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#d9ae55', flexShrink: 0 }}>
                          {Math.floor(m.timestamp / 60)}:{String(m.timestamp % 60).padStart(2, '0')}
                        </span>
                        <span style={{ 
                          padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                          background: 'rgba(251,191,36,0.15)', color: '#d9ae55', flexShrink: 0
                        }}>{m.type}</span>
                        <span style={{ color: '#e2e8f0', lineHeight: 1.4 }}>{m.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { onSelectCall(call.id); onNavigate('transcriptions'); onClose(); }}
                >
                  <Mic size={13} /> Studio Audio Complet
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { onSelectCall(call.id); onNavigate('analytics'); onClose(); }}
                >
                  <BarChart2 size={13} /> Analyse NLP
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { onSelectCall(call.id); onNavigate('quality'); onClose(); }}
                >
                  <Shield size={13} /> Contrôle Qualité
                </button>
              </div>
            </div>
          )}

          {/* ===== TRANSCRIPT ===== */}
          {activeTab === 'transcript' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Transcription Synchronisée — {t.versionNumber === 1 ? 'Version Brute' : `Version Corrigée v${t.versionNumber}`}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Modèle : <strong>{t.asrModelUsed}</strong> • {t.totalWords} mots • Traitement : {t.processingTimeMs}ms
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge ${t.globalConfidenceScore >= 85 ? 'badge-green' : 'badge-amber'}`}>
                    Confiance : {t.globalConfidenceScore}%
                  </span>
                  <span className={`badge ${t.noiseRobustnessScore >= 80 ? 'badge-green' : 'badge-amber'}`}>
                    Robustesse : {t.noiseRobustnessScore}%
                  </span>
                </div>
              </div>

              {t.segments.map(seg => (
                <div key={seg.id} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: '10px',
                  background: seg.speaker === 'AGENT' 
                    ? 'rgba(74, 111, 165,0.08)' 
                    : 'rgba(52,211,153,0.06)',
                  border: `1px solid ${seg.speaker === 'AGENT' ? 'rgba(74, 111, 165,0.2)' : 'rgba(52,211,153,0.15)'}`,
                  borderLeft: `3px solid ${seg.speaker === 'AGENT' ? 'var(--primary-light)' : '#6db89a'}`,
                }}>
                  {seg.speaker === 'AGENT' 
                    ? <User size={15} color="var(--primary-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    : <Bot size={15} color="#6db89a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '11px', fontWeight: 700, 
                        color: seg.speaker === 'AGENT' ? 'var(--primary-light)' : '#6db89a'
                      }}>
                        {seg.speakerLabel}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {seg.isNoisyPassage && (
                          <span style={{ fontSize: '10px', color: '#d98383', fontWeight: 600 }}>🔊 BRUIT {seg.noiseImpactLevel}</span>
                        )}
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {Math.floor(seg.startTime / 60)}:{String(Math.round(seg.startTime) % 60).padStart(2, '0')} → {Math.floor(seg.endTime / 60)}:{String(Math.round(seg.endTime) % 60).padStart(2, '0')}
                        </span>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px',
                          background: seg.confidenceScore >= 0.9 ? 'rgba(52,211,153,0.15)' : seg.confidenceScore >= 0.75 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                          color: seg.confidenceScore >= 0.9 ? '#6db89a' : seg.confidenceScore >= 0.75 ? '#d9ae55' : '#d98383'
                        }}>
                          {Math.round(seg.confidenceScore * 100)}%
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#e2e8f0', margin: 0 }}>
                      {seg.correctedText || seg.text}
                    </p>
                    {seg.hasBeenEdited && seg.correctedText && (
                      <button
                        onClick={() => toggleSegment(seg.id)}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#d9ae55', fontSize: '11px', marginTop: '4px',
                          display: 'flex', alignItems: 'center', gap: '3px'
                        }}
                      >
                        {expandedSegments.has(seg.id) ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        Voir version brute
                      </button>
                    )}
                    {expandedSegments.has(seg.id) && (
                      <p style={{ 
                        fontSize: '12px', lineHeight: 1.5, color: '#94a3b8', margin: '6px 0 0',
                        padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px',
                        fontStyle: 'italic', textDecoration: 'line-through'
                      }}>
                        {seg.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== AI ANALYSIS ===== */}
          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Transparence IA Banner */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(74, 111, 165,0.3)', borderRadius: '12px', padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Eye size={14} color="var(--primary-light)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase' }}>
                    Cadre de Transparence IA — {a.aiDisclaimer}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                      <CheckCircle2 size={12} color="#6db89a" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#6db89a' }}>INFORMATIONS DÉTECTÉES</span>
                    </div>
                    <ul style={{ paddingLeft: '14px', fontSize: '12px', lineHeight: 1.6, color: '#d1fae5', margin: 0 }}>
                      {(a.groundTruthDetected || a.importantInformation).slice(0, 4).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                      <Sparkles size={12} color="#d9ae55" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#d9ae55' }}>SUGGESTIONS IA</span>
                    </div>
                    <ul style={{ paddingLeft: '14px', fontSize: '12px', lineHeight: 1.6, color: '#fef3c7', margin: 0 }}>
                      {(a.aiSuggestions || a.unresolvedIssues).slice(0, 4).map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                      <HelpCircle size={12} color="#94a3b8" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>NON DÉTERMINÉ</span>
                    </div>
                    <ul style={{ paddingLeft: '14px', fontSize: '12px', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                      {(a.undeterminedFields || ['Motif profond non verbalisé', 'Niveau de satisfaction final', 'Suivi post-appel incertain']).slice(0, 3).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Objections & Problèmes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {a.objectionsDetected.length > 0 && (
                  <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#d98383', marginBottom: '8px' }}>🚧 Objections Détectées</h4>
                    <ul style={{ paddingLeft: '16px', fontSize: '12.5px', lineHeight: 1.6, color: '#fecaca', margin: 0 }}>
                      {a.objectionsDetected.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                  </div>
                )}
                {a.actionItemsRequested.length > 0 && (
                  <div style={{ background: 'rgba(74, 111, 165,0.05)', border: '1px solid rgba(74, 111, 165,0.2)', borderRadius: '12px', padding: '14px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '8px' }}>✅ Actions Demandées</h4>
                    <ul style={{ paddingLeft: '16px', fontSize: '12.5px', lineHeight: 1.6, color: '#c7d2fe', margin: 0 }}>
                      {a.actionItemsRequested.map((act, i) => <li key={i}>{act}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Communication Issues */}
              {a.detectedCommunicationIssues.length > 0 && (
                <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '14px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#d9ae55', marginBottom: '8px' }}>⚠️ Problèmes de Communication Identifiés</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {a.detectedCommunicationIssues.map((issue, i) => (
                      <span key={i} style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
                        background: 'rgba(251,191,36,0.12)', color: '#d9ae55', border: '1px solid rgba(251,191,36,0.25)'
                      }}>{issue}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommandations coaching depuis qualité */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', 
                padding: '14px 18px',
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '12px', cursor: 'pointer'
              }}
                onClick={() => { onSelectCall(call.id); onNavigate('coaching'); onClose(); }}
              >
                <Target size={18} color="#3f9a7a" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#3f9a7a' }}>Générer un Plan de Coaching depuis cette analyse</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Basé sur les lacunes et objections détectées dans cet appel</div>
                </div>
                <ArrowRight size={16} color="#3f9a7a" />
              </div>
            </div>
          )}

          {/* ===== QUALITY ===== */}
          {activeTab === 'quality' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Score global */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch', flexWrap: 'wrap' }}>
                <div style={{
                  background: call.qualityScore && call.qualityScore >= 80 
                    ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
                  border: `1px solid ${call.qualityScore && call.qualityScore >= 80 ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                  borderRadius: '12px', padding: '20px 28px', textAlign: 'center', minWidth: '160px'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Score Qualité</div>
                  <div style={{ 
                    fontSize: '42px', fontWeight: 900,
                    color: call.qualityScore && call.qualityScore >= 80 ? '#6db89a' : '#d9ae55'
                  }}>
                    {call.qualityScore ?? '—'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 100</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {call.qualityScore 
                      ? call.qualityScore >= 85 
                        ? '✅ Agent conforme aux standards de qualité définis'
                        : call.qualityScore >= 70 
                          ? '⚠️ Plusieurs axes d\'amélioration identifiés — coaching recommandé'
                          : '🔴 Performance insuffisante — plan de remédiation requis'
                      : 'Cet appel n\'a pas encore été évalué par le service qualité.'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { onSelectCall(call.id); onNavigate('quality'); onClose(); }}
                    >
                      <CheckCircle2 size={13} /> Ouvrir la Grille QA
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { onSelectCall(call.id); onNavigate('coaching'); onClose(); }}
                    >
                      <Target size={13} /> Générer Plan Coaching
                    </button>
                  </div>
                </div>
              </div>

              {/* Principaux thèmes */}
              {a.mainTopics.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>🏷️ Thèmes Principaux</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {a.mainTopics.map((topic, i) => (
                      <span key={i} style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12.5px',
                        background: 'rgba(74, 111, 165,0.12)', color: 'var(--primary-light)',
                        border: '1px solid rgba(74, 111, 165,0.25)'
                      }}>{topic}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mots-clés */}
              {a.keywords.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>🔑 Mots-clés Extraits</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {a.keywords.map((kw, i) => (
                      <span key={i} style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px',
                        background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'JetBrains Mono'
                      }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Note du rédacteur */}
              {call.notes && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>📝 Notes de Supervision</h4>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>{call.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
