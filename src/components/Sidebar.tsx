import type { DetectionConfig, AudioConfig, NoteEvent } from '../types';
import { TriggerLineControls } from './Controls/TriggerLineControls';
import { ScaleControls } from './Controls/ScaleControls';
import { FxControls } from './Controls/FxControls';

interface Props {
  detection: DetectionConfig;
  audio: AudioConfig;
  isPlaying: boolean;
  hasVideo: boolean;
  triggerCount: number;
  fps: number | null;
  lastNoteEvent: NoteEvent | null;
  onDetectionChange: (patch: Partial<DetectionConfig>) => void;
  onAudioChange: (patch: Partial<AudioConfig>) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onClearLine: () => void;
}

export function Sidebar({
  detection,
  audio,
  isPlaying,
  hasVideo,
  triggerCount,
  fps,
  lastNoteEvent,
  onDetectionChange,
  onAudioChange,
  onTogglePlay,
  onReset,
  onClearLine,
}: Props) {
  const playLabel = isPlaying ? '■ STOP' : '▶ PLAY + ACTIVATE';

  let lastNoteLabel = '—';
  let lastInfoLabel = 'pos: — · vel: —';
  if (lastNoteEvent) {
    lastNoteLabel = lastNoteEvent.note;
    lastInfoLabel = `pos: ${Math.round(lastNoteEvent.position * 100)}% · vel: ${lastNoteEvent.velocity.toFixed(2)}`;
  }

  return (
    <div id="sidebar">
      <TriggerLineControls detection={detection} onChange={onDetectionChange} />
      <ScaleControls audio={audio} onChange={onAudioChange} />
      <FxControls audio={audio} onChange={onAudioChange} />

      <div className="section" style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
        <button
          className="btn btn-primary"
          onClick={onTogglePlay}
          disabled={!hasVideo}
          style={{ opacity: hasVideo ? 1 : 0.5, cursor: hasVideo ? 'pointer' : 'not-allowed' }}
        >
          {playLabel}
        </button>
        <button className="btn btn-secondary" onClick={onClearLine}>
          CLEAR LINE
        </button>
        <button className="btn btn-danger" onClick={onReset}>
          RESET
        </button>
      </div>

      <div className="section">
        <div className="section-label">Last Triggered</div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '22px',
            color: 'var(--accent)',
            lineHeight: 1,
          }}
        >
          {lastNoteLabel}
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: 'var(--muted)',
            marginTop: '4px',
          }}
        >
          {lastInfoLabel}
        </div>
        <div
          style={{
            marginTop: '10px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
          }}
        >
          <div
            style={{
              background: 'rgba(0,229,160,0.05)',
              border: '1px solid rgba(0,229,160,0.1)',
              borderRadius: '6px',
              padding: '8px',
            }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--muted)' }}>
              TRIGGERS
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '16px', color: 'var(--text)' }}>
              {triggerCount}
            </div>
          </div>
          <div
            style={{
              background: 'rgba(123,92,255,0.05)',
              border: '1px solid rgba(123,92,255,0.1)',
              borderRadius: '6px',
              padding: '8px',
            }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--muted)' }}>
              FPS
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '16px', color: 'var(--text)' }}>
              {fps !== null ? fps : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
