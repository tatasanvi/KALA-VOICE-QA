import React, { useState } from 'react';
import { 
  CheckCircle2, Sparkles, Award, ShieldAlert, 
  MessageSquare, Quote, Save, Printer, Sliders
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { QualityService } from '../../services/qualityService';
import { ReportService } from '../../services/reportService';
import { QualityEvaluation, QualityCriterion, Call, UserRole } from '../../types';

interface QualityControlViewProps {
  selectedCallId: string;
  onSelectCall: (callId: string) => void;
  onNavigate: (view: any) => void;
  currentRole: UserRole;
}

export const QualityControlView: React.FC<QualityControlViewProps> = ({ 
  selectedCallId, 
  onSelectCall,
  onNavigate
}) => {
  const calls = storageService.getCalls();
  const criteria = storageService.getCriteria();
  const currentUser = storageService.getCurrentUser();

  const currentCall = calls.find(c => c.id === selectedCallId) || calls[0];
  const existingEval = storageService.getEvaluationByCallId(currentCall.id);

  // Initialisation de l'évaluation si non existante
  const [evaluation, setEvaluation] = useState<QualityEvaluation>(() => {
    if (existingEval) return existingEval;
    return QualityService.generateAiSuggestedEvaluation(currentCall, criteria, currentUser.name);
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleScoreChange = (criterionId: string, newScore: number) => {
    const updatedItems = evaluation.items.map(item => {
      if (item.criterionId === criterionId) {
        return {
          ...item,
          score: newScore,
          isAiAccepted: false
        };
      }
      return item;
    });

    const newOverallScore = QualityService.calculateOverallScore(updatedItems, criteria);
    setEvaluation({
      ...evaluation,
      items: updatedItems,
      overallScore: newOverallScore,
      unmetCriteriaCount: updatedItems.filter(it => it.score < 7).length
    });
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    const updatedItems = evaluation.items.map(item => {
      if (item.criterionId === criterionId) {
        return { ...item, comment };
      }
      return item;
    });
    setEvaluation({ ...evaluation, items: updatedItems });
  };

  const handleAcceptAiScore = (criterionId: string) => {
    const updatedItems = evaluation.items.map(item => {
      if (item.criterionId === criterionId) {
        return {
          ...item,
          score: item.aiProposedScore,
          isAiAccepted: true
        };
      }
      return item;
    });

    const newOverallScore = QualityService.calculateOverallScore(updatedItems, criteria);
    setEvaluation({
      ...evaluation,
      items: updatedItems,
      overallScore: newOverallScore
    });
  };

  const handleFinalValidation = () => {
    const validatedEval: QualityEvaluation = {
      ...evaluation,
      status: 'VALIDÉE_RESPONSABLE',
      evaluatorId: currentUser.id,
      evaluatorName: `${currentUser.name} (${currentUser.role})`,
      validatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setEvaluation(validatedEval);
    storageService.saveEvaluation(validatedEval);

    setNotification("Évaluation validée avec succès ! Le score officiel a été enregistré et archivé dans le dossier agent.");
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Sélecteur d'Appel & Actions */}
      <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} color="#34d399" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Évaluation de l'appel :</span>
          <select 
            value={currentCall.id}
            onChange={(e) => onSelectCall(e.target.value)}
            className="role-select"
            style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}
          >
            {calls.map(c => (
              <option key={c.id} value={c.id}>
                {c.callNumber} — {c.agentName} (Score actuel : {c.qualityScore ?? 'Non noté'})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => ReportService.printCallQualityReport(currentCall, evaluation)}
          >
            <Printer size={14} />
            <span>Imprimer Rapport Audit</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={handleFinalValidation}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Save size={14} />
            <span>Valider Définitivement</span>
          </button>
        </div>
      </div>

      {notification && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#a7f3d0', fontSize: '13.5px', fontWeight: 600 }}>
          {notification}
        </div>
      )}

      {/* Carte Score Qualité Global & Synthèse */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            {evaluation.formTitle}
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '2px' }}>
            Contrôle Qualité — Agent : {currentCall.agentName}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Statut : <strong style={{ color: evaluation.status === 'VALIDÉE_RESPONSABLE' ? '#34d399' : '#fbbf24' }}>{evaluation.status}</strong>
            {evaluation.validatedAt && ` • Validé le ${evaluation.validatedAt}`}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Suggestion IA */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <Sparkles size={12} color="#60a5fa" /> Suggestion IA
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#93c5fd' }}>
              {evaluation.aiSuggestedScore} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>

          {/* Score Officiel */}
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            border: '2px solid rgba(59, 130, 246, 0.4)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '12px 24px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Score Qualité Global
            </div>
            <div style={{ fontSize: '38px', fontWeight: 900, color: evaluation.overallScore >= 80 ? '#34d399' : evaluation.overallScore >= 70 ? '#fbbf24' : '#f87171' }}>
              {evaluation.overallScore} <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Synthèse Forces, Axes & Recommandations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <div className="glass-panel" style={{ borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
            Points Forts Observés
          </h3>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: 1.6, color: '#d1fae5' }}>
            {evaluation.strengths.map((str, i) => (
              <li key={i}>{str}</li>
            ))}
          </ul>
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
            Points Faibles & Axes d'Amélioration
          </h3>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: 1.6, color: '#fef3c7' }}>
            {evaluation.weaknesses.map((wk, i) => (
              <li key={i}>{wk}</li>
            ))}
          </ul>
        </div>

        <div className="glass-panel" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#c084fc' }}>
              Plan d'Action & Coaching
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('coaching')}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              Vers Coaching
            </button>
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: 1.6, color: '#e9d5ff' }}>
            {evaluation.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grille d'Évaluation Configurable : 13 Critères */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Grille d'Évaluation Détaillée (13 Critères Pondérés)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Ajustez les notes manuellement ou validez les suggestions extraites par l'IA avec preuves textuelles.
            </p>
          </div>
          <span className="badge badge-purple">
            <Sliders size={12} style={{ marginRight: '4px' }} /> 100% Pondéré
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {criteria.map((crit) => {
            const item = evaluation.items.find(it => it.criterionId === crit.id);
            const currentScore = item ? item.score : 8;
            const aiScore = item ? item.aiProposedScore : 8;
            const evidence = item?.transcriptEvidenceQuotes || [];

            return (
              <div 
                key={crit.id} 
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                        {crit.label}
                      </span>
                      <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                        Poids : {crit.weight}%
                      </span>
                      {crit.isCritical && (
                        <span className="badge badge-red" style={{ fontSize: '10.5px' }}>
                          Critère Obligatoire
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {crit.description}
                    </p>
                  </div>

                  {/* Contrôle de la Note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Badge Suggestion IA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                        <Sparkles size={11} style={{ marginRight: '3px' }} />
                        IA : {aiScore}/{crit.maxScore}
                      </span>
                      {item && item.score !== aiScore && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAcceptAiScore(crit.id)}
                          style={{ padding: '2px 6px', fontSize: '10.5px' }}
                          title="Restaurer la proposition initiale de l'IA"
                        >
                          Adopter {aiScore}
                        </button>
                      )}
                    </div>

                    {/* Sélecteur Note */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Note :</span>
                      <select 
                        value={currentScore} 
                        onChange={(e) => handleScoreChange(crit.id, parseInt(e.target.value))}
                        className="role-select"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--border-active)',
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '14px',
                          fontWeight: 800,
                          color: currentScore >= 8 ? '#34d399' : currentScore >= 6 ? '#fbbf24' : '#f87171'
                        }}
                      >
                        {[...Array(crit.maxScore + 1)].map((_, n) => (
                          <option key={n} value={n}>{n} / {crit.maxScore}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preuves textuelles / Citations du transcript */}
                {evidence.length > 0 && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.06)', borderLeft: '3px solid var(--primary-light)', padding: '8px 12px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93c5fd', fontWeight: 600, marginBottom: '2px' }}>
                      <Quote size={12} />
                      <span>Extrait probant de transcription :</span>
                    </div>
                    <div style={{ fontStyle: 'italic', color: '#f1f5f9' }}>
                      « {evidence[0].quote} »
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Justification IA : {evidence[0].relevanceNote}
                    </div>
                  </div>
                )}

                {/* Champ Commentaire Auditeur */}
                <div>
                  <input 
                    type="text"
                    placeholder="Commentaire de l'évaluateur qualité..."
                    value={item?.comment || ''}
                    onChange={(e) => handleCommentChange(crit.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      background: 'rgba(0,0,0,0.25)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
