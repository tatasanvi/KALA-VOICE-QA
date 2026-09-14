# 📘 KALA VOICE QA — GUIDE DE HANDOVER & PASSATION COLLABORATEUR

Bienvenue sur le projet **KALA VOICE QA** ! Ce document a été rédigé pour vous permettre de prendre en main, exécuter, comprendre et enrichir l'application **immédiatement**, sans repartir de zéro et sans ambiguïté.

---

## 1. Vue d'Ensemble du Projet

**KALA VOICE QA** est une plateforme SaaS pour centres d'appels combinant :
1. **ASR & Débruitage Acoustique** : Amélioration de la transcription vocale en milieu bruité (KALA-Denoiser spectral + Whisper-v3).
2. **Contrôle Qualité (QA Assistée)** : Grilles d'évaluation automatisées et assistées par IA (calcul du WER/CER, scoring, détection des non-conformités).
3. **Coaching & Académie Métier** : Plans de coaching individualisés, sessions de formation et suivi du gain de performance (+uplift).
4. **Tableaux de Bord & Gouvernance (RBAC)** : Cloisonnement strict des accès par profil avec traçabilité intégrale (journal d'audit RGPD).
5. **Connecteur Téléphonie CTI** : Ingestion d'enregistrements audio (.wav, .mp3) et simulateur de flux CTI (Genesys, Asterisk, Twilio).

---

## 2. Architecture Technique

Le projet repose sur un modèle moderne **Frontend React + Backend REST API + Base SQLite** :

```
KALA VOICE QA/
├── backend/                       ← Serveur Node.js / Express
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts          ← Tables Drizzle ORM (Users, Calls, QA, Coaching, Audit)
│   │   │   ├── migrate.ts         ← Création auto des tables & seed au boot
│   │   │   ├── seed.ts            ← Script d'initialisation manuelle
│   │   │   └── index.ts           ← Connexion better-sqlite3 (WAL mode)
│   │   ├── middleware/
│   │   │   ├── auth.ts            ← Vérification token JWT + Guard RBAC
│   │   │   └── audit.ts           ← Journalisation automatique des mutations
│   │   ├── routes/
│   │   │   ├── auth.ts            ← POST /api/auth/login, GET /api/auth/me
│   │   │   ├── users.ts           ← CRUD utilisateurs complet (Admin)
│   │   │   ├── calls.ts           ← CRUD appels + correction segments
│   │   │   └── index.ts           ← QA, Coaching, Training, CTI, Audit, Métriques
│   │   └── index.ts               ← Serveur Express (port 8000)
│   └── package.json
│
├── src/                           ← Frontend React 18 + TypeScript + Vite
│   ├── components/
│   │   ├── common/                ← Navbar, Sidebar, LoginModal, AudioUploadModal
│   │   └── views/
│   │       ├── DashboardView.tsx          ← Synthèse exécutive & métriques
│   │       ├── CallsView.tsx              ← Registre des appels & Ingestion audio
│   │       ├── TranscriptionStudioView.tsx← Studio synchronisé & correction
│   │       ├── NlpAnalyticsView.tsx       ← Analyse sémantique & sentiments
│   │       ├── QualityControlView.tsx     ← Grille QA & scoring pondéré
│   │       ├── CoachingView.tsx           ← Plans d'amélioration conseillers
│   │       ├── TrainingView.tsx           ← Académie & modules de formation
│   │       ├── AgentProfileView.tsx       ← Fiches conseillers 360°
│   │       ├── TeamsCampaignsView.tsx     ← Campagnes, Équipes & Simulateur CTI
│   │       ├── ReportsView.tsx            ← Générateur de rapports CSV / PDF
│   │       ├── ExperimentLabView.tsx      ← Lab ASR (WER, CER, SNR, RTF)
│   │       ├── SettingsAuditView.tsx      ← RGPD, Paramètres & Journal d'Audit
│   │       └── UserManagementView.tsx     ← Gestion CRUD des comptes & rôles
│   ├── services/
│   │   ├── apiClient.ts           ← Client HTTP typé avec auto-Bearer JWT
│   │   ├── storageService.ts      ← Cache réactif local & gestion d'état
│   │   └── reportService.ts       ← Exportateur CSV et impression fiches
│   ├── types/                     ← Modèles TypeScript unifiés
│   ├── data/                      ← Données initiales de test
│   └── App.tsx                    ← Routeur d'onglets & gestion de session
│
├── package.json                   ← Scripts racine (concurrently)
└── vite.config.ts                 ← Configuration proxy /api -> :8000
```

---

## 3. Démarrage Rapide (En 1 minute)

### Prérequis
* **Node.js** v18+ installé (`node -v`)
* **npm** v9+ installé (`npm -v`)

### Commandes de Lancement

À la racine du projet (`KALA VOICE QA`) :

```bash
# 1. Lancer simultanément le Frontend et le Backend en une commande :
npm run dev:all

# OU séparément dans deux terminaux :
npm run dev:backend   # Lance le backend Express sur http://localhost:8000
npm run dev           # Lance le frontend Vite sur http://localhost:5173
```

L'application s'ouvre sur : **`http://localhost:5173`**  
Le backend REST répond sur : **`http://localhost:8000/api/health`**

---

## 4. Identifiants de Test & Profils Métiers

Tous les comptes de démonstration partagent le mot de passe : **`kala2024!`**

| Rôle | Utilisateur | Email | Missions & Vues associées |
|---|---|---|---|
| **ADMIN** | Alexandre Moreau | `a.moreau@kalavoice.ai` | CRUD Comptes, Assignation Rôles, Audit complet |
| **QA_MANAGER** | Claire Delattre | `c.delattre@kalavoice.ai` | Évaluations QA, Grilles de scoring, Appels critiques |
| **SUPERVISOR** | Marc Vasseur | `m.vasseur@kalavoice.ai` | Suivi plateau, Équipes, Registre des appels |
| **TRAINER** | Patrick Simon | `p.simon@kalavoice.ai` | Plans de coaching, Sessions formation, Uplift |
| **AGENT** | Jean Dupont | `j.dupont@kalavoice.ai` | Fiche 360°, Mes appels, Mes axes de progrès |
| **MANAGER** | Sophie Laurent | `s.laurent@kalavoice.ai` | Tableaux de bord exécutifs, Rapports financiers |

> **Astuce** : La modale de connexion (bouton **Connexion** en haut à droite) intègre des raccourcis en 1 clic pour basculer instantanément d'un profil à un autre.

---

## 5. Fonctionnalités Clés Prêtes à l'Emploi

### 👥 Gestion des Utilisateurs (CRUD)
* Située dans **Paramètres & Audit** > Onglet **Comptes Utilisateurs** (accès Administrateur).
* Permet de créer, éditer, changer de rôle, désactiver ou supprimer un compte.
* Protection anti-auto-suppression et synchronisation automatique avec l'API `/api/users`.

### 🎙️ Ingestion Audio Réelle & Pipeline ASR
* Située dans **Registre des Appels** > Bouton **Ingérer un Audio**.
* Supporte le glisser-déposer de fichiers audio réels (`.wav`, `.mp3`, `.m4a`).
* Lance automatiquement le découpage en segments, le calcul de WER estimé, l'assignation à un conseiller et à une campagne, et l'évaluation QA.

### 🔌 Connecteur Téléphonie CTI
* Situé dans **Équipes & Campagnes** > Onglet **Connecteur CTI**.
* Permet de configurer des webhooks (Genesys Cloud, Asterisk, Twilio Flex).
* Bouton **Simuler Appel Entrant** qui déclenche en direct la capture d'un flux audio avec logs console et notification d'équipe.

### 🔔 Centre d'Alertes & Notifications
* Accessible via l'icône de cloche dans la barre supérieure.
* Remonte automatiquement les appels à traiter d'urgence, les notes QA sous le seuil de 75%, et les retards de formation.

### 📊 Exportateurs
* Boutons **Exporter CSV** disponibles sur la liste des appels et des évaluations.
* Impression / Export PDF formaté via la fonction d'impression officielle du navigateur.

---

## 6. Prochaines Étapes Conseillées pour le Collaborateur

Si vous souhaitez étendre la plateforme :
1. **Vrai moteur Whisper local ou distant** :
   * Dans `backend/src/routes/calls.ts`, vous pouvez brancher l'upload de fichier sur l'API OpenAI Whisper (`POST https://api.openai.com/v1/audio/transcriptions`) ou un conteneur `faster-whisper` Python via child_process.
2. **WebSocket pour le live streaming CTI** :
   * Remplacer le polling de simulation CTI par un serveur `ws` ou `socket.io` pour du streaming audio en temps réel agent/client.
3. **Persistance des fichiers audios physiques** :
   * Configurer `multer` dans Express pour stocker les fichiers `.wav` dans un dossier `backend/uploads/` et streamer l'audio dans le `TranscriptionStudioView`.

---

*Document rédigé avec rigueur pour le projet KALA VOICE QA — Master 2 Big Data & IA.*
