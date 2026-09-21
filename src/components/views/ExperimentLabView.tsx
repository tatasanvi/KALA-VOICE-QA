import React, { useState } from 'react';
import { 
  FlaskConical, Activity, CheckCircle2, TrendingUp, 
  Download, Play, Sparkles, BookOpen, Layers, ArrowRight
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ExperimentService, WerDetailedResult } from '../../services/experimentService';
import { UserRole } from '../../types';

interface ExperimentLabViewProps {
  currentRole: UserRole;
}

export const ExperimentLabView: React.FC<ExperimentLabViewProps> = () => {
  const configs = storageService.getExperimentConfigs();
  const samples = storageService.getBenchmarkSamples();

  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[0].id);
  const activeSample = samples.find(s => s.id === selectedSampleId) || samples[0];

  // Sandbox personnalisé pour test interactif en direct devant le jury
  const [customRef, setCustomRef] = useState<string>("Bonjour bienvenue chez Télécom Fibre que puis-je faire pour vous ?");
  const [customHyp, setCustomHyp] = useState<string>("Bonjour bienvenue chez Télécom Fib que puis faire pour vous ?");
  const [liveResult, setLiveResult] = useState<WerDetailedResult | null>(() => 
    ExperimentService.calculateDetailedWER("Bonjour bienvenue chez Télécom Fibre que puis-je faire pour vous ?", "Bonjour bienvenue chez Télécom Fib que puis faire pour vous ?")
  );

  const handleComputeLive = () => {
    const res = ExperimentService.calculateDetailedWER(customRef, customHyp);
    setLiveResult(res);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* En-tête Scientifique Académique */}
      <div className="glass-panel" style={{ border: '1px solid rgba(192, 132, 252, 0.4)', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlaskConical size={20} color="#fff" />
              </div>
              <div>
                <span className="badge badge-purple" style={{ fontSize: '11px', marginBottom: '2px' }}>
                  DÉMONSTRATEUR SCIENTIFIQUE • MÉMOIRE MASTER IA & BIG DATA
                </span>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f3e8ff' }}>
                  Laboratoire d'Évaluation ASR en Milieux Bruités
                </h1>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#c4b5fd', marginTop: '8px', maxWidth: '850px', lineHeight: 1.5 }}>
              Ce module présente 4 configurations de chaînes de traitement envisagées et des exemples textuels illustrant le calcul du WER. Aucune de ces configurations n'a encore été mesurée sur de l'audio réel : seuls les WER et CER calculés à partir des textes affichés sont réels.
            </p>
          </div>

        </div>
      </div>

      {/* Tableau Récapitulatif Scientifique : 4 Configurations en Compétition */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
          Configurations de pipeline envisagées
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Aucune mesure réelle n'a encore été effectuée pour ces configurations : aucun WER, CER, temps de calcul ni gain de SNR n'est affiché.
        </p>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Configuration de Pipeline</th>
                <th>Prétraitement & Débruitage</th>
                <th>Modèle Acoustique / ASR</th>
                <th>Mesure</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(cfg => (
                <tr key={cfg.id} style={{ background: cfg.category === 'PIPELINE_COMPLET_KALA' ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
                  <td>
                    <div style={{ fontWeight: 700, color: cfg.category === 'PIPELINE_COMPLET_KALA' ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                      {cfg.name}
                    </div>
                    <span className="badge badge-gray" style={{ fontSize: '10px' }}>{cfg.category}</span>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {cfg.denoiserAlgorithm}
                  </td>
                  <td style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}>
                    {cfg.asrModel}
                  </td>
                  <td>
                    <span className="badge badge-gray">Non mesurée</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banc d'Échantillons de Test & Visualiseur de Diffs */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
              Exemples textuels d'erreurs de transcription
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Textes d'exemple rédigés à la main, pas des sorties d'un modèle ASR. Le WER et le CER ci-dessous sont calculés en direct à partir de ces textes.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Cas d'étude :</span>
            <select 
              value={activeSample.id}
              onChange={(e) => setSelectedSampleId(e.target.value)}
              className="role-select"
              style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}
            >
              {samples.map(s => (
                <option key={s.id} value={s.id}>{s.sampleName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vérité Terrain (Ground Truth) */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: '#34d399', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
            Texte de référence (exemple) :
          </div>
          <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#f0fdf4' }}>
            « {activeSample.groundTruthText} »
          </div>
        </div>

        {/* Comparaison des 4 sorties ASR sur cet échantillon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeSample.results.map((res, idx) => {
            const detailed = ExperimentService.calculateDetailedWER(activeSample.groundTruthText, res.predictedText);

            return (
              <div 
                key={res.configId}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: res.configId === 'cfg-kala-full' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: res.configId === 'cfg-kala-full' ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                      {res.configName}
                    </span>
                    {res.configId === 'cfg-kala-full' && (
                      <span className="badge badge-blue">Pipeline Proposé KALA</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${detailed.wer === 0 ? 'badge-green' : detailed.wer <= 15 ? 'badge-amber' : 'badge-red'}`} style={{ fontWeight: 800 }}>
                      WER calculé : {detailed.wer}%
                    </span>
                    <span className="badge badge-gray">CER calculé : {detailed.cer}%</span>
                  </div>
                </div>

                {/* Affichage du Texte avec Alignement de Levenshtein Coloré */}
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', lineHeight: 1.8 }}>
                  {detailed.alignment.map((token, tIdx) => {
                    if (token.type === 'CORRECT') {
                      return <span key={tIdx} className="diff-token diff-correct">{token.hypothesisWord} </span>;
                    } else if (token.type === 'SUBSTITUTION') {
                      return (
                        <span key={tIdx} className="diff-token diff-substitution" title={`Substitué ! Attendu : "${token.referenceWord}"`}>
                          {token.hypothesisWord} 
                        </span>
                      );
                    } else if (token.type === 'DELETION') {
                      return (
                        <span key={tIdx} className="diff-token diff-deletion" title="Mot manquant / omis par le modèle">
                          [{token.referenceWord}] 
                        </span>
                      );
                    } else {
                      return (
                        <span key={tIdx} className="diff-token diff-insertion" title="Mot inséré / halluciné">
                          +{token.hypothesisWord} 
                        </span>
                      );
                    }
                  })}
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>Substitutions (S) : <strong>{detailed.substitutions}</strong></span>
                  <span>Omissions (D) : <strong>{detailed.deletions}</strong></span>
                  <span>Insertions (I) : <strong>{detailed.insertions}</strong></span>
                  <span>Total Mots Référence (N) : <strong>{detailed.totalRefWords}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sandbox Expérimental Interactif (Démonstration Directe Devant le Jury) */}
      <div className="glass-panel" style={{ borderLeft: '4px solid #8b5cf6' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
          Calculateur Dynamique de WER & Levenshtein en Temps Réel
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Saisissez ou modifiez deux phrases pour tester la robustesse de l'algorithme d'alignement durant la soutenance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', display: 'block', marginBottom: '4px' }}>
              Phrase de Référence (Vérité Terrain) :
            </label>
            <textarea 
              value={customRef}
              onChange={(e) => setCustomRef(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px', outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#60a5fa', display: 'block', marginBottom: '4px' }}>
              Hypothèse ASR Prédite :
            </label>
            <textarea 
              value={customHyp}
              onChange={(e) => setCustomHyp(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px', outline: 'none'
              }}
            />
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleComputeLive} style={{ marginBottom: '16px' }}>
          <Sparkles size={14} />
          <span>Calculer Métriques Levenshtein</span>
        </button>

        {liveResult && (
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: liveResult.wer === 0 ? '#34d399' : '#fbbf24' }}>
                WER : {liveResult.wer}%
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#60a5fa' }}>
                CER : {liveResult.cer}%
              </span>
              <span className="badge badge-gray">Substitutions : {liveResult.substitutions}</span>
              <span className="badge badge-gray">Omissions : {liveResult.deletions}</span>
              <span className="badge badge-gray">Insertions : {liveResult.insertions}</span>
            </div>

            <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
              {liveResult.alignment.map((tok, idx) => {
                if (tok.type === 'CORRECT') return <span key={idx} className="diff-token diff-correct">{tok.hypothesisWord} </span>;
                if (tok.type === 'SUBSTITUTION') return <span key={idx} className="diff-token diff-substitution">[{tok.referenceWord} → {tok.hypothesisWord}] </span>;
                if (tok.type === 'DELETION') return <span key={idx} className="diff-token diff-deletion">[-{tok.referenceWord}] </span>;
                return <span key={idx} className="diff-token diff-insertion">[+{tok.hypothesisWord}] </span>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
