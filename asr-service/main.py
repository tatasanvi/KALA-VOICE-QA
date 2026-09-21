"""Service local de transcription KALA VOICE QA.

Charge openai/whisper-small (transformers, CPU) une seule fois au démarrage et
expose POST /transcribe. Le signal est transcrit BRUT : aucun débruitage.
Aucune valeur n'est estimée ou inventée : le service ne renvoie que ce qu'il
calcule réellement (texte, segments horodatés, durée, temps de traitement).
"""
import subprocess
import time

import numpy as np
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from transformers import pipeline

MODEL_ID = "openai/whisper-small"
MODEL_LABEL = "whisper-small (transformers)"
SAMPLE_RATE = 16000
MAX_BYTES = 25 * 1024 * 1024

app = FastAPI(title="KALA ASR service")

asr = pipeline(
    "automatic-speech-recognition",
    model=MODEL_ID,
    device="cpu",
    dtype=torch.float32,
)


def decode_to_mono_16k(data: bytes) -> np.ndarray:
    """Décode n'importe quel format audio lisible par ffmpeg en float32 mono 16 kHz."""
    proc = subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-i", "pipe:0",
         "-ac", "1", "-ar", str(SAMPLE_RATE), "-f", "f32le", "pipe:1"],
        input=data, capture_output=True,
    )
    if proc.returncode != 0 or not proc.stdout:
        raise HTTPException(status_code=415, detail="Format audio non supporté ou fichier illisible.")
    return np.frombuffer(proc.stdout, dtype=np.float32)


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_LABEL}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), reference: str | None = Form(None)):
    # `reference` est accepté pour la tranche T2 (calcul du WER) mais pas encore utilisé.
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Fichier vide.")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux (25 Mo maximum).")

    audio = decode_to_mono_16k(data)
    duration = len(audio) / SAMPLE_RATE

    start = time.perf_counter()
    out = asr(
        {"raw": audio, "sampling_rate": SAMPLE_RATE},
        chunk_length_s=30,
        batch_size=1,
        return_timestamps=True,
        generate_kwargs={"language": "french", "task": "transcribe"},
    )
    processing_time = time.perf_counter() - start

    segments = []
    for chunk in out.get("chunks", []):
        s, e = chunk.get("timestamp", (None, None))
        text = chunk.get("text", "").strip()
        if text:
            segments.append({"start": s, "end": e, "text": text})

    return {
        "text": out.get("text", "").strip(),
        "segments": segments,
        "duration": round(duration, 2),
        "processing_time": round(processing_time, 2),
        "model": MODEL_LABEL,
    }
