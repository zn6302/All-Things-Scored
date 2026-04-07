import type { AudioConfig, SnapValue } from '../../types';
import { SCALE_LABELS } from '../../constants/scales';

interface Props {
  audio: AudioConfig;
  onChange: (patch: Partial<AudioConfig>) => void;
}

const SCALE_NAMES = Object.keys(SCALE_LABELS) as AudioConfig['scaleName'][];

export function ScaleControls({ audio, onChange }: Props) {
  // octaveShift = sliderValue - 2; sliderValue in [1,2,3]
  const sliderValue = audio.octaveShift + 2;
  const baseOctaveLow = 3 + audio.octaveShift;
  const baseOctaveHigh = 5 + audio.octaveShift;
  const octaveLabel = `${baseOctaveLow}–${baseOctaveHigh}`;

  return (
    <div className="section">
      <div className="section-label">Musical Scale</div>
      <select
        value={audio.scaleName}
        onChange={e => onChange({ scaleName: e.target.value as AudioConfig['scaleName'] })}
        style={{ marginBottom: '10px' }}
      >
        {SCALE_NAMES.map(name => (
          <option key={name} value={name}>{SCALE_LABELS[name]}</option>
        ))}
      </select>
      <div className="control-row">
        <span className="control-label">Octave Range</span>
        <span className="val-badge">{octaveLabel}</span>
      </div>
      <input
        type="range"
        min={1}
        max={3}
        step={1}
        value={sliderValue}
        onChange={e => onChange({ octaveShift: Number(e.target.value) - 2 })}
      />
      <div className="control-row">
        <span className="control-label">Rhythmic Snap</span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={audio.snapEnabled}
            onChange={e => onChange({ snapEnabled: e.target.checked })}
          />
          <span className="toggle-slider" />
        </label>
      </div>
      <select
        value={audio.snapValue}
        onChange={e => onChange({ snapValue: e.target.value as SnapValue })}
        style={{ marginTop: '6px' }}
      >
        <option value="8n">1/8 note</option>
        <option value="16n">1/16 note</option>
        <option value="4n">1/4 note</option>
      </select>
    </div>
  );
}
