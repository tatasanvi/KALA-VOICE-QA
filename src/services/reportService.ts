// ============================================================================
// Service d'Export & de Génération de Rapports (CSV & PDF / Print)
// ============================================================================

import { Call, QualityEvaluation, Agent } from '../types';

const escapeHtml = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export class ReportService {
  /**
   * Export CSV de la liste des appels
   */
  public static exportCallsToCSV(calls: Call[]): void {
    const headers = [
      "Numero_Appel",
      "Agent",
      "Campagne",
      "Date",
      "Duree_Sec",
      "Type",
      "Niveau_Bruit",
      "SNR_dB",
      "Score_Qualite",
      "Statut_Resolution",
      "Interruptions"
    ];

    const rows = calls.map(c => [
      `"${c.callNumber}"`,
      `"${c.agentName}"`,
      `"${c.campaignName}"`,
      `"${c.callDate}"`,
      c.durationSeconds,
      `"${c.callType}"`,
      `"${c.audioMetadata.estimatedNoiseLevel}"`,
      c.audioMetadata.snrDb ?? '',
      c.qualityScore ?? "N/A",
      `"${c.analytics.resolutionStatus}"`,
      c.analytics.interruptionCount
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');

    this.downloadFile(csvContent, `KALA_Export_Appels_${Date.now()}.csv`);
  }

  /**
   * Impression / Export PDF stylisé d'une fiche d'appel & audit qualité
   */
  public static printCallQualityReport(call: Call, evaluation?: QualityEvaluation, agent?: Agent): void {
    const callNumber = escapeHtml(call.callNumber);
    const evaluatorName = escapeHtml(evaluation?.evaluatorName || 'Non renseigné');
    const evaluationStatus = escapeHtml(evaluation?.status || 'Non évalué');
    const callDate = escapeHtml(call.callDate);
    const agentName = escapeHtml(call.agentName);
    const campaignName = escapeHtml(call.campaignName);
    const customer = escapeHtml(`${call.customerNameMasked} (${call.customerPhoneMasked})`);
    const noiseLevel = escapeHtml(call.audioMetadata.estimatedNoiseLevel);
    const summary = escapeHtml(call.analytics.summary);
    const contactIntent = escapeHtml(call.analytics.contactIntent);
    const resolutionStatus = escapeHtml(call.analytics.resolutionStatus);
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport d'Audit Qualité · ${call.callNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.5; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .brand { font-size: 24px; font-weight: 800; color: #1e40af; }
          .subtitle { color: #64748b; font-size: 14px; }
          .score-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .score-val { font-size: 38px; font-weight: 800; color: #2563eb; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
          .card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; }
          .card h3 { margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 13px; }
          th { background: #f8fafc; color: #475569; }
          .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .tag-green { background: #dcfce7; color: #15803d; }
          .tag-amber { background: #fef3c7; color: #b45309; }
          .disclaimer { font-size: 11px; color: #94a3b8; font-style: italic; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
          <div class="brand">KALA VOICE QA · Audit Qualité & Interaction Vocale</div>
            <div class="subtitle">Rapport d'appel</div>
          </div>
          <div style="text-align: right;">
            <div><strong>N° Appel :</strong> ${callNumber}</div>
            <div><strong>Date :</strong> ${callDate}</div>
          </div>
        </div>

        <div class="score-card">
          <div>
            <h2 style="margin: 0; font-size: 20px;">Score Qualité de l'Appel</h2>
            <div style="color: #64748b;">Évaluateur : ${evaluatorName}</div>
            <div style="color: #64748b;">Statut : <strong>${evaluationStatus}</strong></div>
          </div>
          <div style="text-align: right;">
            <div class="score-val">${call.qualityScore == null ? 'Non évalué' : `${call.qualityScore} / 100`}</div>
            ${call.qualityScore == null ? '' : '<span class="tag tag-green">Score qualité enregistré</span>'}
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Informations Appel & Agent</h3>
            <p><strong>Agent :</strong> ${agentName}</p>
            <p><strong>Campagne :</strong> ${campaignName}</p>
            <p><strong>Client :</strong> ${customer}</p>
            <p><strong>Durée audio :</strong> ${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s</p>
          </div>
          <div class="card">
            <h3>Qualité Signal & Environnement</h3>
            <p><strong>Niveau de bruit ambiant :</strong> ${noiseLevel}</p>
            <p><strong>Rapport Signal/Bruit (SNR) :</strong> ${call.audioMetadata.snrDb ?? 'non mesuré'}</p>
            <p><strong>Interruptions de parole :</strong> ${call.analytics.interruptionCount}</p>
            <p><strong>Ratio de parole Agent/Client :</strong> ${call.analytics.talkToListenRatio}x</p>
          </div>
        </div>

        <div class="card" style="margin-bottom: 25px;">
          <h3>Synthèse & Résumé IA de l'Interaction</h3>
          <p>${summary}</p>
          <p><strong>Motif détecté :</strong> ${contactIntent}</p>
          <p><strong>Résolution :</strong> <span>${resolutionStatus}</span></p>
        </div>

        <div class="disclaimer">
          KALA VOICE QA · Plateforme d'optimisation de la qualité et d'expérimentation en transcription vocale bruitée.<br/>
          Les informations affichées correspondent aux données enregistrées pour cet appel.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printFrame = document.createElement('iframe');
    printFrame.title = `Impression du rapport ${callNumber}`;
    printFrame.style.position = 'fixed';
    printFrame.style.width = '1px';
    printFrame.style.height = '1px';
    printFrame.style.left = '-10000px';
    printFrame.style.border = '0';
    printFrame.onload = () => {
      const printWindow = printFrame.contentWindow;
      if (!printWindow) {
        printFrame.remove();
        alert("L'impression n'a pas pu démarrer. Réessayez depuis le rapport.");
        return;
      }
      printWindow.addEventListener('afterprint', () => printFrame.remove(), { once: true });
      printWindow.focus();
      printWindow.print();
      window.setTimeout(() => printFrame.remove(), 60000);
    };
    document.body.appendChild(printFrame);
    printFrame.srcdoc = html;
  }

  private static downloadFile(content: string, filename: string): void {
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
