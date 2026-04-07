import type { ScaleName } from '../types';

export const SCALES: Record<ScaleName, string[]> = {
  pentatonic: ['C3', 'E3', 'G3', 'A3', 'C4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5'],
  lydian:     ['F3', 'G3', 'A3', 'B3', 'C#4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C#5'],
  dorian:     ['D3', 'F3', 'G3', 'A3', 'C4', 'D4', 'F4', 'G4', 'A4', 'C5', 'D5'],
  blues:      ['A2', 'C3', 'D3', 'Eb3', 'E3', 'G3', 'A3', 'C4', 'D4', 'Eb4', 'E4', 'G4'],
  whole:      ['C3', 'D3', 'E3', 'F#3', 'Ab3', 'Bb3', 'C4', 'D4', 'E4', 'F#4', 'Ab4', 'Bb4'],
};

export const SCALE_LABELS: Record<ScaleName, string> = {
  pentatonic: 'C Major Pentatonic',
  lydian:     'F# Lydian',
  dorian:     'D Dorian',
  blues:      'A Blues',
  whole:      'Whole Tone',
};
