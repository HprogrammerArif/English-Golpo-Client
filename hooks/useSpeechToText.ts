// hooks/useSpeechToText.ts
import { useState, useEffect } from 'react';

let AudioModule: typeof import('expo-av').Audio | null = null;
try {
  AudioModule = require('expo-av').Audio;
} catch {
  console.warn('[useSpeechToText] expo-av native module not available.');
}

export const useSpeechToText = () => {
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, setPermissionResponse] = useState<any>(null);

  useEffect(() => {
    if (!AudioModule) return;

    const getPermission = async () => {
      try {
        const response = await AudioModule.getPermissionsAsync();
        setPermissionResponse(response);
      } catch (err) {
        console.error('[useSpeechToText] Error getting audio permissions:', err);
      }
    };
    getPermission();
  }, []);

  const startRecording = async (): Promise<boolean> => {
    if (!AudioModule) {
      console.warn('Audio module not loaded.');
      return false;
    }

    try {
      if (permissionResponse?.status !== 'granted') {
        const req = await AudioModule.requestPermissionsAsync();
        setPermissionResponse(req);
        if (req.status !== 'granted') return false;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await AudioModule.Recording.createAsync(
        AudioModule.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      return true;
    } catch (err) {
      console.error('[useSpeechToText] Failed to start recording:', err);
      return false;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!recording) return null;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      return uri;
    } catch (err) {
      console.error('[useSpeechToText] Failed to stop recording:', err);
      setRecording(null);
      return null;
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    hasPermission: permissionResponse?.status === 'granted',
  };
};
