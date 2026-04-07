import type { AudioConfig } from '../../types';

interface Props {
  audio: AudioConfig;
  onChange: (patch: Partial<AudioConfig>) => void;
}

export function FxControls({ audio, onChange }: Props) {
  return (
    <div className="section">
      <div className="section-label">FX Chain</div>
      <div className="control-row">
        <span className="control-label">Reverb Size</span>
        <span className="val-badge">{audio.reverbWet.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={audio.reverbWet}
        onChange={e => onChange({ reverbWet: Number(e.target.value) })}
      />
      <div className="control-row">
        <span className="control-label">Delay Time</span>
        <span className="val-badge">{audio.delayWet.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={audio.delayWet}
        onChange={e => onChange({ delayWet: Number(e.target.value) })}
      />
      <div className="control-row">
        <span className="control-label">Master Vol</span>
        <span className="val-badge">{audio.masterVolume}</span>
      </div>
      <input
        type="range"
        min={-30}
        max={0}
        step={1}
        value={audio.masterVolume}
        onChange={e => onChange({ masterVolume: Number(e.target.value) })}
      />
    </div>
  );
}
