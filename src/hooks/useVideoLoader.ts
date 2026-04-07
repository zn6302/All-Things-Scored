import { useRef, useState } from 'react';

export interface VideoInfo {
  name: string;
  width: number;
  height: number;
}

export function useVideoLoader() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [hasVideo, setHasVideo] = useState(false);

  function loadVideo(file: File) {
    const video = videoRef.current;
    if (!video) return;

    const url = URL.createObjectURL(file);
    video.src = url;
    setHasVideo(true);
    setVideoInfo({ name: file.name, width: 0, height: 0 });

    video.onloadedmetadata = () => {
      setVideoInfo({
        name: file.name,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
  }

  function unloadVideo() {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = '';
      video.onloadedmetadata = null;
    }
    setHasVideo(false);
    setVideoInfo(null);
  }

  return { videoRef, videoInfo, hasVideo, loadVideo, unloadVideo };
}
