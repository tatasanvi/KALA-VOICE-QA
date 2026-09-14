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
        totalWeightedScore += itemRatio * crit.weight;
        totalWeight += crit.weight;
      }
    });

    if (totalWeight === 0) return 0;
    return Math.round((totalWeightedScore / totalWeight) * 100);
  }

  /**
   * Générateur d'évaluation assistée par IA avec extraction de citations probatoires
   */
  public static generateAiSuggestedEvaluation(
    call: Call, 
    criteria: QualityCriterion[],
    evaluatorName: string
  ): QualityEvaluation {
    const items: QualityEvaluationItem[] = criteria.map(crit => {
      let proposedScore = 8;
      let quote = "";
      let relevance = "";

      // Heuristiques d'analyse pour chaque catégorie
      if (crit.id === 'crit-1') {
        // Accueil
        const firstSeg = call.transcription.segments[0];
        if (firstSeg && firstSeg.speaker === 'AGENT') {
          proposedScore = 10;
          quote = firstSeg.text;
          relevance = "Formule d'accueil complète et identification de l'agent";
        }
      } else if (crit.id === 'crit-2') {
        // Authentification
        const authSeg = call.transcription.segments.find(s => 
          s.speaker === 'AGENT' && (s.text.toLowerCase().includes('contrat') || s.text.toLowerCase().includes('numéro'))
        );
        if (authSeg) {
          proposedScore = 10;
          quote = authSeg.text;
          relevance = "Demande d'authentification du client effectuée dès l'ouverture";
        } else {
          proposedScore = 4;
          relevance = "Aucune question d'identification explicite détectée";
        }
      } else if (crit.id === 'crit-5') {
        // Reformulation
        const reformSeg = call.transcription.segments.find(s => 
          s.speaker === 'AGENT' && (s.text.toLowerCase().includes('résume') || s.text.toLowerCase().includes('comprends'))
        );
        if (reformSeg) {
          proposedScore = 9;
          quote = reformSeg.text;
          relevance = "Reformulation du problème technique observée";
        } else {
          proposedScore = 6;
          relevance = "Absence de reformulation formelle";
        }
      } else if (crit.id === 'crit-10') {
        // Qualité communication / interruptions
        if (call.analytics.interruptionCount > 3) {
          proposedScore = 6;
          relevance = `${call.analytics.interruptionCount} interruptions détectées`;
        } else {
          proposedScore = 9;
        }
      } else if (crit.id === 'crit-11') {
        // Résolution
        proposedScore = call.analytics.resolutionStatus === 'RÉSOLU' ? 10 : 6;
      }

      return {
        id: `item-${crit.id}-${Date.now()}`,
        criterionId: crit.id,
        score: proposedScore,
        aiProposedScore: proposedScore,
        aiConfidence: 0.90,
        isAiAccepted: true,
        comment: `Suggestion IA : Critère évalué à ${proposedScore}/${crit.maxScore}.`,
        transcriptEvidenceQuotes: quote ? [{
          segmentId: 'seg-quote',
          timestamp: 10,
          quote,
          relevanceNote: relevance
        }] : []
      };
    });

    const overallScore = this.calculateOverallScore(items, criteria);

    return {
      id: `eval-${call.id}`,
      callId: call.id,
      agentId: call.agentId,
      evaluatorId: 'user-qa',
      evaluatorName: `${evaluatorName} (Assisté par IA)`,
      formTitle: 'Grille d\'Évaluation Standardisée KALA v2.4',
      overallScore,
      aiSuggestedScore: overallScore,
      status: 'PROPOSITION_IA',
      items,
      strengths: [
        "Bonne clarté d'élocution",
        "Maîtrise du processus d'identification",
        "Courtoisie et calme maintenus"
      ],
      weaknesses: [
        "Vigilance sur le temps de parole respectif",
        "Approfondir la gestion des objections concurrentes"
      ],
      potentialErrors: [],
      unmetCriteriaCount: items.filter(it => it.score < 7).length,
      recommendations: [
        "Suggestion IA — À valider par le responsable qualité avant prise en compte officielle dans le score agent."
      ],
      evaluatorFinalNotes: "Évaluation pré-générée automatiquement par le moteur d'analyse IA. En attente de revue par le superviseur qualité.",
      evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
  }
}
