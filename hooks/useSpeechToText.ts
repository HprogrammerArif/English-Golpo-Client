// hooks/useSpeechToText.ts
import { useState, useEffect } from 'react';
import { 
  useAudioRecorder, 
  RecordingPresets, 
  requestRecordingPermissionsAsync, 
  getRecordingPermissionsAsync,
  setAudioModeAsync
} from 'expo-audio';

export const useSpeechToText = () => {
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Initialize the recorder hook
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await getRecordingPermissionsAsync();
        setPermissionStatus(status);
        
        // Configure default audio mode for playback
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch (err) {
        console.error('[useSpeechToText] Error checking permissions / setting audio mode:', err);
      }
    };
    checkPermission();
  }, []);

  const startRecording = async (): Promise<boolean> => {
    try {
      let status = permissionStatus;
      if (status !== 'granted') {
        const req = await requestRecordingPermissionsAsync();
        status = req.status;
        setPermissionStatus(status);
        if (status !== 'granted') return false;
      }

      // Configure audio mode to allow recording
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      // Prepare and start recording
      try {
        await recorder.prepareToRecordAsync();
      } catch (prepErr: any) {
        if (prepErr?.message?.includes("already been prepared")) {
          console.log('[useSpeechToText] Recorder already prepared, continuing.');
        } else {
          throw prepErr;
        }
      }
      recorder.record();
      setIsRecording(true);
      return true;
    } catch (err) {
      console.error('[useSpeechToText] Failed to start recording:', err);
      setIsRecording(false);
      return false;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      await recorder.stop();
      setIsRecording(false);
      
      // Reset audio mode to default (not recording, just playback)
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      return recorder.uri || null;
    } catch (err) {
      console.error('[useSpeechToText] Failed to stop recording:', err);
      setIsRecording(false);
      return null;
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    hasPermission: permissionStatus === 'granted',
  };
};
