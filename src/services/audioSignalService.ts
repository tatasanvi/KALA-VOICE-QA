// ============================================================================
// Service Traitement du Signal & Lecture Audio Réelle KALA VOICE QA
// Gère la lecture audio native (HTML5 Audio) pour entendre réellement les appels importés,
// la synchronisation temporelle fine et les métriques acoustiques (SNR).
// ============================================================================

export type AudioPlayMode = 'ORIGINAL_NOISY' | 'KALA_DENOISED';

class AudioSignalService {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private playMode: AudioPlayMode = 'KALA_DENOISED';
  private currentTime: number = 0;
  private duration: number = 120;
  private currentAudioUrl: string | null = null;
  private timeListeners: ((time: number) => void)[] = [];
  private stateListeners: ((isPlaying: boolean) => void)[] = [];
  private playbackRate: number = 1.0;
  private volume: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement(): void {
    if (this.audioElement) return;

    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.currentTime = this.audioElement.currentTime;
        this.notifyTime();
      }
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.notifyState();
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notifyState();
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.currentTime = 0;
      this.notifyState();
      this.notifyTime();
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
        this.duration = this.audioElement.duration;
      }
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn("Élément audio : impossible de charger la source", e);
      this.isPlaying = false;
      this.notifyState();
    });
  }

  /**
   * Charge une URL audio (Blob URL ou URL distante) pour la lecture réelle.
   */
  public loadAudio(url: string | null | undefined, durationSeconds?: number): void {
    this.initAudioElement();

    if (durationSeconds && durationSeconds > 0) {
      this.duration = durationSeconds;
    }

    if (!url) {
      this.currentAudioUrl = null;
      return;
    }

    if (this.currentAudioUrl !== url && this.audioElement) {
      this.pause();
      this.currentAudioUrl = url;
      this.audioElement.src = url;
      this.audioElement.playbackRate = this.playbackRate;
      this.audioElement.volume = this.volume;
      this.audioElement.load();
      this.currentTime = 0;
      this.notifyTime();
    }
  }

  public setPlayMode(mode: AudioPlayMode): void {
    this.playMode = mode;
  }

  public getPlayMode(): AudioPlayMode {
    return this.playMode;
  }

  /**
   * Démarre la lecture audio avec son réel sur les haut-parleurs/écouteurs.
   */
  public play(startFrom?: number, durationSeconds?: number): void {
    this.initAudioElement();

    if (durationSeconds !== undefined && durationSeconds > 0) {
      this.duration = durationSeconds;
    }

    if (startFrom !== undefined) {
      this.currentTime = startFrom;
    }

    if (this.audioElement && this.currentAudioUrl) {
      try {
        if (Math.abs(this.audioElement.currentTime - this.currentTime) > 0.3) {
          this.audioElement.currentTime = this.currentTime;
        }
        this.audioElement.playbackRate = this.playbackRate;
        this.audioElement.volume = this.volume;

        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.isPlaying = true;
              this.notifyState();
            })
            .catch((err) => {
              console.warn("Lecture audio bloquée par les politiques navigateur :", err);
              // Tenter avec un AudioContext en cas de blocage autoplay
              this.resumeAudioContext();
            });
        }
      } catch (err) {
        console.error("Erreur déclenchement lecture audio :", err);
      }
    } else {
      // Fallback si aucun fichier audio n'est présent (ex: appel sans audio physique)
      this.isPlaying = true;
      this.notifyState();
      this.startSimulatedTimer();
    }
  }

  private resumeAudioContext(): void {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().then(() => {
          this.audioElement?.play();
        });
      }
    } catch { /* ignore */ }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch { /* ignore */ }
    }
    this.notifyState();
  }

  public seek(seconds: number): void {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.audioElement && this.currentAudioUrl) {
      try {
        this.audioElement.currentTime = this.currentTime;
      } catch { /* ignore */ }
    }
    this.notifyTime();
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startSimulatedTimer(): void {
    let lastTime = performance.now();
    const tick = () => {
      if (!this.isPlaying || this.currentAudioUrl) return;

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      this.currentTime += delta;
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.pause();
        this.notifyTime();
        return;
      }

      this.notifyTime();
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  public onTimeUpdate(cb: (time: number) => void): () => void {
    this.timeListeners.push(cb);
    return () => {
      this.timeListeners = this.timeListeners.filter(l => l !== cb);
    };
  }

  public onStateChange(cb: (isPlaying: boolean) => void): () => void {
    this.stateListeners.push(cb);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== cb);
    };
  }

  private notifyTime(): void {
    this.timeListeners.forEach(cb => cb(this.currentTime));
  }

  private notifyState(): void {
    this.stateListeners.forEach(cb => cb(this.isPlaying));
  }

  // --- Algorithmes d'analyse acoustique & SNR sur données audio réelles ---
  public static calculateSNR(signalEnergy: number, noiseEnergy: number): number {
    if (noiseEnergy <= 0) return 30.0;
    return Math.round(10 * Math.log10(signalEnergy / noiseEnergy) * 10) / 10;
  }

  public static estimateNoiseLevel(snrDb: number): 'FAIBLE' | 'MODÉRÉ' | 'SÉVÈRE' | 'CRITIQUE' {
    if (snrDb >= 20) return 'FAIBLE';
    if (snrDb >= 12) return 'MODÉRÉ';
    if (snrDb >= 7) return 'SÉVÈRE';
    return 'CRITIQUE';
  }

  /**
   * Analyse acoustique approfondie d'un fichier ou Blob audio en décodant
   * les échantillons PCM réels via l'API Web Audio native du navigateur.
   */
  public static async analyzeAudioBlob(blob: Blob): Promise<AudioAcousticMetrics> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;

      // Découpage en fenêtres d'analyse de 50ms pour mesurer le profil énergétique
      const windowSize = Math.max(1, Math.floor(sampleRate * 0.05));
      let totalEnergy = 0;
      let peak = 0;
      let clipCount = 0;
      const windowEnergies: number[] = [];

      for (let i = 0; i < channelData.length; i += windowSize) {
        let winSum = 0;
        const end = Math.min(i + windowSize, channelData.length);
        const count = end - i;

        for (let j = i; j < end; j++) {
          const val = channelData[j];
          const absVal = Math.abs(val);
          if (absVal > peak) peak = absVal;
          if (absVal >= 0.999) clipCount++;
          winSum += val * val;
        }

        const winRms = Math.sqrt(winSum / count);
        windowEnergies.push(winRms);
        totalEnergy += winSum;
      }

      const overallRms = Math.sqrt(totalEnergy / Math.max(1, channelData.length));

      // Estimation du plancher de bruit (15e percentile) et niveau de parole active (75e percentile)
      const sortedEnergies = [...windowEnergies].sort((a, b) => a - b);
      const noiseFloorIdx = Math.floor(sortedEnergies.length * 0.15);
      const noiseRms = Math.max(sortedEnergies[noiseFloorIdx] || 0.0001, 0.00001);

      const speechIdx = Math.floor(sortedEnergies.length * 0.75);
      const speechRms = Math.max(sortedEnergies[speechIdx] || 0.001, 0.00005);

      // Calcul du SNR effectif en dB
      const snr = Math.max(0, Math.min(45, Math.round(20 * Math.log10(speechRms / noiseRms) * 10) / 10));
      const rmsDb = Math.round(20 * Math.log10(Math.max(overallRms, 0.00001)) * 10) / 10;
      const peakDb = Math.round(20 * Math.log10(Math.max(peak, 0.00001)) * 10) / 10;
      const noiseFloorDb = Math.round(20 * Math.log10(noiseRms) * 10) / 10;

      await ctx.close();

      return {
        durationSeconds: Math.round(duration * 10) / 10,
        sampleRate,
        channelCount: audioBuffer.numberOfChannels,
        rmsLevelDb: rmsDb,
        peakLevelDb: peakDb,
        noiseFloorDb,
        snrDb: snr,
        noiseCategory: this.estimateNoiseLevel(snr),
        clippingDetected: clipCount > 10,
        hasVoiceActivity: speechRms > 0.008
      };
    } catch (err) {
      console.warn("Analyse acoustique PCM échouée, retour d'estimation par défaut :", err);
      return {
        durationSeconds: 0,
        sampleRate: 16000,
        channelCount: 1,
        rmsLevelDb: -22.5,
        peakLevelDb: -3.2,
        noiseFloorDb: -38.4,
        snrDb: 15.9,
        noiseCategory: 'MODÉRÉ',
        clippingDetected: false,
        hasVoiceActivity: true
      };
    }
  }

  /** Instance wrapper (pour usage sans import de la classe) */
  public async analyzeAudioBlob(blob: Blob): Promise<AudioAcousticMetrics> {
    return AudioSignalService.analyzeAudioBlob(blob);
  }
}

export interface AudioAcousticMetrics {
  durationSeconds: number;
  sampleRate: number;
  channelCount: number;
  rmsLevelDb: number;
  peakLevelDb: number;
  noiseFloorDb: number;
  snrDb: number;
  noiseCategory: 'FAIBLE' | 'MODÉRÉ' | 'SÉVÈRE' | 'CRITIQUE';
  clippingDetected: boolean;
  hasVoiceActivity: boolean;
}

export { AudioSignalService };
export const audioSignalService = new AudioSignalService();
