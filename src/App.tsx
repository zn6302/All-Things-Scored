import { useState, useRef, useEffect, useCallback } from 'react';
import type { DetectionConfig, AudioConfig, NoteEvent, TriggerPoint } from './types';
import { DEFAULT_DETECTION, DEFAULT_AUDIO } from './constants/defaults';
import { audioEngine } from './services/AudioEngine';
import { useVideoLoader } from './hooks/useVideoLoader';
import { useMotionDetection } from './hooks/useMotionDetection';
import { useAudioEngine } from './hooks/useAudioEngine';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { CanvasOverlay } from './components/CanvasOverlay';
import { Visualizer } from './components/Visualizer';
import { StatusBar } from './components/StatusBar';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [detection, setDetection] = useState<DetectionConfig>({ ...DEFAULT_DETECTION });
  const [audio, setAudio] = useState<AudioConfig>({ ...DEFAULT_AUDIO });
  const [isPlaying, setIsPlaying] = useState(false);
  const [triggerCount, setTriggerCount] = useState(0);
  const [fps, setFps] = useState<number | null>(null);
  const [lastNoteEvent, setLastNoteEvent] = useState<NoteEvent | null>(null);
  const [flashNote, setFlashNote] = useState<string | null>(null);

  // Use a ref to avoid stale closures in the animation loop
  const detectionRef = useRef(detection);
  const animIdRef = useRef<number>(0);
  const fpsArrRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { detectionRef.current = detection; }, [detection]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const { videoRef, videoInfo, hasVideo, loadVideo, unloadVideo } = useVideoLoader();
  const { processFrame, resetModel } = useMotionDetection();
  const { isReady, analyser, init: initAudio } = useAudioEngine();

  const handleTrigger = useCallback((point: TriggerPoint) => {
    audioEngine.triggerNote(point.position, point.total, point.intensity, (noteEvent: NoteEvent) => {
      setLastNoteEvent(noteEvent);
      setTriggerCount(c => c + 1);

      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      setFlashNote(noteEvent.note);
      flashTimerRef.current = setTimeout(() => setFlashNote(null), 250);
    });
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isPlayingRef.current) return;

    const now = performance.now();
    if (lastFrameTimeRef.current > 0) {
      const dt = now - lastFrameTimeRef.current;
      fpsArrRef.current.push(1000 / dt);
      if (fpsArrRef.current.length > 20) fpsArrRef.current.shift();
      const avg = Math.round(
        fpsArrRef.current.reduce((a, b) => a + b, 0) / fpsArrRef.current.length
      );
      setFps(avg);
    }
    lastFrameTimeRef.current = now;

    processFrame(video, detectionRef.current, handleTrigger);
    animIdRef.current = requestAnimationFrame(loop);
  }, [processFrame, handleTrigger, videoRef]);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    if (!isPlaying) {
      await initAudio();
      setIsPlaying(true);
      isPlayingRef.current = true;
      video.play();
      lastFrameTimeRef.current = performance.now();
      animIdRef.current = requestAnimationFrame(loop);
    } else {
      setIsPlaying(false);
      isPlayingRef.current = false;
      video.pause();
      cancelAnimationFrame(animIdRef.current);
      setFps(null);
    }
  }

  function handleReset() {
    setIsPlaying(false);
    isPlayingRef.current = false;
    cancelAnimationFrame(animIdRef.current);
    fpsArrRef.current = [];
    setFps(null);
    setTriggerCount(0);
    setLastNoteEvent(null);
    setFlashNote(null);
    resetModel();
    unloadVideo();
    setDetection({ ...DEFAULT_DETECTION });
    setAudio({ ...DEFAULT_AUDIO });
  }

  function updateDetection(patch: Partial<DetectionConfig>) {
    setDetection(prev => {
      const next = { ...prev, ...patch };
      detectionRef.current = next;
      // Reset background model when trigger line position or mode changes
      if (patch.linePos !== undefined || patch.lineMode !== undefined) {
        resetModel();
      }
      return next;
    });
  }

  function updateAudio(patch: Partial<AudioConfig>) {
    setAudio(prev => {
      const next = { ...prev, ...patch };
      // Apply changes to audio engine
      if (patch.scaleName !== undefined) audioEngine.setScale(patch.scaleName);
      if (patch.octaveShift !== undefined) audioEngine.setOctaveShift(patch.octaveShift);
      if (patch.snapEnabled !== undefined) audioEngine.setSnapEnabled(patch.snapEnabled);
      if (patch.snapValue !== undefined) audioEngine.setSnapValue(patch.snapValue);
      if (patch.reverbWet !== undefined) audioEngine.setReverbWet(patch.reverbWet);
      if (patch.delayWet !== undefined) audioEngine.setDelayWet(patch.delayWet);
      if (patch.masterVolume !== undefined) audioEngine.setMasterVolume(patch.masterVolume);
      return next;
    });
  }

  function handleClearLine() {
    resetModel();
  }

  function handleLineDrag(pos: number) {
    updateDetection({ linePos: pos });
  }

  return (
    <div id="app">
      <Header />
      <div id="main">
        <div id="canvas-area">
          <VideoPlayer
            videoRef={videoRef}
            hasVideo={hasVideo}
            onFileSelect={loadVideo}
            flashNote={flashNote}
          />
          <CanvasOverlay
            lineMode={detection.lineMode}
            linePos={detection.linePos}
            hasVideo={hasVideo}
            lastNoteEvent={lastNoteEvent}
            onLineDrag={handleLineDrag}
          />
        </div>
        <Sidebar
          detection={detection}
          audio={audio}
          isPlaying={isPlaying}
          hasVideo={hasVideo}
          triggerCount={triggerCount}
          fps={fps}
          lastNoteEvent={lastNoteEvent}
          onDetectionChange={updateDetection}
          onAudioChange={updateAudio}
          onTogglePlay={togglePlay}
          onReset={handleReset}
          onClearLine={handleClearLine}
        />
      </div>
      <Visualizer analyser={analyser} />
      <StatusBar audioReady={isReady} isPlaying={isPlaying} videoInfo={videoInfo} />
    </div>
  );
}
