import React, { useRef } from 'react';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  hasVideo: boolean;
  onFileSelect: (file: File) => void;
  flashNote: string | null;
}

export function VideoPlayer({ videoRef, hasVideo, onFileSelect, flashNote }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // Reset value so same file can be selected again
    e.target.value = '';
  }

  return (
    <>
      <div id="upload-zone" className={hasVideo ? 'hidden' : ''} onClick={handleUploadClick}>
        <div className="upload-icon">
          <svg viewBox="0 0 24 24" strokeWidth="1.5">
            <polyline points="16,16 12,12 8,16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39,18.39A5,5,0,0,0,18,9h-1.26A8,8,0,1,0,3,16.3" />
          </svg>
        </div>
        <div className="upload-label">DROP VIDEO OR CLICK TO UPLOAD</div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.5 }}>mp4 · webm · mov</div>
      </div>

      <div id="video-container" className={hasVideo ? 'visible' : ''}>
        <video ref={videoRef} id="myVideo" loop muted playsInline />
        <div
          id="note-flash"
          style={{ opacity: flashNote ? 1 : 0 }}
        >
          {flashNote ?? ''}
        </div>
      </div>

      <input
        type="file"
        id="file-input"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
