// hooks/useAudioSync.ts
import { useState, useEffect } from 'react';

export interface TimestampMapping {
  startTime: number;
  endTime: number;
  sentenceIdx: number;
}

export const useAudioSync = (
  playbackSec: number,
  timestampMapping: TimestampMapping[]
) => {
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(-1);

  useEffect(() => {
    if (!timestampMapping || timestampMapping.length === 0) {
      setActiveSentenceIdx(-1);
      return;
    }

    const currentIdx = timestampMapping.findIndex(
      (mapping) => playbackSec >= mapping.startTime && playbackSec <= mapping.endTime
    );

    setActiveSentenceIdx(currentIdx);
  }, [playbackSec, timestampMapping]);

  return activeSentenceIdx;
};
