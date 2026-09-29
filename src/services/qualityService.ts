// ============================================================================
// Service d'Évaluation Qualité & Scoring Métier Contact Center
// ============================================================================

import { QualityCriterion, QualityEvaluation, QualityEvaluationItem, Call } from '../types';

export class QualityService {
  /**
   * Calcul pondéré de la note globale qualité sur 100
   */
  public static calculateOverallScore(
    items: QualityEvaluationItem[], 
    criteria: QualityCriterion[]
  ): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    criteria.forEach(crit => {
      const item = items.find(it => it.criterionId === crit.id);
      if (item) {
        const itemRatio = item.score / crit.maxScore;
        if (item.isScored !== false) {
          totalWeightedScore += itemRatio * crit.weight;
          totalWeight += crit.weight;
        }
      }
    });

    if (totalWeight === 0) return 0;
    return Math.round((totalWeightedScore / totalWeight) * 100);
  }

  /** Crée un brouillon vide : aucune note ni recommandation n'est préremplie. */
  public static createManualEvaluation(
    call: Call, 
    criteria: QualityCriterion[],
    evaluatorName: string
  ): QualityEvaluation {
    const items: QualityEvaluationItem[] = criteria.map(crit => ({
      id: `item-${crit.id}-${call.id}`,
      criterionId: crit.id,
      score: 0,
      aiProposedScore: 0,
      aiConfidence: 0,
      isAiAccepted: false,
      isScored: false,
      comment: '',
      transcriptEvidenceQuotes: [],
    }));

    return {
      id: `eval-${call.id}`,
      callId: call.id,
      agentId: call.agentId,
      evaluatorId: 'user-qa',
      evaluatorName,
      formTitle: 'Évaluation manuelle',
      overallScore: 0,
      aiSuggestedScore: 0,
      status: 'EN_COURS',
      items,
      strengths: [],
      weaknesses: [],
      potentialErrors: [],
      unmetCriteriaCount: items.filter(it => it.score < 7).length,
      recommendations: [],
      evaluatorFinalNotes: '',
      evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
  }
}
