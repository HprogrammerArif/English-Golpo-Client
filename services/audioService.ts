// services/audioService.ts
let AudioModule: typeof import('expo-av').Audio | null = null;
try {
  AudioModule = require('expo-av').Audio;
} catch {
  console.warn('[audioService] expo-av native module is not available. Playback controls will be disabled.');
}

export class AudioService {
  private sound: any = null;
  private onStatusUpdateCallback: ((status: any) => void) | null = null;

  async load(uri: string, onStatusUpdate: (status: any) => void): Promise<boolean> {
    if (!AudioModule) return false;
    
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      this.onStatusUpdateCallback = onStatusUpdate;

      const { sound: newSound } = await AudioModule.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = newSound;
      return true;
    } catch (err) {
      console.error('[AudioService] Failed to load audio:', err);
      return false;
    }
  }

  private onPlaybackStatusUpdate(status: any) {
    if (this.onStatusUpdateCallback) {
      this.onStatusUpdateCallback(status);
    }
  }

  async play() {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
    }
  }

  async setPosition(millis: number) {
    if (this.sound) {
      await this.sound.setPositionAsync(millis);
    }
  }

  async skipForward(seconds = 10) {
    if (!this.sound) return;
    const status = await this.sound.getStatusAsync();
    if (status.isLoaded) {
      const target = Math.min(status.durationMillis || 0, status.positionMillis + (seconds * 1000));
      await this.sound.setPositionAsync(target);
    }
  }

  async skipBackward(seconds = 10) {
    if (!this.sound) return;
    const status = await this.sound.getStatusAsync();
    if (status.isLoaded) {
      const target = Math.max(0, status.positionMillis - (seconds * 1000));
      await this.sound.setPositionAsync(target);
    }
  }

  async unload() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
      this.onStatusUpdateCallback = null;
    }
  }
}

export const audioService = new AudioService();
