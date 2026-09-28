import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: '22px' }}>
    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
    <div style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{children}</div>
  </section>
);

const ToComplete: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong style={{ color: '#d9ae55' }}>[À COMPLÉTER : {children}]</strong>
);

// Page d'information sur le traitement des données. Le contenu décrit ce que
// l'application fait réellement aujourd'hui : rien n'y est anticipé.
export const PrivacyView: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
    <div className="glass-panel" style={{ padding: '22px 26px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <Shield size={20} color="var(--primary-light)" />
        <h2 style={{ fontSize: '19px', fontWeight: 800 }}>Protection des données (RGPD)</h2>
      </div>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Dernière mise à jour : <ToComplete>date de publication</ToComplete>
      </p>

      <div style={{
        display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px',
        background: 'var(--warning-bg)', border: '1px solid var(--warning-border)',
        borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '22px', color: '#e8cf9f'
      }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          KALA Voice QA est un <strong>démonstrateur académique</strong>, réalisé dans le cadre d'un mémoire de
          Master 2. Il n'est pas exploité en production et ne traite, à ce jour, aucune donnée d'appel réel.
        </span>
      </div>

      <Section title="Quelles données sont traitées">
        Lorsqu'un fichier audio est importé, il est transcrit par un service local, puis la transcription est
        enregistrée : texte, segments horodatés, modèle utilisé, durée et temps de traitement. Si une
        transcription de référence est saisie, le WER et le CER mesurés sont enregistrés avec elle. Les comptes
        des utilisateurs (nom, adresse e-mail, rôle) et un journal d'audit des actions sensibles sont également
        conservés. Une transcription peut contenir des données personnelles, puisqu'elle restitue le contenu
        d'une conversation.
      </Section>

      <Section title="L'audio n'est pas conservé par défaut">
        Le fichier audio n'existe qu'en mémoire le temps de la transcription, puis il est abandonné : c'est le
        principe du traitement en flux. Une option explicite, désactivée par défaut, permet de le conserver sur
        le serveur ; chaque appel enregistré indique si son audio a été conservé ou non.
      </Section>

      <Section title="Finalité">
        Contrôle qualité des échanges et formation des conseillers : évaluation assistée, restitution aux
        personnes concernées et suivi des demandes de révision. La transcription sert d'aide à l'évaluation
        humaine, jamais de décision automatisée.
      </Section>

      <Section title="Base légale">
        <ToComplete>base légale retenue : intérêt légitime, obligation contractuelle ou consentement</ToComplete>.
        Le choix dépend du cadre d'exploitation et doit être arrêté par le responsable de traitement avant tout
        usage réel. Dans le cadre du démonstrateur, seules des voix de test sont utilisées.
      </Section>

      <Section title="Durée de conservation">
        <ToComplete>durée de conservation des transcriptions et du journal d'audit</ToComplete>. Techniquement,
        les durées sont paramétrables et aucune suppression automatique n'est active dans le démonstrateur.
      </Section>

      <Section title="Accès aux données">
        Les droits sont appliqués côté serveur. Un conseiller n'accède qu'à ses propres appels, évaluations et
        plan de coaching. Les profils Qualité et Formation accèdent aux données de leur périmètre, et
        l'administrateur à la gestion des comptes et au journal d'audit.
      </Section>

      <Section title="Droits des personnes">
        Toute personne concernée dispose d'un droit d'accès, de rectification, d'effacement, de limitation et
        d'opposition, ainsi que du droit d'introduire une réclamation auprès de l'autorité de contrôle
        compétente. Un conseiller peut en outre contester une évaluation qui le concerne : la demande est
        transmise à un responsable, qui seul peut modifier l'évaluation.
      </Section>

      <Section title="Responsable de traitement et contact">
        Responsable de traitement : <ToComplete>entité juridique et adresse</ToComplete>.<br />
        Contact pour l'exercice des droits : <ToComplete>adresse e-mail de contact</ToComplete>.<br />
        Délégué à la protection des données, le cas échéant : <ToComplete>coordonnées du DPO</ToComplete>.
      </Section>

      <Section title="Sous-traitance et transferts">
        La transcription s'exécute localement, sur la machine qui héberge l'application : aucun envoi vers un
        service tiers, et aucun transfert hors de l'Union européenne dans la configuration actuelle. Tout
        hébergement futur devra être documenté ici : <ToComplete>hébergeur et localisation</ToComplete>.
      </Section>
    </div>
  </div>
);
