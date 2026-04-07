import { useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface Props {
  analyser: Tone.Analyser | null;
}

export function Visualizer({ analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number>(0);
  const analyserRef = useRef(analyser);

  useEffect(() => {
    analyserRef.current = analyser;
  }, [analyser]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      animIdRef.current = requestAnimationFrame(draw);
      if (!canvas || !ctx) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const currentAnalyser = analyserRef.current;

      if (!currentAnalyser) {
        // Animated sine-wave dots
        ctx.fillStyle = 'rgba(0,229,160,0.15)';
        const step = w / 32;
        for (let i = 0; i < 32; i++) {
          const y = h / 2 + Math.sin(Date.now() / 800 + i * 0.4) * 8;
          ctx.fillRect(i * step, y, step - 1, 1);
        }
        return;
      }

      // Live waveform
      const raw = currentAnalyser.getValue();
      const vals: Float32Array = Array.isArray(raw) ? raw[0] : raw;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,229,160,0.8)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < vals.length; i++) {
        const x = (i / vals.length) * w;
        const y = h / 2 + vals[i] * (h / 2) * 0.85;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    draw();

    return () => {
      cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  return (
    <div id="visualizer">
      <canvas ref={canvasRef} id="vis-canvas" />
    </div>
  );
}
