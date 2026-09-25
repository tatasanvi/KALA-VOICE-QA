import React from 'react';
import { 
  Sparkles, Clock, MessageSquare, AlertCircle, 
  CheckCircle2, Flame, User, Users, ShieldAlert,
  Mic, Info
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Call, UserRole } from '../../types';

interface NlpAnalyticsViewProps {
  selectedCallId: string;
  onSelectCall: (callId: string) => void;
  currentRole: UserRole;
}

export const NlpAnalyticsView: React.FC<NlpAnalyticsViewProps> = ({ 
  selectedCallId, 
  onSelectCall 
}) => {
  const calls = storageService.getCalls();
  const currentCall = calls.find(c => c.id === selectedCallId) || calls[0];
  const analytics = currentCall.analytics;

  // Calcul des pourcentages de temps de parole
  const totalTalk = analytics.agentTalkTimeSeconds + analytics.clientTalkTimeSeconds;
  const agentPercent = totalTalk > 0 ? Math.round((analytics.agentTalkTimeSeconds / totalTalk) * 100) : 50;
  const clientPercent = 100 - agentPercent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sélecteur d'Appel */}
      <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="var(--primary-light)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Analyse IA de l'appel :</span>
          <select 
            value={currentCall.id}
            onChange={(e) => onSelectCall(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}
          >
            {calls.map(c => (
              <option key={c.id} value={c.id}>
                {c.callNumber} — {c.agentName} ({c.campaignName.split('—')[0]})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className={`badge ${analytics.resolutionStatus === 'RÉSOLU' ? 'badge-green' : analytics.resolutionStatus === 'EN_COURS' ? 'badge-amber' : 'badge-red'}`}>
            Statut : {analytics.resolutionStatus}
          </span>
          <span className="badge badge-purple">
            Sentiment Client : {analytics.sentimentClient}
          </span>
        </div>
      </div>

      {/* Avertissement Déontologique et Règle d'Explicabilité IA */}
      <div className="ai-disclaimer-banner">
        <Info size={16} />
        <span>
          <strong>Règle d'Explicabilité IA :</strong> {analytics.aiDisclaimer || "Suggestion IA — à valider par le responsable. Les indicateurs sont calculés sur le signal acoustique et textuel."}
        </span>
      </div>

      {/* Résumé Exécutif & Motif */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Motif de Contact Détecté
            </span>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#b4c6de', marginTop: '2px' }}>
              {analytics.contactIntent || "Information non déterminée."}
            </h2>
          </div>
          <span className="badge badge-blue" style={{ fontSize: '11px' }}>
            <Sparkles size={11} style={{ marginRight: '4px' }} /> Résumé Généré par LLM
          </span>
        </div>

        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#e2e8f0', background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
          {analytics.summary || "Information non déterminée."}
        </p>

        {/* Sujets & Mots-Clés */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginTop: '18px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Sujets Principaux Abordés :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analytics.mainTopics && analytics.mainTopics.length > 0 ? (
                analytics.mainTopics.map((topic, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                    <span>{topic}</span>
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Information non déterminée.</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Mots-Clés Saillants :
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {analytics.keywords && analytics.keywords.length > 0 ? (
                analytics.keywords.map((kw, i) => (
                  <span key={i} className="badge badge-gray">#{kw}</span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Information non déterminée.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Métriques de Communication & Tour de Parole */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Ratio de Parole Agent vs Client */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Répartition du Temps de Parole</h3>
            <span className="badge badge-blue">Ratio : {analytics.talkToListenRatio}x</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Agent : {agentPercent}% ({Math.round(analytics.agentTalkTimeSeconds)}s)
            </span>
            <span style={{ color: '#6db89a', fontWeight: 600 }}>
              Client : {clientPercent}% ({Math.round(analytics.clientTalkTimeSeconds)}s)
            </span>
          </div>

          <div style={{ height: '14px', width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${agentPercent}%`, background: 'var(--primary-gradient)', transition: 'width 0.4s ease' }} />
            <div style={{ width: `${clientPercent}%`, background: '#3f9a7a', transition: 'width 0.4s ease' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '18px' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chevauchements / Interruptions</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: analytics.interruptionCount > 3 ? '#d98383' : '#6db89a', marginTop: '2px' }}>
                {analytics.interruptionCount} coupure{analytics.interruptionCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{analytics.interruptionCount > 3 ? 'Alerte : fréquence élevée' : 'Rythme fluide'}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Temps de Silence Cumulé</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {analytics.totalSilenceSeconds} sec
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Débit : {analytics.speechRateWpm} mots/min</div>
            </div>
          </div>
        </div>

        {/* Chronologie Émotionnelle / Sentiment */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Trajectoire Émotionnelle (Client)</h3>
            <span className={`badge ${analytics.sentimentClient === 'TRÈS_FRUSTRÉ' ? 'badge-red' : analytics.sentimentClient === 'MITIGÉ' ? 'badge-amber' : 'badge-green'}`}>
              Bilan : {analytics.sentimentClient}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analytics.sentimentTimeline && analytics.sentimentTimeline.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', width: '45px' }}>
                  {item.minute.toFixed(1)} min
                </span>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', position: 'relative' }}>
                  <div 
                    style={{ 
                      position: 'absolute',
                      left: '50%',
                      width: `${Math.abs(item.clientSentiment) * 50}%`,
                      height: '100%',
                      background: item.clientSentiment >= 0 ? 'var(--success)' : 'var(--danger)',
                      transform: item.clientSentiment < 0 ? 'translateX(-100%)' : 'none',
                      borderRadius: 'var(--radius-full)'
                    }} 
                  />
                </div>
                <span style={{ 
                  fontWeight: 600, 
                  width: '75px', 
                  textAlign: 'right',
                  color: item.clientSentiment >= 0 ? '#6db89a' : '#d98383' 
                }}>
                  {item.clientSentiment > 0.3 ? 'Serein' : item.clientSentiment < -0.3 ? 'Frustré' : 'Neutre'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            Mesure basée sur la prosodie vocale et la valence sémantique des répliques.
          </div>
        </div>
      </div>

      {/* Objections & Moments Critiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Objections & Points de Friction */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertCircle size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Objections Détectées</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analytics.objectionsDetected && analytics.objectionsDetected.length > 0 ? (
              analytics.objectionsDetected.map((obj, i) => (
                <div key={i} style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', color: '#fef3c7' }}>
                  {obj}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Aucune objection majeure identifiée sur cet échange.
              </div>
            )}
          </div>
        </div>

        {/* Actions & Informations Clés */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <CheckCircle2 size={18} color="#6db89a" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Actions & Engagements Pris</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analytics.actionItemsRequested && analytics.actionItemsRequested.length > 0 ? (
              analytics.actionItemsRequested.map((act, i) => (
                <div key={i} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', color: '#d1fae5' }}>
                  ✓ {act}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Information non déterminée.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
