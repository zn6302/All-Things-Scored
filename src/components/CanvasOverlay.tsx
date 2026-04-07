import React, { useRef, useEffect, useCallback } from 'react';
import type { LineMode, NoteEvent } from '../types';

interface Props {
  lineMode: LineMode;
  linePos: number;
  hasVideo: boolean;
  lastNoteEvent: NoteEvent | null;
  onLineDrag: (pos: number) => void;
}

function drawLineOnCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  lineMode: LineMode,
  linePos: number
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width;
  const h = canvas.height;

  ctx.save();
  ctx.strokeStyle = 'rgba(0,229,160,0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.shadowColor = '#00e5a0';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  if (lineMode === 'horizontal') {
    const y = (linePos / 100) * h;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  } else {
    const x = (linePos / 100) * w;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();
  ctx.restore();

  ctx.font = '9px Space Mono, monospace';
  ctx.fillStyle = 'rgba(0,229,160,0.6)';
  if (lineMode === 'horizontal') {
    ctx.fillText('TRIGGER ' + linePos + '%', 8, (linePos / 100) * h - 4);
  } else {
    ctx.fillText('TRIGGER ' + linePos + '%', (linePos / 100) * w + 4, 14);
  }
}

function flashLineOnCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  lineMode: LineMode,
  linePos: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,229,160,1)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([]);
  ctx.shadowColor = '#00e5a0';
  ctx.shadowBlur = 15;
  const w = canvas.width;
  const h = canvas.height;
  ctx.beginPath();
  if (lineMode === 'horizontal') {
    const y = (linePos / 100) * h;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  } else {
    const x = (linePos / 100) * w;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();
  ctx.restore();
}

export function CanvasOverlay({ lineMode, linePos, hasVideo, lastNoteEvent, onLineDrag }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const lineModeRef = useRef(lineMode);
  const linePosRef = useRef(linePos);

  // Keep refs in sync with props for use in event handlers
  useEffect(() => { lineModeRef.current = lineMode; }, [lineMode]);
  useEffect(() => { linePosRef.current = linePos; }, [linePos]);

  function getCtx(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
  }

  function redrawLine() {
    const c = getCtx();
    if (!c) return;
    drawLineOnCanvas(c.canvas, c.ctx, lineModeRef.current, linePosRef.current);
  }

  function getLinePosFromEvent(clientX: number, clientY: number, rect: DOMRect): number {
    if (lineModeRef.current === 'horizontal') {
      return ((clientY - rect.top) / rect.height) * 100;
    } else {
      return ((clientX - rect.left) / rect.width) * 100;
    }
  }

  function handleDrag(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const raw = getLinePosFromEvent(clientX, clientY, rect);
    const clamped = Math.max(5, Math.min(95, Math.round(raw)));
    onLineDrag(clamped);
  }

  // ResizeObserver to keep canvas pixel size matching display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawLine();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Redraw when lineMode/linePos/hasVideo changes
  useEffect(() => {
    redrawLine();
  }, [lineMode, linePos, hasVideo]);

  // Flash line when a note fires
  useEffect(() => {
    if (!lastNoteEvent) return;
    const c = getCtx();
    if (!c) return;
    flashLineOnCanvas(c.canvas, c.ctx, lineModeRef.current, linePosRef.current);
    const timer = setTimeout(() => redrawLine(), 120);
    return () => clearTimeout(timer);
  }, [lastNoteEvent]);

  // Touch events must be added imperatively to allow passive:false on touchmove
  const setupTouchHandlers = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      const touch = e.touches[0];
      handleDrag(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      handleDrag(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => { isDraggingRef.current = false; };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const canvasCallbackRef = useCallback((canvas: HTMLCanvasElement | null) => {
    (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = canvas;
    setupTouchHandlers(canvas);
  }, [setupTouchHandlers]);

  function onMouseDown(e: React.MouseEvent) {
    isDraggingRef.current = true;
    handleDrag(e.clientX, e.clientY);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDraggingRef.current) return;
    handleDrag(e.clientX, e.clientY);
  }

  function onMouseUp() { isDraggingRef.current = false; }
  function onMouseLeave() { isDraggingRef.current = false; }

  return (
    <canvas
      ref={canvasCallbackRef}
      id="overlay-canvas"
      className={lineMode === 'vertical' ? 'vert-mode' : ''}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  );
}
