import type { ScaleName } from '../types';
import { SCALES } from '../constants/scales';

export function getNoteFromPosition(
  pos: number,
  total: number,
  scaleName: ScaleName,
  octaveShift: number
): string {
  const scale = SCALES[scaleName];
  const idx = Math.min(
    Math.floor((pos / total) * scale.length),
    scale.length - 1
  );
  const note = scale[idx];
  if (octaveShift === 0) return note;
  const match = note.match(/([A-Gb#]+)(\d+)/);
  if (!match) return note;
  return match[1] + (parseInt(match[2]) + octaveShift);
}
