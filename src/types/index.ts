export type LineMode = 'horizontal' | 'vertical';
export type ScaleName = 'pentatonic' | 'lydian' | 'dorian' | 'blues' | 'whole';
export type SnapValue = '4n' | '8n' | '16n';

export interface TriggerPoint {
  position: number;   // pixel index along trigger line
  total: number;      // total pixels on that line
  intensity: number;  // 0–255 avg pixel diff
}

export interface NoteEvent {
  note: string;
  velocity: number;
  timestamp: number;
  position: number;   // 0–1 normalized
}

export interface DetectionConfig {
  lineMode: LineMode;
  linePos: number;
  sensitivity: number;
}

export interface AudioConfig {
  scaleName: ScaleName;
  octaveShift: number;
  snapEnabled: boolean;
  snapValue: SnapValue;
  reverbWet: number;
  delayWet: number;
  masterVolume: number;
}
