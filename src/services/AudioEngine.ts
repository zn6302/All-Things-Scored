import * as Tone from 'tone';
import type { AudioConfig, NoteEvent, SnapValue } from '../types';
import { DEFAULT_AUDIO } from '../constants/defaults';
import { getNoteFromPosition } from '../utils/noteMapping';

class AudioEngine {
  private static instance: AudioEngine;

  private synth: Tone.PolySynth | null = null;
  private chorus: Tone.Chorus | null = null;
  private reverbNode: Tone.Reverb | null = null;
  private delayNode: Tone.FeedbackDelay | null = null;
  private volNode: Tone.Volume | null = null;
  private analyserNode: Tone.Analyser | null = null;

  private config: AudioConfig = { ...DEFAULT_AUDIO };
  private cooldowns: Map<number, number> = new Map();
  private ready = false;

  private constructor() {}

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  async init(): Promise<void> {
    if (this.synth) return;

    await Tone.start();

    this.volNode = new Tone.Volume(-8).toDestination();

    this.reverbNode = new Tone.Reverb({ decay: 5.0, wet: 0.55 });
    this.reverbNode.connect(this.volNode);

    this.delayNode = new Tone.FeedbackDelay({
      delayTime: '3/16' as Tone.Unit.Time,
      feedback: 0.28,
      wet: 0.3,
    });
    this.delayNode.connect(this.reverbNode);

    this.chorus = new Tone.Chorus({
      frequency: 2.5,
      delayTime: 2,
      depth: 0.4,
      wet: 0.35,
    });
    this.chorus.connect(this.delayNode);
    this.chorus.start();

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' as const },
      envelope: { attack: 0.08, decay: 0.5, sustain: 0.18, release: 3.0 },
    });
    this.synth.connect(this.chorus);

    this.analyserNode = new Tone.Analyser('waveform', 256);
    this.volNode.connect(this.analyserNode);

    await this.reverbNode.generate();

    // Apply any config values that were set before init
    this.volNode.volume.value = this.config.masterVolume;
    this.reverbNode.wet.value = this.config.reverbWet;
    this.delayNode.wet.value = this.config.delayWet;

    this.ready = true;
  }

  startTransport(): void {
    Tone.getTransport().start();
  }

  get isReady(): boolean {
    return this.ready;
  }

  get analyser(): Tone.Analyser | null {
    return this.analyserNode;
  }

  triggerNote(
    pos: number,
    total: number,
    intensity: number,
    onNote?: (e: NoteEvent) => void
  ): void {
    if (!this.synth || !this.ready) return;

    const key = Math.floor((pos / total) * 20);
    const now = Date.now();
    const lastTrigger = this.cooldowns.get(key) ?? 0;
    if (now - lastTrigger < 180) return;
    this.cooldowns.set(key, now);

    const note = getNoteFromPosition(
      pos,
      total,
      this.config.scaleName,
      this.config.octaveShift
    );
    const velocity = Math.min(1, 0.3 + (intensity / 255) * 0.7);

    const play = () => {
      this.synth!.triggerAttackRelease(note, '8n', undefined, velocity);
    };

    const transport = Tone.getTransport();
    if (this.config.snapEnabled && transport.state === 'started') {
      transport.scheduleOnce(() => play(), ('@' + this.config.snapValue) as Tone.Unit.TransportTime);
    } else {
      play();
    }

    if (onNote) {
      onNote({
        note,
        velocity,
        timestamp: now,
        position: pos / total,
      });
    }
  }

  setScale(scaleName: AudioConfig['scaleName']): void {
    this.config.scaleName = scaleName;
  }

  setOctaveShift(shift: number): void {
    this.config.octaveShift = shift;
  }

  setSnapEnabled(enabled: boolean): void {
    this.config.snapEnabled = enabled;
  }

  setSnapValue(value: SnapValue): void {
    this.config.snapValue = value;
  }

  setReverbWet(wet: number): void {
    this.config.reverbWet = wet;
    if (this.reverbNode) this.reverbNode.wet.value = wet;
  }

  setDelayWet(wet: number): void {
    this.config.delayWet = wet;
    if (this.delayNode) this.delayNode.wet.value = wet;
  }

  setMasterVolume(db: number): void {
    this.config.masterVolume = db;
    if (this.volNode) this.volNode.volume.value = db;
  }
}

export const audioEngine = AudioEngine.getInstance();
