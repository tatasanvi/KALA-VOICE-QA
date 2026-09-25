"""Service local de transcription KALA VOICE QA.

Charge openai/whisper-small (transformers, CPU) une seule fois au démarrage et
expose POST /transcribe. Le signal est transcrit BRUT : aucun débruitage.
Aucune valeur n'est estimée ou inventée : le service ne renvoie que ce qu'il
calcule réellement (texte, segments horodatés, durée, temps de traitement, et
WER/CER normalisés comme dans le mémoire lorsqu'une référence est fournie).
"""
import os
import subprocess
import tempfile
import time
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from transformers import pipeline

from metrics import wer_cer

MODEL_ID = "openai/whisper-small"
MODEL_LABEL = "whisper-small (transformers)"
SAMPLE_RATE = 16000
DFN_SAMPLE_RATE = 48000
MAX_BYTES = 25 * 1024 * 1024

# DeepFilterNet3, comme dans le mémoire : binaire officiel deep-filter 0.5.6
# (build natif macOS de la même version), option -D, modèle ONNX du paquet
# deepfilternet-slim, entrée WAV PCM 16 bits à 48 kHz.
HERE = Path(__file__).resolve().parent
DEEPFILTER_BIN = Path(os.environ.get("DEEPFILTER_BIN", HERE / "bin" / "deep-filter"))
DFN3_VERSION = "deep-filter 0.5.6"
# Seuil de validité du débruitage : corrélation minimale entre entrée et sortie.
ENH_CORR_MIN = 0.5


def _dfn3_model_path() -> Path | None:
    try:
        import deepfilternet_slim
    except ImportError:
        return None
    p = Path(deepfilternet_slim.__file__).parent / "_models" / "DeepFilterNet3_onnx.tar.gz"
    return p if p.exists() else None


DFN3_MODEL = _dfn3_model_path()

app = FastAPI(title="KALA ASR service")

asr = pipeline(
    "automatic-speech-recognition",
    model=MODEL_ID,
    device="cpu",
    dtype=torch.float32,
)


def decode_mono(data: bytes, sr: int = SAMPLE_RATE) -> np.ndarray:
    """Décode n'importe quel format audio lisible par ffmpeg en float32 mono à la fréquence demandée."""
    proc = subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-i", "pipe:0",
         "-ac", "1", "-ar", str(sr), "-f", "f32le", "pipe:1"],
        input=data, capture_output=True,
    )
    if proc.returncode != 0 or not proc.stdout:
        raise HTTPException(status_code=415, detail="Format audio non supporté ou fichier illisible.")
    return np.frombuffer(proc.stdout, dtype=np.float32)


def run_whisper(audio16: np.ndarray, reference: str | None) -> dict:
    """Transcrit un signal float32 mono 16 kHz et calcule WER/CER si une référence est fournie."""
    start = time.perf_counter()
    out = asr(
        {"raw": audio16, "sampling_rate": SAMPLE_RATE},
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

    text = out.get("text", "").strip()
    result = {
        "text": text,
        "segments": segments,
        "processing_time": round(processing_time, 2),
        "wer": None,
        "cer": None,
        "reference_normalized": None,
        "hypothesis_normalized": None,
    }
    # WER/CER uniquement si une référence est fournie : jamais estimés.
    if reference and reference.strip():
        w, c, ref_n, hyp_n = wer_cer(reference, text)
        result.update({"wer": w, "cer": c, "reference_normalized": ref_n, "hypothesis_normalized": hyp_n})
    return result


def denoise_dfn3(audio48: np.ndarray) -> tuple[np.ndarray, float, float]:
    """Applique réellement DeepFilterNet3 ; renvoie (signal 48 kHz débruité, corrélation entrée/sortie, durée)."""
    if not DEEPFILTER_BIN.exists() or DFN3_MODEL is None:
        raise HTTPException(status_code=503, detail="DeepFilterNet3 indisponible : binaire deep-filter ou modèle absent.")
    start = time.perf_counter()
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "input.wav"
        out_dir = Path(tmp) / "out"
        out_dir.mkdir()
        sf.write(src, audio48, DFN_SAMPLE_RATE, subtype="PCM_16")
        proc = subprocess.run(
            [str(DEEPFILTER_BIN), "-D", "-m", str(DFN3_MODEL), "-o", str(out_dir), str(src)],
            capture_output=True, text=True,
        )
        out_path = out_dir / src.name
        if proc.returncode != 0 or not out_path.exists():
            raise HTTPException(status_code=500, detail="DeepFilterNet3 a échoué sur ce fichier.")
        enhanced, _ = sf.read(out_path, dtype="float32")
        reference_in, _ = sf.read(src, dtype="float32")
    n = min(len(reference_in), len(enhanced))
    corr = float(np.corrcoef(reference_in[:n], enhanced[:n])[0, 1]) if n > 1 else float("nan")
    return enhanced, corr, time.perf_counter() - start


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_LABEL,
            "dfn3_available": DEEPFILTER_BIN.exists() and DFN3_MODEL is not None}


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    reference: str | None = Form(None),
    compare_dfn3: bool = Form(False),
):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Fichier vide.")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux (25 Mo maximum).")

    if not compare_dfn3:
        # Voie A seule : signal brut décodé directement à 16 kHz.
        audio16 = decode_mono(data, SAMPLE_RATE)
        result = run_whisper(audio16, reference)
        result.update({"duration": round(len(audio16) / SAMPLE_RATE, 2), "model": MODEL_LABEL,
                       "denoised": None, "wer_delta": None})
        return result

    # Comparaison, comme dans le mémoire : signal à 48 kHz, voie A = signal brut
    # ramené à 16 kHz, voie B = DeepFilterNet3 à 48 kHz puis ramené à 16 kHz.
    audio48 = decode_mono(data, DFN_SAMPLE_RATE)
    raw16 = librosa.resample(audio48, orig_sr=DFN_SAMPLE_RATE, target_sr=SAMPLE_RATE).astype(np.float32)
    enhanced48, enh_corr, denoise_time = denoise_dfn3(audio48)
    enh16 = librosa.resample(enhanced48, orig_sr=DFN_SAMPLE_RATE, target_sr=SAMPLE_RATE).astype(np.float32)

    result = run_whisper(raw16, reference)
    b = run_whisper(enh16, reference)
    b.update({
        "denoiser": DFN3_VERSION + " (DeepFilterNet3, -D)",
        "denoise_time": round(denoise_time, 2),
        "enh_corr": round(enh_corr, 3) if np.isfinite(enh_corr) else None,
        "enh_ok": bool(np.isfinite(enh_corr) and enh_corr >= ENH_CORR_MIN),
    })
    result.update({
        "duration": round(len(audio48) / DFN_SAMPLE_RATE, 2),
        "model": MODEL_LABEL,
        "denoised": b,
        "wer_delta": (b["wer"] - result["wer"]) if (b["wer"] is not None and result["wer"] is not None) else None,
    })
    return result
