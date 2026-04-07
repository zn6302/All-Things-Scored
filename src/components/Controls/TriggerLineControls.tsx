import type { DetectionConfig } from '../../types';

interface Props {
  detection: DetectionConfig;
  onChange: (patch: Partial<DetectionConfig>) => void;
}

export function TriggerLineControls({ detection, onChange }: Props) {
  return (
    <div className="section">
      <div className="section-label">Trigger Line</div>
      <div className="line-mode-btns">
        <button
          className={`mode-btn${detection.lineMode === 'horizontal' ? ' active' : ''}`}
          onClick={() => onChange({ lineMode: 'horizontal' })}
        >
          — Horizontal
        </button>
        <button
          className={`mode-btn${detection.lineMode === 'vertical' ? ' active' : ''}`}
          onClick={() => onChange({ lineMode: 'vertical' })}
        >
          | Vertical
        </button>
      </div>
      <div className="control-row">
        <span className="control-label">Position</span>
        <span className="val-badge">{detection.linePos}%</span>
      </div>
      <div id="drag-hint">drag line on video to reposition</div>
      <div className="control-row" style={{ marginTop: '10px' }}>
        <span className="control-label">Sensitivity</span>
        <span className="val-badge">{detection.sensitivity}</span>
      </div>
      <input
        type="range"
        min={5}
        max={80}
        value={detection.sensitivity}
        onChange={e => onChange({ sensitivity: Number(e.target.value) })}
      />
    </div>
  );
}
