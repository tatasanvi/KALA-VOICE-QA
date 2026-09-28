#  KALA VOICE QA

> **Plateforme Intelligente d'Analyse Vocale, Qualité & Coaching pour Centres de Contacts**
>
> *Mémoire de Master 2 – IA & Big Data | Amélioration de la Transcription Vocale en Milieux Bruités*

---

## Lancer la démonstration (3 services)

```bash
npm run dev:all
```

Démarre ensemble :

- le service de transcription Python (Whisper-small, port 8500) ;
- le backend Express + SQLite (port 8000) ;
- le frontend Vite (port 5173).

Prérequis : `ffmpeg`, l'environnement Python installé une fois (`asr-service/README.md`),
et un fichier `backend/.env` créé à partir de `backend/.env.example` :

```bash
cp backend/.env.example backend/.env
```

Renseignez-y `JWT_SECRET` (`openssl rand -hex 32`). Pour disposer des comptes de
démonstration en local, mettez `SEED_DEMO_ACCOUNTS=true` et choisissez un
`DEMO_PASSWORD`. En production (`NODE_ENV=production`), le serveur refuse de
démarrer sans `JWT_SECRET` et ne crée jamais de compte de démonstration ; les
comptes marqués `must_change_password` doivent voir leur mot de passe changé
avant tout usage réel (l'écran de changement n'est pas encore implémenté).
Sans le service Python, la transcription renvoie « Service de transcription non démarré » ;
sans le backend, la connexion bascule en mode local et l'import est indisponible.

Trois comptes de démonstration, dont le mot de passe est celui de `DEMO_PASSWORD` :
`admin@kalavoice.ai` (ADMIN), `qualite@kalavoice.ai` (QUALITE_FORMATION),
`agent@kalavoice.ai` (AGENT). L'ingestion audio est réservée aux rôles ADMIN et
QUALITE_FORMATION.

## 📋 Description du Projet

**KALA VOICE QA** est une plateforme professionnelle SaaS B2B conçue pour les centres d'appels. Elle combine l'amélioration de la transcription vocale en milieux bruités avec l'analyse conversationnelle avancée, le contrôle qualité assisté par IA et le coaching personnalisé des conseillers.

### Chaîne de valeur complète :
```
AUDIO → TRANSCRIPTION → ANALYSE IA → CONTRÔLE QUALITÉ → COACHING → FORMATION → SUIVI DE PERFORMANCE
```

---

##  Fonctionnalités Clés

| Module | Description |
|--------|-------------|
|  **Tableau de Bord Exécutif** | KPIs temps réel, métriques centre d'appels |
|  **Registre des Appels** | Gestion et filtrage des enregistrements |
|  **Studio de Transcription** | Transcription synchronisée avec lecteur audio interactif |
|  **Analyse NLP** | Sentiment, entités, mots-clés, sujets détectés |
|  **Contrôle Qualité** | Évaluation multicritères assistée IA |
|  **Coaching & Recommandations** | Plans de développement personnalisés |
|  **Académie de Formation** | Modules de formation intégrés |
|  **Fiches Conseillers 360°** | Profils détaillés et évolution des performances |
|  **Rapports & Synthèses** | Exports PDF/CSV automatisés |
|  **Laboratoire Expérimental ASR** | Benchmark WER/CER/RTF sur pipelines de débruitage |
|  **Audit & Sécurité** | Traçabilité complète, RGPD-compliant |

---

##  Module Recherche (Mémoire Master)

Le **Laboratoire Expérimental ASR** est le cœur de la contribution scientifique :

- **Débruitage audio** : Test de 4 pipelines (Wiener, Spectral Subtraction, RNNoise, DeepFilterNet)
- **Métriques ASR** : WER (Word Error Rate), CER (Character Error Rate), RTF (Real-Time Factor)
- **Amélioration du SNR** (Signal-to-Noise Ratio)
- **Analyse d'erreurs** : Substitutions, suppressions, insertions (distance de Levenshtein)
- **Benchmark comparatif** multi-configurations pour valider l'hypothèse de recherche

---

##  Architecture Technique

```
KALA VOICE QA
├── Frontend (React 18 + TypeScript + Vite)
│   ├── /src/components/views/     # 12 vues métier
│   ├── /src/components/common/    # Composants partagés
│   ├── /src/services/             # Couche services
│   │   ├── storageService.ts      # Persistance & état
│   │   ├── audioSignalService.ts  # Traitement audio (Web Audio API)
│   │   ├── qualityService.ts      # Moteur QA & scoring
│   │   ├── experimentService.ts   # Calculs WER/CER/RTF
│   │   └── reportService.ts       # Génération de rapports
│   ├── /src/types/index.ts        # Modèles de données TypeScript
│   └── /src/data/initialData.ts   # Données de démonstration réalistes
└── Configuration
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
```

---

##  Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- Navigateur moderne (Chrome 90+, Firefox 88+, Edge 90+)

---

##  Installation & Lancement

```bash
# Cloner le dépôt
git clone https://github.com/tatasanvi/KALA-VOICE-QA.git
cd KALA-VOICE-QA

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
# → Application disponible sur http://localhost:5173/
```

---

##  Rôles Utilisateurs

L'application supporte **5 profils** avec navigation adaptée :

| Rôle | Accès Principal |
|------|----------------|
|  **Admin** | Toutes les fonctionnalités + paramètres système |
|  **Superviseur** | Tableaux de bord, appels, performance équipes |
|  **QA Manager** | Contrôle qualité, évaluations, rapports |
|  **Formateur** | Coaching, formation, profils agents |
|  **Agent** | Propre profil, transcriptions, formations |

---

##  Stack Technologique

- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite 5
- **Styling** : CSS Variables + Design System custom (dark mode premium)
- **Audio** : Web Audio API (synthèse, analyse, playback)
- **Persistance** : localStorage avec état réactif
- **Rapports** : Génération HTML → PDF navigateur

---

##  Licence

Projet académique – Mémoire Master 2 IA & Big Data.

---

##  Auteur

Développé dans le cadre du Mémoire de Master 2, option **IA & Big Data**.

*Thématique : Amélioration de la transcription vocale automatique (ASR) en milieux bruités appliquée aux centres de contacts.*
