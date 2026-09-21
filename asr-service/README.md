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

Le premier démarrage télécharge le modèle (environ 1 Go) depuis Hugging Face,
puis il est mis en cache.

## API

`POST /transcribe` (multipart) : champ `file` (audio, 25 Mo maximum), champ
`reference` optionnel (réservé au calcul du WER, pas encore utilisé).

Réponse :

```json
{"text": "...", "segments": [{"start": 0.0, "end": 4.2, "text": "..."}],
 "duration": 12.3, "processing_time": 5.1, "model": "whisper-small (transformers)"}
```

`GET /health` indique si le service est prêt.
