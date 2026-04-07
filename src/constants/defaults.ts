import type { DetectionConfig, AudioConfig } from '../types';

export const DEFAULT_DETECTION: DetectionConfig = {
  lineMode: 'horizontal',
  linePos: 50,
  sensitivity: 30,
};

export const DEFAULT_AUDIO: AudioConfig = {
  scaleName: 'pentatonic',
  octaveShift: 0,
  snapEnabled: true,
  snapValue: '8n',
  reverbWet: 0.55,
  delayWet: 0.3,
  masterVolume: -8,
};
