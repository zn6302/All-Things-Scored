import type { VideoInfo } from '../hooks/useVideoLoader';

interface Props {
  audioReady: boolean;
  isPlaying: boolean;
  videoInfo: VideoInfo | null;
}

export function StatusBar({ audioReady, isPlaying, videoInfo }: Props) {
  const audioDotColor = audioReady ? 'var(--accent)' : '#fbbf24';
  const audioLabel = audioReady ? 'audio: ready' : 'audio: standby';

  const detectDotColor = isPlaying ? 'var(--accent)' : 'var(--accent3)';
  const detectLabel = isPlaying ? 'detection: active' : 'detection: off';

  let videoLabel = 'no video';
  if (videoInfo) {
    const shortName = videoInfo.name.substring(0, 20);
    videoLabel = videoInfo.width > 0
      ? `${shortName} · ${videoInfo.width}×${videoInfo.height}`
      : shortName;
  }

  return (
    <div id="status-bar">
      <div className="status-item">
        <div className="status-dot" style={{ background: audioDotColor }} />
        <span>{audioLabel}</span>
      </div>
      <div className="status-item">
        <div className="status-dot" style={{ background: detectDotColor }} />
        <span>{detectLabel}</span>
      </div>
      <div className="status-item" style={{ marginLeft: 'auto' }}>
        <span>{videoLabel}</span>
      </div>
    </div>
  );
}
