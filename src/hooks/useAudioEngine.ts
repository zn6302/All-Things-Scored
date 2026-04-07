import { useState } from 'react';
import * as Tone from 'tone';
import { audioEngine } from '../services/AudioEngine';

export function useAudioEngine() {
  const [isReady, setIsReady] = useState(false);

  async function init(): Promise<void> {
    await audioEngine.init();
    audioEngine.startTransport();
    setIsReady(true);
  }

  return {
    isReady,
    analyser: audioEngine.analyser as Tone.Analyser | null,
    init,
  };
}
