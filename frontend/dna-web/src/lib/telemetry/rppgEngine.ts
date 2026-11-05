/**
 * SkillMatch DNA v7.0 - Web Canvas / WebGPU rPPG Signal Engine
 * Simulates green-channel facial skin blood volume pulse extraction,
 * pupil diameter variance (pupillometry), and acoustic voice jitter estimation.
 */

export interface RPPGFrameSample {
  timestamp: number;
  greenIntensityNormalized: number;
  filteredPulseWave: number;
  estimatedHeartRateBpm: number;
  hrvRmssdMs: number;
  pupilDilationMm: number;
  acousticJitterPercent: number;
}

export class RPPGSignalProcessor {
  private bufferSize: number;
  private pulseBuffer: number[] = [];
  private phase: number = 0;

  constructor(bufferSize: number = 128) {
    this.bufferSize = bufferSize;
  }

  /**
   * Generates a realistic synthetic rPPG blood volume pulse frame
   * under given cognitive load and stress levels.
   */
  public generateNextSample(stressLevel: number = 0.25): RPPGFrameSample {
    const now = Date.now();
    this.phase += 0.12 + (stressLevel * 0.05);

    // Dicrotic notch cardiac pulse simulation
    const systolic = Math.sin(this.phase);
    const dicrotic = 0.35 * Math.sin(this.phase * 2 + 0.5);
    const rawPulse = systolic + dicrotic + (Math.random() * 0.04 - 0.02);

    this.pulseBuffer.push(rawPulse);
    if (this.pulseBuffer.length > this.bufferSize) {
      this.pulseBuffer.shift();
    }

    const baselineBpm = 68.0 + (stressLevel * 24.0);
    const hrvRmssd = Math.max(28.0, 65.0 - (stressLevel * 25.0));
    const pupilDilation = 3.0 + (stressLevel * 1.4) + (Math.sin(now / 1500) * 0.2);
    const acousticJitter = 0.6 + (stressLevel * 0.9) + (Math.random() * 0.1);

    return {
      timestamp: now,
      greenIntensityNormalized: 0.52 + (rawPulse * 0.08),
      filteredPulseWave: rawPulse,
      estimatedHeartRateBpm: Math.round(baselineBpm * 10) / 10,
      hrvRmssdMs: Math.round(hrvRmssd * 10) / 10,
      pupilDilationMm: Math.round(pupilDilation * 100) / 100,
      acousticJitterPercent: Math.round(acousticJitter * 100) / 100
    };
  }

  /**
   * Renders the real-time photoplethysmogram waveform onto an HTML Canvas element
   */
  public renderWaveform(canvas: HTMLCanvasElement, samples: number[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (samples.length < 2) return;

    // Glowing cardiac pulse line
    ctx.strokeStyle = '#10B981'; // Bio-Emerald
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 10;
    ctx.beginPath();

    const step = width / (samples.length - 1);
    const centerY = height / 2;
    const scaleY = height * 0.38;

    samples.forEach((sample, idx) => {
      const x = idx * step;
      const y = centerY - (sample * scaleY);
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
