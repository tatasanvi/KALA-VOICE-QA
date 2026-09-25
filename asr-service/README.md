# Service de transcription local (Whisper-small)

Service FastAPI qui transcrit un fichier audio avec `openai/whisper-small`
(bibliothèque transformers, CPU). Le signal est transcrit brut, sans débruitage.
Il n'écoute que sur `127.0.0.1` et n'est appelé que par le backend Express.

## Prérequis

- Python 3.12
- ffmpeg (`brew install ffmpeg`)

## Installation

```bash
cd asr-service
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Lancement

```bash
cd asr-service
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8500
```

## DeepFilterNet3 (comparaison facultative)

Même binaire et même modèle que le mémoire : `deep-filter` 0.5.6, option `-D`,
modèle ONNX `DeepFilterNet3_onnx.tar.gz` du paquet `deepfilternet-slim`
(installé par `requirements.txt`). Le mémoire utilisait la version Linux ; sur un
Mac Apple silicon, on installe la version native de la même release :

```bash
mkdir -p bin
curl -L -o bin/deep-filter https://github.com/Rikorose/DeepFilterNet/releases/download/v0.5.6/deep-filter-0.5.6-aarch64-apple-darwin
chmod +x bin/deep-filter
```

Si le binaire ou le modèle manque, la comparaison renvoie une erreur 503 :
aucun débruitage n'est simulé.

Le premier démarrage télécharge le modèle (environ 1 Go) depuis Hugging Face,
puis il est mis en cache.

## API

`POST /transcribe` (multipart) : champ `file` (audio, 25 Mo maximum), champ
`reference` optionnel (WER et CER calculés avec la normalisation du mémoire,
sinon `null`), champ `compare_dfn3=true` optionnel (voie B : DeepFilterNet3 à
48 kHz puis Whisper ; renvoie `denoised`, `wer_delta` et `enh_corr`, la
corrélation entre l'entrée et la sortie du débruiteur, signalée comme douteuse
sous 0,5).

Réponse :

```json
{"text": "...", "segments": [{"start": 0.0, "end": 4.2, "text": "..."}],
 "duration": 12.3, "processing_time": 5.1, "model": "whisper-small (transformers)"}
```

`GET /health` indique si le service est prêt.
