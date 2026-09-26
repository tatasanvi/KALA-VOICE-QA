// =============================================================================
// KALA VOICE QA — Service de Stockage Audio Local (IndexedDB)
// Persistance réelle des fichiers audio importés (MP3, WAV, M4A, OGG, FLAC)
// Permet la réécoute audio même après actualisation de la page.
// =============================================================================

const DB_NAME = 'kala_voice_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_recordings';

class AudioStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private urlCache: Map<string, string> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error("IndexedDB non disponible dans cet environnement."));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Enregistre un fichier ou Blob audio sous l'identifiant de l'appel.
   */
  public async saveAudio(callId: string, audioBlob: Blob | File): Promise<string> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(audioBlob, callId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      // Créer et mettre en cache l'URL Blob
      const objectUrl = URL.createObjectURL(audioBlob);
      this.urlCache.set(callId, objectUrl);
      return objectUrl;
    } catch (err) {
      console.warn("Échec d'enregistrement IndexedDB, fallback mémoire :", err);
      const objectUrl = URL.createObjectURL(audioBlob);
      this.urlCache.set(callId, objectUrl);
      return objectUrl;
    }
  }

  /**
   * Récupère le Blob audio associé à l'appel.
   */
  public async getAudioBlob(callId: string): Promise<Blob | null> {
    try {
      const db = await this.getDB();
      return await new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(callId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  /**
   * Récupère ou génère une URL de lecture pour l'appel.
   */
  public async getAudioUrl(callId: string): Promise<string | null> {
    // 1. En cache mémoire
    if (this.urlCache.has(callId)) {
      return this.urlCache.get(callId)!;
    }

    // 2. Depuis IndexedDB
    const blob = await this.getAudioBlob(callId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      this.urlCache.set(callId, url);
      return url;
    }

    return null;
  }

  /**
   * Supprime un enregistrement audio.
   */
  public async deleteAudio(callId: string): Promise<void> {
    if (this.urlCache.has(callId)) {
      try {
        URL.revokeObjectURL(this.urlCache.get(callId)!);
      } catch { /* ignore */ }
      this.urlCache.delete(callId);
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(callId);
    } catch { /* ignore */ }
  }
}

export const audioStorageService = new AudioStorageService();
