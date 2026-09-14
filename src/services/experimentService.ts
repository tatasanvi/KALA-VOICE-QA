// ============================================================================
// Service d'Expérimentation Scientifique (Mémoire Master IA & Big Data)
// Calcul rigoureux des métriques ASR : WER, CER, RTF, Matrice de Levenshtein
// ============================================================================

export interface AlignmentDiffToken {
  type: 'CORRECT' | 'SUBSTITUTION' | 'DELETION' | 'INSERTION';
  referenceWord?: string;
  hypothesisWord?: string;
}

export interface WerDetailedResult {
  wer: number; // en %
  cer: number; // en %
  substitutions: number;
  deletions: number;
  insertions: number;
  totalRefWords: number;
  alignment: AlignmentDiffToken[];
}

export class ExperimentService {
  /**
   * Normalisation linguistique standard pour évaluation ASR (NIST sclite standard)
   */
  public static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calcul du WER avec alignement optimal de Levenshtein (Programmation dynamique)
   */
  public static calculateDetailedWER(reference: string, hypothesis: string): WerDetailedResult {
    const refWords = this.normalizeText(reference).split(' ').filter(w => w.length > 0);
    const hypWords = this.normalizeText(hypothesis).split(' ').filter(w => w.length > 0);

    const m = refWords.length;
    const n = hypWords.length;

    if (m === 0) {
      return {
        wer: n > 0 ? 100 : 0,
        cer: 0,
        substitutions: 0,
        deletions: 0,
        insertions: n,
        totalRefWords: 0,
        alignment: hypWords.map(w => ({ type: 'INSERTION', hypothesisWord: w }))
      };
    }

    // Matrice de distances D[i][j] et matrice d'opérations
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const ops: ('C' | 'S' | 'D' | 'I')[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill('C'));

    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
      ops[i][0] = 'D';
    }
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
      ops[0][j] = 'I';
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (refWords[i - 1] === hypWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          ops[i][j] = 'C';
        } else {
          const subCost = dp[i - 1][j - 1] + 1;
          const delCost = dp[i - 1][j] + 1;
          const insCost = dp[i][j - 1] + 1;

          if (subCost <= delCost && subCost <= insCost) {
            dp[i][j] = subCost;
            ops[i][j] = 'S';
          } else if (delCost <= insCost) {
            dp[i][j] = delCost;
            ops[i][j] = 'D';
          } else {
            dp[i][j] = insCost;
            ops[i][j] = 'I';
          }
        }
      }
    }

    // Backtracking pour extraire l'alignement précis
    let i = m;
    let j = n;
    let substitutions = 0;
    let deletions = 0;
    let insertions = 0;
    const revAlignment: AlignmentDiffToken[] = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && ops[i][j] === 'C') {
        revAlignment.push({
          type: 'CORRECT',
          referenceWord: refWords[i - 1],
          hypothesisWord: hypWords[j - 1]
        });
        i--;
        j--;
      } else if (i > 0 && j > 0 && ops[i][j] === 'S') {
        substitutions++;
        revAlignment.push({
          type: 'SUBSTITUTION',
          referenceWord: refWords[i - 1],
          hypothesisWord: hypWords[j - 1]
        });
        i--;
        j--;
      } else if (i > 0 && ops[i][j] === 'D') {
        deletions++;
        revAlignment.push({
          type: 'DELETION',
          referenceWord: refWords[i - 1]
        });
        i--;
      } else {
        insertions++;
        revAlignment.push({
          type: 'INSERTION',
          hypothesisWord: hypWords[j - 1]
        });
        j--;
      }
    }

    const alignment = revAlignment.reverse();
    const wer = Math.round(((substitutions + deletions + insertions) / m) * 1000) / 10;
    const cer = this.calculateCER(reference, hypothesis);

    return {
      wer,
      cer,
      substitutions,
      deletions,
      insertions,
      totalRefWords: m,
      alignment
    };
  }

  /**
   * Calcul du CER (Character Error Rate)
   */
  public static calculateCER(reference: string, hypothesis: string): number {
    const refChars = this.normalizeText(reference).replace(/\s+/g, '');
    const hypChars = this.normalizeText(hypothesis).replace(/\s+/g, '');

    const m = refChars.length;
    const n = hypChars.length;

    if (m === 0) return n > 0 ? 100 : 0;

    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (refChars[i - 1] === hypChars[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return Math.round((dp[m][n] / m) * 1000) / 10;
  }

  /**
   * Calcul du Real-Time Factor (RTF)
   */
  public static calculateRTF(processingTimeMs: number, audioDurationSeconds: number): number {
    if (audioDurationSeconds <= 0) return 0;
    return Math.round((processingTimeMs / 1000 / audioDurationSeconds) * 100) / 100;
  }
}
