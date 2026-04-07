import { useRef } from 'react';
import type { DetectionConfig, TriggerPoint } from '../types';
import { pixelDiff, updateBgModel } from '../utils/pixelMath';

export type TriggerCallback = (point: TriggerPoint) => void;

export function useMotionDetection() {
  const bgModelRef = useRef<Float32Array | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const offCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  function getOffscreen(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
    if (!offscreenRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      offscreenRef.current = canvas;
      offCtxRef.current = ctx;
    }
    return { canvas: offscreenRef.current, ctx: offCtxRef.current! };
  }

  function processFrame(
    video: HTMLVideoElement,
    config: DetectionConfig,
    onTrigger: TriggerCallback
  ): void {
    if (video.paused || video.ended || !video.videoWidth) return;

    const offscreen = getOffscreen();
    if (!offscreen) return;

    const { canvas: offCanvas, ctx: offCtx } = offscreen;
    const { lineMode, linePos, sensitivity } = config;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    if (lineMode === 'horizontal') {
      offCanvas.width = vw;
      offCanvas.height = 1;
      const sy = Math.floor((linePos / 100) * vh);
      offCtx.drawImage(video, 0, sy, vw, 1, 0, 0, vw, 1);
    } else {
      offCanvas.width = 1;
      offCanvas.height = vh;
      const sx = Math.floor((linePos / 100) * vw);
      offCtx.drawImage(video, sx, 0, 1, vh, 0, 0, 1, vh);
    }

    const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imageData.data;

    // First frame: initialize background model
    if (!bgModelRef.current || bgModelRef.current.length !== data.length) {
      bgModelRef.current = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        bgModelRef.current[i] = data[i];
      }
      return;
    }

    const bgModel = bgModelRef.current;
    const total = lineMode === 'horizontal' ? vw : vh;
    const STEP = 4;

    for (let i = 0; i < data.length; i += STEP * 4) {
      const diff = pixelDiff(data, bgModel, i);

      if (diff > sensitivity) {
        const pixelIndex = Math.floor(i / 4);
        onTrigger({ position: pixelIndex, total, intensity: diff });
        updateBgModel(bgModel, data, i, 0.01);
      } else {
        updateBgModel(bgModel, data, i, 0.06);
      }
    }
  }

  function resetModel(): void {
    bgModelRef.current = null;
  }

  return { processFrame, resetModel };
}
